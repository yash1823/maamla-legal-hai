from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from models.schemas import SearchQuery
from utils.kanoon_api import fetch_case_by_docid, fetch_cases

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace * with actual domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/search")
async def search_cases(search_query: SearchQuery):
    params = {
        "formInput": search_query.query,
        "pagenum": str(search_query.page),
    }

    if search_query.filters:
        f = search_query.filters

        # Add year to query if present
        if hasattr(f, "year") and f.year:
            params["formInput"] = f"{search_query.query} year:{f.year}"

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
        if f.maxcites:
            params["maxcites"] = str(f.maxcites)
        if f.maxpages:
            params["maxpages"] = str(f.maxpages)

    result = await fetch_cases(params)
    return result


@app.post("/doc/{docid}")
async def get_case_by_docid(docid: str):
    result = await fetch_case_by_docid(docid)
    return result
