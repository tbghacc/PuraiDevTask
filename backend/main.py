from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import aiosqlite
from pathlib import Path
from contextlib import asynccontextmanager

# TODO: Initialize database connection (use aiosqlite)

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