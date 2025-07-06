import sqlite3
from typing import Optional, List, Dict

DB_PATH = "legalai.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS case_meta (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                docid TEXT NOT NULL,
                user_query TEXT NOT NULL,
                modified_query TEXT,
                summary TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        ...

def save_case_meta(docid: str, user_query: str, modified_query: str, summary: Optional[str] = None):
    with get_connection() as conn:
        conn.execute("""
            INSERT INTO case_meta (docid, user_query, modified_query, summary)
            VALUES (?, ?, ?, ?)
        """, (docid, user_query, modified_query, summary))
        conn.commit()

def update_summary(docid: str, summary: str):
    with get_connection() as conn:
        conn.execute("""
            UPDATE case_meta
            SET summary = ?
            WHERE docid = ?
        """, (summary, docid))
        conn.commit()

def update_case_text(docid: str, case_text: str):
    with get_connection() as conn:
        conn.execute("""
            UPDATE case_meta
            SET case_text = ?
            WHERE docid = ?
        """, (case_text, docid))
        conn.commit()

def get_meta_by_docid(docid: str) -> Optional[Dict]:
    with get_connection() as conn:
        cursor = conn.execute("""
            SELECT docid, user_query, modified_query, summary, case_text
            FROM case_meta
            WHERE docid = ?
            ORDER BY created_at DESC
            LIMIT 1
        """, (docid,))
        row = cursor.fetchone()
        return dict(row) if row else None

def get_all_case_meta() -> List[Dict]:
    with get_connection() as conn:
        cursor = conn.execute("""
            SELECT docid, user_query, modified_query, summary, case_text
            FROM case_meta
            ORDER BY created_at DESC
        """)
        return [dict(row) for row in cursor.fetchall()]

# -------------------- New Optimized Caching Helpers --------------------

async def get_or_create_document(docid: str, fetch_func):
    doc = await fetch_func(docid)
    return doc.get("text") or doc.get("clean_doc") or ""


def get_or_create_summary(docid: str, case_text: str, summarize_fn) -> str:
    meta = get_meta_by_docid(docid)
    if meta and meta.get("summary"):
        return meta["summary"]

    summary = summarize_fn(case_text)
    update_summary(docid, summary)
    return summary

def get_or_create_relevance(query: str, docid: str, case_text: str, relevance_fn) -> str:
    with get_connection() as conn:
        cursor = conn.execute("""
            SELECT explanation FROM relevance_cache
            WHERE docid = ? AND query = ?
        """, (docid, query))
        row = cursor.fetchone()
        if row:
            return row["explanation"]

    explanation = relevance_fn(query, case_text)
    with get_connection() as conn:
        conn.execute("""
            INSERT OR REPLACE INTO relevance_cache (docid, query, explanation)
            VALUES (?, ?, ?)
        """, (docid, query, explanation))
        conn.commit()

    return explanation
