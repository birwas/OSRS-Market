from fastapi import FastAPI
from database import engine, Base
from scheduler import start_scheduler
from routers import items, prices

app = FastAPI(title="OSRS Market Tracker")

Base.metadata.create_all(bind=engine)

@app.on_event("startup")
async def startup():
    start_scheduler()

app.include_router(items.router, prefix="/items", tags=["items"])
app.include_router(prices.router, prefix="/prices", tags=["prices"])

@app.get("/")
def root():
    return {"message": "OSRS Market Tracker API is running"}