from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import Item

router = APIRouter()


@router.get("/")
def get_items(db: Session = Depends(get_db)):
    items = db.query(Item).order_by(Item.name).all()
    return items


@router.get("/search/{name}")
def search_items(name: str, db: Session = Depends(get_db)):
    items = db.query(Item).filter(Item.name.ilike(f"%{name}%")).order_by(Item.name).all()
    if not items:
        raise HTTPException(status_code=404, detail="No items found")
    return items


@router.get("/{item_id}/alch-profit")
def get_alch_profit(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if not item.highalch:
        raise HTTPException(status_code=404, detail="Item has no alch value")

    sql = text("""
        WITH latest_price AS (
            SELECT low FROM prices
            WHERE item_id = :item_id
            ORDER BY polled_at DESC
            LIMIT 1
        ),
        nature_rune_price AS (
            SELECT low FROM prices
            JOIN items ON items.id = prices.item_id
            WHERE items.name = 'Nature rune'
            ORDER BY polled_at DESC
            LIMIT 1
        )
        SELECT
            latest_price.low AS buy_price,
            nature_rune_price.low AS nature_rune_cost
        FROM latest_price, nature_rune_price
    """)
    result = db.execute(sql, {"item_id": item_id}).mappings().first()
    if not result:
        raise HTTPException(status_code=404, detail="No price data for this item")

    alch_profit = item.highalch - result["buy_price"] - result["nature_rune_cost"]

    return {
        "name": item.name,
        "highalch": item.highalch,
        "buy_price": result["buy_price"],
        "nature_rune_cost": result["nature_rune_cost"],
        "alch_profit": alch_profit,
        "profitable": alch_profit > 0
    }


@router.get("/{item_id}")
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item