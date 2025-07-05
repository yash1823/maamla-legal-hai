from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.schemas import SearchQuery, RelevanceRequest
from utils.kanoon_api import fetch_case_by_docid, fetch_cases
from utils.groq_utils import extract_keywords, hierarchical_relevance, summarize_case, explain_relevance

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with actual domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/search")
async def search_cases(search_query: SearchQuery):
    # Extract keywords using Groq
    keywords = await extract_keywords(search_query.query)
    form_input = " ".join(keywords) if keywords else search_query.query

    # Append year if provided
    year = getattr(search_query.filters, "year", None)
    if year:
        form_input = f"{form_input} year:{year}"

    # Construct query params
    f = search_query.filters
    params = {
        "formInput": form_input,
        "pagenum": str(search_query.page),
    }
    if f:
        if f.doctypes:
            params["doctypes"] = f.doctypes
        if f.title:
            params["title"] = f.title
        if f.cite:
            params["cite"] = f.cite
        if f.author:
            params["author"] = f.author
        if f.bench:
            params["bench"] = f.bench
        if f.maxcites is not None:
            params["maxcites"] = str(f.maxcites)
        if f.maxpages is not None:
            params["maxpages"] = str(f.maxpages)

    result = await fetch_cases(params)
    return result

@app.post("/doc/{docid}")
async def get_case_by_docid(docid: str):
    result = await fetch_case_by_docid(docid)
    return result

@app.post("/summarize/{docid}")
async def summarize_doc(docid: str):
    print(f"Summarize endpoint called with docid: {docid}")
    doc = await fetch_case_by_docid(docid)
    print(f"Fetched doc: {doc.get('title', '')}")
    
    case_text = doc.get("text", "") or doc.get("clean_doc", "")
    max_chars = 30000  # Within safe Groq input limits (~32k characters)

    if len(case_text) > max_chars:
        print(f"Truncating case text from {len(case_text)} to {max_chars} characters.")
        case_text = case_text[:max_chars]

    summary = await summarize_case(case_text)
    print(f"Generated summary: {summary[:300]}...")  # Trimmed print for brevity
    return {"summary": summary}

@app.post("/relevance/")
async def case_relevance(request: RelevanceRequest):
    doc = await fetch_case_by_docid(request.docid)
    explanation = await hierarchical_relevance(request.query, doc.get("text", ""))
    return {"explanation": explanation}
