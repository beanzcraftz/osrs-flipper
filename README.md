# ⚔️ OSRS GE Flipper

A high-performance, reactive Old School RuneScape Grand Exchange flipping dashboard.

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

## Features

- **Live GE Prices** — Fetches real-time buy/sell prices from the [OSRS Wiki API](https://prices.runescape.wiki/api/v1/osrs)
- **Flip Analysis** — Computes margin (GP) and ROI (%) for every tradeable item
- **Auto-Polling** — Background poller stores snapshots every 5 minutes; frontend refreshes every 30 seconds
- **Filter & Sort** — Slider filters for minimum margin/ROI, text search, sortable columns
- **Historical Data** — SQLite stores price snapshots for trend analysis
- **Dockerised** — One-command deployment with Docker Compose

## Quick Start

### Docker (Recommended)

```bash
docker compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)

### Local Development

**Backend:**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server runs at `http://localhost:5173` and proxies `/api` to the backend.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/items` | Merged item + price data with margin/ROI |
| `GET` | `/api/items?min_margin=1000&min_roi=5&search=whip` | Filtered results |
| `GET` | `/api/items/{id}/history` | Last 24h of price snapshots |

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────────┐
│   React UI  │────▶│  FastAPI     │────▶│  OSRS Wiki API    │
│  (Vite +    │     │  Backend     │     │  /mapping         │
│   Tailwind) │     │              │     │  /latest           │
└─────────────┘     └──────┬───────┘     └───────────────────┘
                           │
                    ┌──────▼───────┐
                    │   SQLite     │
                    │  (snapshots) │
                    └──────────────┘
```

## Data Sources

All pricing data is sourced from the [OSRS Wiki Real-Time Prices API](https://prices.runescape.wiki/api/v1/osrs).

## License

MIT
