from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import aiosqlite
from pathlib import Path
from contextlib import asynccontextmanager
from pydantic import BaseModel
from datetime import datetime
from typing import Literal
from dotenv import load_dotenv

load_dotenv()

BUCKETS = {
    "day":  "date(created_at)",
    "week": "date(created_at, '-' || ((strftime('%w', created_at) + 6) % 7) || ' days')",
}

class MentionsQuery(BaseModel):
    page: int
    per_page: int
    model: str | None = None
    sentiment: Literal["positive", "neutral", "negative"] | None = None
    date_from: datetime | None = None
    date_to: datetime | None = None

class TrendsQuery(BaseModel):
    date_from: datetime | None = None
    date_to: datetime | None = None
    group_by: Literal["day", "week"] = "day"

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

app = FastAPI(title="Brand Mentions API", lifespan=lifespan)

origins = [
    o.strip()
    for o in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health(db: aiosqlite.Connection = Depends(get_db)):
    try:
        async with db.execute("SELECT 1") as cur:
            await cur.fetchone()
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "ok" if db_ok else "degraded",
        "db": db_ok,
    }
    
@app.post("/mentions")
async def mentions(body: MentionsQuery, db: aiosqlite.Connection = Depends(get_db)):
    per_page = max(1, min(body.per_page, 100))
    page = max(1, body.page)
    offset = (page - 1) * per_page
    
    where = []
    params: list = []

    if body.model is not None:
        where.append("model = ?")
        params.append(body.model)

    if body.sentiment is not None:
        where.append("sentiment = ?")
        params.append(body.sentiment)

    if body.date_from is not None:
        where.append("created_at >= ?")
        params.append(body.date_from)

    if body.date_to is not None:
        where.append("created_at <= ?")
        params.append(body.date_to)

    where_sql = f"WHERE {' AND '.join(where)}" if where else ""

    async with db.execute(f"SELECT COUNT(*) FROM mentions {where_sql}", params) as cur:
        total = (await cur.fetchone())[0]

    async with db.execute(
        f"""
        SELECT * FROM mentions
        {where_sql}
        ORDER BY id
        LIMIT ?,?
        """,
        [*params, offset, per_page],
    ) as cur:
        rows = await cur.fetchall()

    return {
        "data": [dict(r) for r in rows],
        "total": total,
        "page": page,
        "per_page": per_page,
    }

@app.post("/mentions/trends")
async def trends(body: TrendsQuery, db: aiosqlite.Connection = Depends(get_db)):
    date_from = body.date_from
    date_to = body.date_to

    if date_from is None or date_to is None:
        async with db.execute(
            "SELECT MIN(created_at) AS mn, MAX(created_at) AS mx FROM mentions"
        ) as cur:
            bounds = await cur.fetchone()

        if bounds["mn"] is None:
            return []

        if date_from is None:
            date_from = bounds["mn"]
        if date_to is None:
            date_to = bounds["mx"]

    bucket = BUCKETS[body.group_by]

    sql = f"""
        SELECT
            {bucket}         AS date,
            COUNT(*)         AS total,
            SUM(mentioned)   AS mentioned
        FROM mentions
        WHERE created_at BETWEEN ? AND ?
        GROUP BY {bucket}
        ORDER BY {bucket} ASC
    """

    async with db.execute(sql, (date_from, date_to)) as cur:
        rows = await cur.fetchall()

    return [dict(r) for r in rows]

@app.get("/mentions/models")
async def models(db: aiosqlite.Connection = Depends(get_db)):
    async with db.execute("SELECT DISTINCT model FROM mentions WHERE model IS NOT NULL ORDER BY model") as cur:
        rows = await cur.fetchall()
    return [r["model"] for r in rows]