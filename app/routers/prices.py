from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import Price

router = APIRouter()


@router.get("/latest")
def get_latest_prices(db: Session = Depends(get_db)):
    sql = text("""
        SELECT i.name, p.high, p.low, p.high - p.low AS margin, p.polled_at
        FROM prices p
        JOIN items i ON i.id = p.item_id
        WHERE p.polled_at = (SELECT MAX(polled_at) FROM prices)
        ORDER BY margin DESC NULLS LAST
    """)
    result = db.execute(sql).mappings().all()
    return list(result)


@router.get("/top-margins")
def get_top_margins(limit: int = 20, db: Session = Depends(get_db)):
    sql = text("""
        SELECT i.id, i.name, i.buy_limit,
               p.high, p.low,
               p.high - p.low AS margin,
               (p.high - p.low)::bigint * i.buy_limit AS max_profit,
               p.volume
        FROM prices p
        JOIN items i ON i.id = p.item_id
        WHERE p.polled_at = (SELECT MAX(polled_at) FROM prices)
          AND p.high IS NOT NULL
          AND p.low IS NOT NULL
        ORDER BY margin DESC NULLS LAST
        LIMIT :limit
    """)
    result = db.execute(sql, {"limit": limit}).mappings().all()
    return list(result)


@router.get("/history/{item_id}")
def get_price_history(item_id: int, days: int = 7, db: Session = Depends(get_db)):
    item = db.query(Price).filter(Price.item_id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="No price data for this item")
    sql = text("""
        SELECT polled_at, high, low, high - low AS margin
        FROM prices
        WHERE item_id = :item_id
          AND polled_at >= NOW() - (:days * INTERVAL '1 day')
        ORDER BY polled_at DESC
    """)
    result = db.execute(sql, {"item_id": item_id, "days": days}).mappings().all()
    return list(result)


@router.get("/top-movers")
def get_top_movers(hours: int = 24, db: Session = Depends(get_db)):
    sql = text("""
        SELECT * FROM (
            SELECT i.id, i.name,
                   first_price.high AS price_then,
                   last_price.high  AS price_now,
                   ROUND(100.0 * (last_price.high - first_price.high) / NULLIF(first_price.high, 0), 2) AS pct_change
            FROM items i
            JOIN prices first_price ON first_price.item_id = i.id
            JOIN prices last_price  ON last_price.item_id  = i.id
            WHERE first_price.polled_at = (
                SELECT MIN(polled_at) FROM prices
                WHERE polled_at >= NOW() - (:hours * INTERVAL '1 hour')
            )
            AND last_price.polled_at = (SELECT MAX(polled_at) FROM prices)
            AND first_price.high IS NOT NULL
            AND last_price.high IS NOT NULL
        ) subquery
        ORDER BY ABS(pct_change) DESC
        LIMIT 20
    """)
    result = db.execute(sql, {"hours": hours}).mappings().all()
    return list(result)

@router.get("/most-traded")
def get_most_traded(limit: int = 20, db: Session = Depends(get_db)):
    sql = text("""
        SELECT i.name, i.buy_limit,
               p.high, p.low,
               p.high - p.low AS margin
        FROM prices p
        JOIN items i ON i.id = p.item_id
        WHERE p.polled_at = (SELECT MAX(polled_at) FROM prices)
          AND p.high IS NOT NULL
          AND p.low IS NOT NULL
        ORDER BY (
            COALESCE(p.high, 0) + COALESCE(p.low, 0)
        ) DESC
        LIMIT :limit
    """)
    result = db.execute(sql, {"limit": limit}).mappings().all()
    return list(result)