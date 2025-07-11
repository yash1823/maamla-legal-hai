import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def get_connection():
    return await asyncpg.connect(DATABASE_URL)

async def init_db():
    conn = await get_connection()
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS case_meta (
            docid TEXT PRIMARY KEY,
            query TEXT,
            modified_query TEXT,
            summary TEXT
        )
    """)
    await conn.close()

async def save_meta(docid: str, query: str, modified_query: str = None):
    conn = await get_connection()
    await conn.execute("""
        INSERT INTO case_meta (docid, query, modified_query)
        VALUES ($1, $2, $3)
        ON CONFLICT (docid) DO UPDATE SET query = EXCLUDED.query, modified_query = EXCLUDED.modified_query
    """, docid, query, modified_query)
    await conn.close()

async def get_meta(docid: str):
    conn = await get_connection()
    row = await conn.fetchrow("SELECT docid, query, modified_query, summary FROM case_meta WHERE docid = $1", docid)
    await conn.close()
    if row:
        return dict(row)
    return None

async def save_summary(docid: str, summary: str):
    conn = await get_connection()
    await conn.execute("UPDATE case_meta SET summary = $1 WHERE docid = $2", summary, docid)
    await conn.close()
