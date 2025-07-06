from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.db import save_meta, get_meta, save_summary
from utils.kanoon_api import fetch_case_by_docid
from utils.sambonva_utils import hierarchical_relevance

router = APIRouter()

class MetaInput(BaseModel):
    docid: str
    query: str

class SummaryInput(BaseModel):
    summary: str

@router.post("/meta")
async def store_meta(meta: MetaInput):
    save_meta(meta.docid, meta.query)
    return {"status": "saved"}

@router.get("/meta/{docid}")
async def fetch_meta(docid: str):
    meta = get_meta(docid)
    if not meta:
        raise HTTPException(status_code=404, detail="Metadata not found")
    return meta

@router.post("/meta/{docid}/summary")
async def update_summary(docid: str, summary: SummaryInput):
    save_summary(docid, summary.summary)
    return {"status": "updated"}

@router.get("/relevance/{docid}")
async def get_relevance(docid: str):
    meta = get_meta(docid)
    if not meta or not meta.get("query"):
        raise HTTPException(status_code=404, detail="Metadata or query not found")

    case_text = await fetch_case_by_docid(docid)
    relevance = await hierarchical_relevance(meta["query"], case_text)
    return {"relevance": relevance}
