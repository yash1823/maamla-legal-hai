from fastapi import APIRouter, HTTPException, Query, Depends, Request
from utils.db import get_pool, save_meta, get_meta, save_summary
from utils.kanoon_api import fetch_case_by_docid
from utils.sambonva_utils import summarize_case, hierarchical_relevance
from typing import List, Optional
import os

router = APIRouter()

@router.get("/relevance/{docid}")
async def get_relevance(docid: str, query: str = Query(...), db=Depends(get_pool)):
    meta = await get_meta(docid)

    # Use cached summary if available
    if meta and meta.get("summary"):
        summary = meta["summary"]
        print(f"[API] Reusing summary from DB for docid={docid}")
    else:
        case = await fetch_case_by_docid(docid)
        case_text = case.get("text") or case.get("clean_doc", "")
        summary = await summarize_case(case_text)
        await save_summary(docid, summary)
        print(f"[API] Summary generated and saved for docid={docid}")

    # Save user query if not present
    if not meta or not meta.get("query"):
        await save_meta(docid, query)
        print(f"[API] Query saved to DB for docid={docid}")
    else:
        print(f"[API] Query already exists for docid={docid}")

    # Use hierarchical relevance with summary
    relevance = await hierarchical_relevance(query, summary)
    print(f"[API] Relevance computed for docid={docid}")
    return {"explanation": relevance}

@router.get("/debug/db", tags=["Debug"])
async def get_case_meta_data(
    docid: Optional[str] = Query(None, description="Filter by specific docid"),
    limit: Optional[int] = Query(None, description="Limit the number of results"),
    db=Depends(get_pool)
):
    query = "SELECT docid, query, modified_query, summary FROM case_meta"
    params = []

    if docid:
        query += " WHERE docid = $1"
        params.append(docid)

    query += " ORDER BY id DESC"
    if limit:
        query += f" LIMIT {limit}"

    try:
        if params:
            rows = await db.fetch(query, *params)
        else:
            rows = await db.fetch(query)

        return [
            {
                "docid": row["docid"],
                "query": row["query"],
                "modified_query": row["modified_query"],
                "summary": row["summary"]
            }
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check(request: Request):
    token = request.query_params.get("token")
    env_token = os.getenv("HEALTH_CHECK_TOKEN")
    print(f"[DEBUG] Received token: {token}")
    print(f"[DEBUG] Env token: {env_token}")

    if token != env_token:
        raise HTTPException(status_code=403, detail="Forbidden")

    print("[API] Health check passed")
    return {"status": "ok"}
