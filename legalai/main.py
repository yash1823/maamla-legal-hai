from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.schemas import SearchFilters, SearchQuery, RelevanceRequest
from utils.kanoon_api import fetch_case_by_docid, fetch_cases
from utils.sambonva_utils import extract_keywords, hierarchical_relevance, summarize_case
from utils.db import (
    init_db, save_case_meta, update_summary,
    get_or_create_document, get_or_create_summary, get_or_create_relevance
)
from routes import meta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with actual domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(meta.router)

@app.post("/search")
async def search_cases(search_query: SearchQuery):
    keywords = await extract_keywords(search_query.query)
    modified_query = " ".join(keywords) if keywords else search_query.query

    f = search_query.filters or SearchFilters()
    if f.year:
        modified_query = f"{modified_query} year:{f.year}"

    params = {
        "formInput": modified_query,
        "pagenum": str(search_query.page),
    }

    if f.doctypes: params["doctypes"] = f.doctypes
    if f.title: params["title"] = f.title
    if f.cite: params["cite"] = f.cite
    if f.author: params["author"] = f.author
    if f.bench: params["bench"] = f.bench
    if f.maxcites is not None: params["maxcites"] = str(f.maxcites)
    if f.maxpages is not None: params["maxpages"] = str(f.maxpages)

    result = await fetch_cases(params)

    for case in result.get("cases", []):
        docid = case.get("docid")
        if docid:
            save_case_meta(docid, search_query.query, modified_query)

    return result

@app.post("/doc/{docid}")
async def get_case_by_docid(docid: str):
    # Use caching helper to avoid redundant API calls
    case_text = await get_or_create_document(docid, fetch_case_by_docid)
    return {"docid": docid, "text": case_text}

@app.post("/summarize/{docid}")
async def summarize_doc(docid: str):
    case_text = await get_or_create_document(docid, fetch_case_by_docid)
    max_chars = 30000
    case_text = case_text[:max_chars]

    summary = await get_or_create_summary(docid, case_text, summarize_case)
    return {"summary": summary}

@app.post("/relevance/")
async def case_relevance(request: RelevanceRequest):
    case_text = await get_or_create_document(request.docid, fetch_case_by_docid)
    explanation = await get_or_create_relevance(request.query, request.docid, case_text, hierarchical_relevance)
    return {"explanation": explanation}
