from fastapi import APIRouter, HTTPException, Query, Depends, Request
from utils.auth import require_admin
from utils.db import get_pool, save_meta, get_meta, save_summary
from utils.kanoon_api import fetch_case_by_docid
from utils.sambonva_utils import summarize_case, hierarchical_relevance
from typing import List, Optional
import os
from asyncpg.pool import Pool

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
    limit: Optional[int] = Query(10, description="Limit the number of recent results"),
    db: Pool = Depends(get_pool),
    user=Depends(require_admin) 
):
    try:
        if docid:
            # Return only info for that docid
            query = """
                SELECT docid, query, modified_query, summary
                FROM case_meta
                WHERE docid = $1
            """
            row = await db.fetchrow(query, docid)
            if not row:
                raise HTTPException(status_code=404, detail="Doc ID not found")
            return {"docid": row["docid"], "query": row["query"], "modified_query": row["modified_query"], "summary": row["summary"]}

        # Otherwise return diagnostics
        stats_query = """
            SELECT
                (SELECT COUNT(*) FROM case_meta) AS total,
                (SELECT COUNT(*) FROM case_meta WHERE summary IS NULL) AS null_summaries,
                (SELECT COUNT(*) FROM bookmarks) AS total_bookmarks,
                (SELECT COUNT(DISTINCT user_id) FROM bookmarks) AS unique_users
        """

        recent_query = """
            SELECT docid, query, modified_query, summary
            FROM case_meta
            ORDER BY docid DESC
            LIMIT $1
        """

        stats, recent = await db.fetchrow(stats_query), await db.fetch(recent_query, limit)

        return {
            "stats": {
                "total_rows": stats["total"],
                "null_summaries": stats["null_summaries"],
                "bookmarks": stats["total_bookmarks"],
                "users_with_bookmarks": stats["unique_users"]
            },
            "recent_entries": [
                {
                    "docid": row["docid"],
                    "query": row["query"],
                    "modified_query": row["modified_query"],
                    "summary": row["summary"]
                } for row in recent
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.api_route("/health", methods=["GET", "HEAD"])
async def health_check(request: Request):
    token = request.query_params.get("token")
    env_token = os.getenv("HEALTH_CHECK_TOKEN")
    if token != env_token:
        raise HTTPException(status_code=403, detail="Forbidden")

    print("[API] Health check passed")
    return {"status": "ok"}

@router.get("/debug/users", tags=["Debug"])
async def get_user_debug_info(db=Depends(get_pool), user=Depends(require_admin)):
    try:
        stats_query = """
            SELECT
                (SELECT COUNT(*) FROM users) AS total_users,
                (SELECT COUNT(*) FROM users u
                    WHERE NOT EXISTS (
                        SELECT 1 FROM bookmarks b WHERE b.user_id = u.id
                    )
                ) AS users_without_bookmarks,
                (SELECT COUNT(*) FROM (
                    SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1
                ) AS duplicates) AS duplicate_emails
        """

        recent_users_query = """
            SELECT id, email, name
            FROM users
            ORDER BY id DESC
            LIMIT 10
        """

        users_with_bookmarks_query = """
            SELECT u.id, u.email, u.name, COUNT(b.id) as bookmark_count
            FROM users u
            JOIN bookmarks b ON u.id = b.user_id
            GROUP BY u.id
            ORDER BY bookmark_count DESC
            LIMIT 10
        """

        stats = await db.fetchrow(stats_query)
        recent_users = await db.fetch(recent_users_query)
        top_bookmarkers = await db.fetch(users_with_bookmarks_query)

        return {
            "stats": {
                "total_users": stats["total_users"],
                "users_without_bookmarks": stats["users_without_bookmarks"],
                "duplicate_emails": stats["duplicate_emails"]
            },
            "recent_users": [
                {
                    "id": row["id"],
                    "email": row["email"],
                    "name": row["name"]
                } for row in recent_users
            ],
            "top_users_by_bookmarks": [
                {
                    "id": row["id"],
                    "email": row["email"],
                    "name": row["name"],
                    "bookmark_count": row["bookmark_count"]
                } for row in top_bookmarkers
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
