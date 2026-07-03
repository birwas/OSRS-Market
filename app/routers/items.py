from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Item

router = APIRouter()


@router.get("/")
def get_items(db: Session = Depends(get_db)):
    items = db.query(Item).order_by(Item.name).all()
    return items


@router.get("/{item_id}")
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.get("/search/{name}")
def search_items(name: str, db: Session = Depends(get_db)):
    items = db.query(Item).filter(Item.name.ilike(f"%{name}%")).order_by(Item.name).all()
    if not items:
        raise HTTPException(status_code=404, detail="No items found")
    return items