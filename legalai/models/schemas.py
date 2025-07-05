from typing import Optional
from pydantic import BaseModel

from typing import Optional
from pydantic import BaseModel

class SearchFilters(BaseModel):
    doctypes: Optional[str] = None
    fromdate: Optional[str] = None
    todate: Optional[str] = None
    title: Optional[str] = None
    cite: Optional[str] = None
    author: Optional[str] = None
    bench: Optional[str] = None
    maxcites: Optional[int] = None
    maxpages: Optional[int] = None


class SearchQuery(BaseModel):
    query: str
    page: Optional[int] = 0  # Now optional
    filters: Optional[SearchFilters]
