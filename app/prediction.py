"""LSTM next-price prediction.

Trains a small per-item LSTM on the item's recent `high` price history and
saves it to MODEL_DIR. Models are retrained lazily when older than RETRAIN_AFTER.

Train from the command line (run from app/):
    python prediction.py 4151 11832
"""
import argparse
import datetime
import logging
import os
import threading

import numpy as np
import torch
from torch import nn
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import SessionLocal

logger = logging.getLogger(__name__)

MODEL_DIR = os.getenv("MODEL_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_models"))
SEQ_LEN = 24          # 24 polls x 5 min = 2 hours of context
MAX_POINTS = 2000     # most recent polls used for training
MIN_POINTS = SEQ_LEN + 16
HIDDEN_SIZE = 32
EPOCHS = 60
LEARNING_RATE = 1e-2
RETRAIN_AFTER = datetime.timedelta(hours=1)

_locks: dict[int, threading.Lock] = {}
_locks_guard = threading.Lock()


class InsufficientDataError(Exception):
    pass


class PriceLSTM(nn.Module):
    def __init__(self, hidden_size: int = HIDDEN_SIZE):
        super().__init__()
        self.lstm = nn.LSTM(input_size=1, hidden_size=hidden_size, batch_first=True)
        self.head = nn.Linear(hidden_size, 1)

    def forward(self, x):
        # Predict the change from the last observed value, so an untrained
        # model degrades to "price stays the same" rather than noise.
        out, _ = self.lstm(x)
        return x[:, -1] + self.head(out[:, -1])


def _model_path(item_id: int) -> str:
    return os.path.join(MODEL_DIR, f"{item_id}.pt")


def _item_lock(item_id: int) -> threading.Lock:
    with _locks_guard:
        return _locks.setdefault(item_id, threading.Lock())


def load_prices(db: Session, item_id: int):
    """Return (highs oldest->newest as float32 array, latest polled_at)."""
    sql = text("""
        SELECT polled_at, high FROM (
            SELECT polled_at, high
            FROM prices
            WHERE item_id = :item_id
              AND high IS NOT NULL
            ORDER BY polled_at DESC
            LIMIT :limit
        ) recent
        ORDER BY polled_at
    """)
    rows = db.execute(sql, {"item_id": item_id, "limit": MAX_POINTS}).all()
    highs = np.asarray([row.high for row in rows], dtype=np.float32)
    last_polled_at = rows[-1].polled_at if rows else None
    return highs, last_polled_at


def _normalize(highs: np.ndarray, mean: float, std: float) -> np.ndarray:
    return (np.log(highs) - mean) / std


def _denormalize(value: float, mean: float, std: float) -> float:
    return float(np.exp(value * std + mean))


def train_model(db: Session, item_id: int) -> dict:
    highs, _ = load_prices(db, item_id)
    if len(highs) < MIN_POINTS:
        raise InsufficientDataError(f"Need at least {MIN_POINTS} price points, have {len(highs)}")

    log_highs = np.log(highs)
    mean = float(log_highs.mean())
    std = float(log_highs.std()) or 1.0
    series = _normalize(highs, mean, std)

    windows = np.lib.stride_tricks.sliding_window_view(series, SEQ_LEN)
    x = torch.tensor(windows[:-1].copy()).unsqueeze(-1)
    y = torch.tensor(series[SEQ_LEN:].copy()).unsqueeze(-1)

    torch.manual_seed(0)
    model = PriceLSTM()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)
    loss_fn = nn.MSELoss()

    model.train()
    for _ in range(EPOCHS):
        optimizer.zero_grad()
        loss = loss_fn(model(x), y)
        loss.backward()
        optimizer.step()

    checkpoint = {
        "state_dict": model.state_dict(),
        "mean": mean,
        "std": std,
        "seq_len": SEQ_LEN,
        "hidden_size": HIDDEN_SIZE,
        "n_samples": len(x),
        "final_loss": float(loss.item()),
        "trained_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

    os.makedirs(MODEL_DIR, exist_ok=True)
    tmp_path = _model_path(item_id) + ".tmp"
    torch.save(checkpoint, tmp_path)
    os.replace(tmp_path, _model_path(item_id))
    logger.info(f"Trained model for item {item_id} on {len(x)} samples (loss {checkpoint['final_loss']:.5f})")
    return checkpoint


def load_checkpoint(item_id: int) -> dict | None:
    path = _model_path(item_id)
    if not os.path.exists(path):
        return None
    return torch.load(path, weights_only=True)


def _is_stale(checkpoint: dict) -> bool:
    if checkpoint.get("seq_len") != SEQ_LEN or checkpoint.get("hidden_size") != HIDDEN_SIZE:
        return True
    trained_at = datetime.datetime.fromisoformat(checkpoint["trained_at"])
    return datetime.datetime.now(datetime.timezone.utc) - trained_at > RETRAIN_AFTER


def predict_next(db: Session, item_id: int) -> dict:
    """Predict the item's next polled high price, training/retraining if needed."""
    highs, last_polled_at = load_prices(db, item_id)
    if len(highs) < MIN_POINTS:
        raise InsufficientDataError(f"Need at least {MIN_POINTS} price points, have {len(highs)}")

    checkpoint = load_checkpoint(item_id)
    if checkpoint is None or _is_stale(checkpoint):
        with _item_lock(item_id):
            # Another request may have retrained while we waited on the lock.
            checkpoint = load_checkpoint(item_id)
            if checkpoint is None or _is_stale(checkpoint):
                checkpoint = train_model(db, item_id)

    model = PriceLSTM(checkpoint["hidden_size"])
    model.load_state_dict(checkpoint["state_dict"])
    model.eval()

    mean, std = checkpoint["mean"], checkpoint["std"]
    window = _normalize(highs[-SEQ_LEN:], mean, std)
    with torch.no_grad():
        pred = model(torch.tensor(window.copy()).view(1, SEQ_LEN, 1)).item()

    return {
        "item_id": item_id,
        "predicted_high": round(_denormalize(pred, mean, std)),
        "last_high": int(highs[-1]),
        "last_polled_at": last_polled_at,
        "model_trained_at": checkpoint["trained_at"],
    }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser(description="Train LSTM price models")
    parser.add_argument("item_ids", type=int, nargs="+")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        for item_id in args.item_ids:
            try:
                train_model(db, item_id)
                print(predict_next(db, item_id))
            except InsufficientDataError as e:
                logger.warning(f"Skipping item {item_id}: {e}")
    finally:
        db.close()
