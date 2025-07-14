import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

pool: asyncpg.pool.Pool = None

async def init_db():
    global pool
    pool = await asyncpg.create_pool(DATABASE_URL)
    print("[DB] Connection pool created.")

    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS case_meta (
                docid TEXT PRIMARY KEY,
                query TEXT,
                modified_query TEXT,
                summary TEXT
            );
        """)
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                password_hash TEXT NOT NULL
            );
        """)
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS bookmarks (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                docid TEXT NOT NULL,
                title TEXT,
                court TEXT,
                date TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, docid)
            );
        """)
    print("[DB] Tables ensured.")

async def get_pool():
    if not pool:
        raise RuntimeError("Database pool is not initialized. Call init_db() first.")
    return pool

# ──────────────── Case Meta ────────────────

async def save_meta(docid: str, query: str, modified_query: str = None):
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO case_meta (docid, query, modified_query)
            VALUES ($1, $2, $3)
            ON CONFLICT (docid) DO UPDATE SET query = EXCLUDED.query, modified_query = EXCLUDED.modified_query
        """, docid, query, modified_query)
        print(f"[DB] Meta saved for docid={docid}")

async def get_meta(docid: str):
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM case_meta WHERE docid = $1", docid)
        if row:
            print(f"[DB] Meta fetched for docid={docid}")
        else:
            print(f"[DB] No meta found for docid={docid}")
        return dict(row) if row else None

async def save_summary(docid: str, summary: str):
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO case_meta (docid, summary)
            VALUES ($1, $2)
            ON CONFLICT (docid) DO UPDATE SET summary = EXCLUDED.summary
        """, docid, summary)
        print(f"[DB] Summary saved for docid={docid}")

async def get_summary(docid: str):
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT summary FROM case_meta WHERE docid = $1", docid)
        if row:
            print(f"[DB] Summary fetched for docid={docid}")
            return row["summary"]
        print(f"[DB] No summary found for docid={docid}")
        return None

# ──────────────── Users ────────────────

async def get_user_by_email(email: str):
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM users WHERE email = $1", email)
        print(f"[DB] User lookup by email: {email} - {'Found' if row else 'Not found'}")
        return row

async def get_user_by_id(user_id: int):
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM users WHERE id = $1", user_id)
        print(f"[DB] User lookup by id: {user_id} - {'Found' if row else 'Not found'}")
        return row

async def create_user(email: str, name: str, password_hash: str):
    async with pool.acquire() as conn:
        user = await conn.fetchrow("""
            INSERT INTO users (email, name, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, email, name
        """, email, name, password_hash)
        print(f"[DB] New user created: {email}")
        return user

# ──────────────── Bookmarks ────────────────

async def add_bookmark(user_id: int, docid: str, title: str, court: str, date: str):
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO bookmarks (user_id, docid, title, court, date)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, docid) DO NOTHING
        """, user_id, docid, title, court, date)
        print(f"[DB] Bookmark added for user_id={user_id}, docid={docid}")

async def get_user_bookmarks(user_id: int):
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT docid, title, court, date, created_at
            FROM bookmarks
            WHERE user_id = $1
            ORDER BY created_at DESC
        """, user_id)
        print(f"[DB] Retrieved {len(rows)} bookmarks for user_id={user_id}")
        return [dict(row) for row in rows]

async def delete_bookmark(user_id: int, docid: str):
    async with pool.acquire() as conn:
        result = await conn.execute("""
            DELETE FROM bookmarks
            WHERE user_id = $1 AND docid = $2
        """, user_id, docid)
        print(f"[DB] Bookmark deleted for user_id={user_id}, docid={docid}")
        return result
