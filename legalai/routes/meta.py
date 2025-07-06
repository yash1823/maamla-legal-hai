from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.db import (
    save_case_meta,
    get_meta_by_docid,
    update_summary,
    get_all_case_meta
)
from utils.kanoon_api import fetch_case_by_docid
from utils.sambonva_utils import hierarchical_relevance

router = APIRouter()

class MetaInput(BaseModel):
    docid: str
    user_query: str
    modified_query: str

class SummaryInput(BaseModel):
    summary: str

@router.post("/meta")
async def store_meta(meta: MetaInput):
    save_case_meta(meta.docid, meta.user_query, meta.modified_query)
    return {"status": "saved"}

@router.get("/meta/{docid}")
async def fetch_meta(docid: str):
    meta = get_meta_by_docid(docid)
    if not meta:
        raise HTTPException(status_code=404, detail="Metadata not found")
    return meta

@router.post("/meta/{docid}/summary")
async def update_summary_route(docid: str, summary: SummaryInput):
    update_summary(docid, summary.summary)
    return {"status": "updated"}

@router.get("/relevance/{docid}")
async def get_relevance(docid: str):
    meta = get_meta_by_docid(docid)
    if not meta or not meta.get("user_query"):
        raise HTTPException(status_code=404, detail="Metadata or query not found")

    case_doc = await fetch_case_by_docid(docid)
    case_text = case_doc.get("text", "") or case_doc.get("clean_doc", "")
    relevance = await hierarchical_relevance(meta["user_query"], case_text)
    return {"relevance": relevance}

@router.get("/meta/all")
async def list_all_metadata():
    return get_all_case_meta()
