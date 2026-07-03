from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from database import SessionLocal
from models import Item, Price
from wiki_client import WikiClient
import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

wiki = WikiClient()


def seed_items():
    db = SessionLocal()
    try:
        existing = db.query(Item).count()
        if existing > 0:
            logger.info("Items already seeded, skipping")
            return

        logger.info("Seeding items from Wiki API...")
        mapping = wiki.get_mapping()
        for item_data in mapping:
            item = Item(
                id=item_data["id"],
                name=item_data["name"],
                examine=item_data.get("examine"),
                members=item_data.get("members"),
                buy_limit=item_data.get("limit"),
                lowalch=item_data.get("lowalch"),
                highalch=item_data.get("highalch"),
                icon=item_data.get("icon"),
            )
            db.add(item)
        db.commit()
        logger.info(f"Seeded {len(mapping)} items")
    except Exception as e:
        logger.error(f"Error seeding items: {e}")
        db.rollback()
    finally:
        db.close()


def poll_prices():
    db = SessionLocal()
    try:
        logger.info("Polling latest prices...")
        latest = wiki.get_latest()
        polled_at = datetime.datetime.now(datetime.timezone.utc)

        # get all valid item IDs from the database
        valid_ids = set(row[0] for row in db.query(Item.id).all())

        prices = []
        for item_id, price_data in latest.items():
            if int(item_id) not in valid_ids:
                continue  # skip items not in our items table
            high_time = price_data.get("highTime")
            low_time = price_data.get("lowTime")
            prices.append(Price(
                item_id=int(item_id),
                polled_at=polled_at,
                high=price_data.get("high"),
                high_time=datetime.datetime.fromtimestamp(high_time, tz=datetime.timezone.utc) if high_time else None,
                low=price_data.get("low"),
                low_time=datetime.datetime.fromtimestamp(low_time, tz=datetime.timezone.utc) if low_time else None,
            ))
        db.bulk_save_objects(prices)
        db.commit()
        logger.info(f"Inserted {len(prices)} price records")
    except Exception as e:
        logger.error(f"Error polling prices: {e}")
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    seed_items()
    poll_prices()  # run immediately on startup
    scheduler = BackgroundScheduler()
    scheduler.add_job(poll_prices, IntervalTrigger(minutes=5))
    scheduler.start()
    logger.info("Scheduler started, polling every 5 minutes")