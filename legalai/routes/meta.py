from fastapi import APIRouter, HTTPException, Query
from utils.db import get_connection, save_meta, get_meta, save_summary
from utils.kanoon_api import fetch_case_by_docid
from utils.sambonva_utils import summarize_case, hierarchical_relevance
from typing import List, Optional

router = APIRouter()

@router.get("/relevance/{docid}")
async def get_relevance(docid: str, query: str = Query(...)):
    meta = await get_meta(docid)

    # Always use the same summary logic
    if meta and meta.get("summary"):
        summary = meta["summary"]
        print(f"[API] Reusing summary from DB for docid={docid}")
    else:
        case = await fetch_case_by_docid(docid)
        case_text = case.get("text") or case.get("clean_doc", "")
        # Use the same summarize_case logic (handles chunking and rate limiting)
        summary = await summarize_case(case_text)
        await save_summary(docid, summary)
        print(f"[API] Summary generated and saved for docid={docid}")

    # Save query if not present
    if not meta or not meta.get("query"):
        await save_meta(docid, query)
        print(f"[API] Query saved to DB for docid={docid}")
    else:
        print(f"[API] Query already exists for docid={docid}")

    # Use summary for relevance (efficient, avoids repeated chunking)
    relevance = await hierarchical_relevance(query, summary)
    print(f"[API] Relevance computed for docid={docid}")
    return {"explanation": relevance}

@router.get("/debug/db", tags=["Debug"])
async def get_case_meta_data(
    docid: Optional[str] = Query(None, description="Filter by specific docid"),
    limit: Optional[int] = Query(None, description="Limit the number of results")
):
    query = "SELECT docid, query, modified_query, summary FROM case_meta"
    params = []

    if docid:
        query += " WHERE docid = ?"
        params.append(docid)

    query += " ORDER BY rowid DESC"
    if limit:
        query += f" LIMIT {limit}"

    with get_connection() as conn:
        cursor = conn.execute(query, params)
        rows = cursor.fetchall()
        return [
            {"docid": row[0], "query": row[1], "modified_query": row[2], "summary": row[3]}
            for row in rows
        ]
