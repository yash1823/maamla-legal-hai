from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from models.schemas import SearchFilters, SearchQuery, RelevanceRequest
from utils.kanoon_api import fetch_case_by_docid, fetch_cases
from utils.sambonva_utils import extract_keywords, hierarchical_relevance, summarize_case, explain_relevance
from utils.db import get_meta, init_db, save_meta, save_summary
from routes import case_routes, meta
from routes.user_routes import router as user_router
from routes.case_routes import router as case_routes 


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)

origins = [
    "https://maamla-legal-hai-ui.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           
    allow_credentials=True,          
    allow_methods=["*"],             
    allow_headers=["*"],             
)

# Include sub-routers
app.include_router(meta.router)
app.include_router(user_router)
app.include_router(case_routes)

# Routes
@app.post("/search")
async def search_cases(search_query: SearchQuery):
    print("Search endpoint")
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
            save_meta(docid, search_query.query, modified_query)
            print(f"[API] Meta saved during search for docid={docid}")

    return result


@app.post("/doc/{docid}")
async def get_case_by_docid(docid: str):
    return await fetch_case_by_docid(docid)

@app.post("/summarize/{docid}")
async def summarize_doc(docid: str):
    meta_data = await get_meta(docid)
    if meta_data and meta_data.get("summary"):
        return {"summary": meta_data["summary"]}

    doc = await fetch_case_by_docid(docid)
    case_text = doc.get("text") or doc.get("clean_doc", "")
    # Use up to 128k tokens (approx 100k words)
    if len(case_text) > 100000:
        case_text = case_text[:100000]
    summary = await summarize_case(case_text)
    await save_summary(docid, summary)
    return {"summary": summary}

@app.post("/relevance/")
async def case_relevance(request: RelevanceRequest):
    meta_data = await get_meta(request.docid)
    if meta_data and meta_data.get("summary"):
        summary = meta_data["summary"]
    else:
        case = await fetch_case_by_docid(request.docid)
        case_text = case.get("text") or case.get("clean_doc", "")
        if len(case_text) > 100000:
            case_text = case_text[:100000]
        summary = await summarize_case(case_text)
        await save_summary(request.docid, summary)

    if not meta_data or not meta_data.get("query"):
        await save_meta(request.docid, request.query, request.modified_query)

    explanation = await hierarchical_relevance(request.query, summary)
    return {"explanation": explanation}
