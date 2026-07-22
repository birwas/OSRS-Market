# OSRS Market Tracker

A real-time Grand Exchange price tracker for Old School RuneScape

## Overview

Polls live price data from the OSRS Wiki Prices API(https://prices.runescape.wiki/api/v1/osrs) and stores it in PostgreSQL. Next.js frontend with a REST API implemented with FastAPI.

## Features

- Live GE price polling every 5 minutes
- Item price margins for flipping
- Top movers — biggest % price changes in last 24 hours
- Item pages with relevant information like margin, trade volume and buy limit
- High alch profitability calculator
- Item search

## Tech Stack

**Backend**
- Python, FastAPI
- PostgreSQL
- SQLAlchemy ORM
- APScheduler for price polling

**Frontend**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS

## Getting Started

### Prerequisites
- Python 3.11+
- PostgreSQL
- Node.js 18+

### Backend

```bash
cd app
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `app` directory: DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/osrs_market

Run the API:

```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`. Interactive docs at `http://127.0.0.1:8000/docs`.

### Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory: NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 API_URL=http://127.0.0.1:8000

Run the frontend:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/items` | All items |
| GET | `/items/{id}` | Single item by ID |
| GET | `/items/search/{name}` | Search items by name |
| GET | `/items/{id}/alch-profit` | High alch profit calculation |
| GET | `/prices/latest` | Latest prices for all items |
| GET | `/prices/top-margins` | Top flipping margins |
| GET | `/prices/top-movers` | Biggest % price changes |
| GET | `/prices/most-traded` | Highest volume items |
| GET | `/prices/history/{id}` | Price history for an item |

## Data Source

Price data sourced from the OSRS Wiki Prices API (https://prices.runescape.wiki/api/v1/osrs), which provides real-time Grand Exchange data. Item metadata sourced from the `/mapping` endpoint.

## Live Demo
- Frontend: https://osrs-market-birwa.vercel.app
- API: https://osrs-market-production.up.railway.app/docs