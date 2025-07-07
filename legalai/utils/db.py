import sqlite3
from typing import Optional

DB_PATH = "legalai.db"

def get_connection():
    return sqlite3.connect(DB_PATH)

def init_db():
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS case_meta (
                docid TEXT PRIMARY KEY,
                query TEXT,
                summary TEXT
            )
        """)


def save_meta(docid: str, query: str):
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO case_meta (docid, query)
            VALUES (?, ?)
            ON CONFLICT(docid) DO UPDATE SET query=excluded.query
            """,
            (docid, query)
        )
    print(f"[DB] Saved meta for docid={docid}")


def get_meta(docid: str) -> Optional[dict]:
    with get_connection() as conn:
        cursor = conn.execute(
            "SELECT docid, query, summary FROM case_meta WHERE docid = ?",
            (docid,)
        )
        row = cursor.fetchone()
        if row:
            print(f"[DB] Retrieved meta for docid={docid}: {row}")
            return {"docid": row[0], "query": row[1], "summary": row[2]}
        print(f"[DB] No meta found for docid={docid}")
        return None


def save_summary(docid: str, summary: str):
    with get_connection() as conn:
        conn.execute("UPDATE case_meta SET summary = ? WHERE docid = ?", (summary, docid))
    print(f"[DB] Saved summary for docid={docid}")
