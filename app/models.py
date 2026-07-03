from sqlalchemy import Column, Integer, String, Boolean, BigInteger, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from database import Base
import datetime


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    examine = Column(String)
    members = Column(Boolean)
    buy_limit = Column(Integer)
    lowalch = Column(Integer)
    highalch = Column(Integer)
    icon = Column(String)

    prices = relationship("Price", back_populates="item")


class Price(Base):
    __tablename__ = "prices"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    polled_at = Column(TIMESTAMP(timezone=True), default=datetime.datetime.now)
    high = Column(Integer)
    high_time = Column(TIMESTAMP(timezone=True))
    low = Column(Integer)
    low_time = Column(TIMESTAMP(timezone=True))

    item = relationship("Item", back_populates="prices")