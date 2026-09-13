from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import aiosqlite
from pathlib import Path
from contextlib import asynccontextmanager
from pydantic import BaseModel
from datetime import datetime

# TODO: Initialize database connection (use aiosqlite)

class MentionsQuery(BaseModel):
    page: int
    per_page: int

class TrendsQuery(BaseModel):
    date_from: datetime
    date_to: datetime

DB_PATH = Path(__file__).parent / "mentions.db"

_conn: aiosqlite.Connection | None = None


async def get_db() -> aiosqlite.Connection:
    return _conn


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _conn
    _conn = await aiosqlite.connect(DB_PATH)
    _conn.row_factory = aiosqlite.Row
    await _conn.execute("PRAGMA foreign_keys = ON")
    yield
    await _conn.close()


# TODO: Implement POST /mentions endpoint (see README for spec)
# TODO: Implement POST /mentions/trends endpoint (see README for spec)

app = FastAPI(title="Brand Mentions API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}
    
@app.post("/mentions")
async def mentions(body: MentionsQuery, db: aiosqlite.Connection = Depends(get_db)):
    per_page = max(1, min(body.per_page, 100))
    page = max(1, body.page)
    offset = (page - 1) * per_page
    
    async with db.execute("SELECT COUNT(*) FROM mentions") as cur:
        total = (await cur.fetchone())[0]
    async with db.execute("SELECT * FROM mentions LIMIT ?,?",(offset, per_page),) as cur:
        rows = await cur.fetchall()

    return {
        "data": [dict(r) for r in rows],
        "total": total,
        "page": page,
        "per_page": per_page,
    }

@app.post("/mentions/trends")
async def trends(body:TrendsQuery, db: aiosqlite.Connection = Depends(get_db)):
    async with db.execute(
        """
        SELECT
            date(created_at) AS date,
            COUNT(*)         AS total,
            SUM(mentioned)   AS mentioned
        FROM mentions
        WHERE created_at BETWEEN ? AND ?
        GROUP BY date(created_at)
        ORDER BY date ASC
        """,
        (body.date_from, body.date_to),
    ) as cur:
        rows = await cur.fetchall()

    return [dict(r) for r in rows]
    