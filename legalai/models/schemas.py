from typing import Optional
from pydantic import BaseModel
from pydantic import BaseModel, EmailStr
from typing import Optional, List


class SearchFilters(BaseModel):
    doctypes: Optional[str] = None
    year: Optional[int] = None  
    title: Optional[str] = None
    cite: Optional[str] = None
    author: Optional[str] = None
    bench: Optional[str] = None
    maxcites: Optional[int] = None
    maxpages: Optional[int] = None


class SearchQuery(BaseModel):
    query: str
    page: Optional[int] = 0  
    filters: Optional[SearchFilters] = None


class RelevanceRequest(BaseModel):
    query: str
    summary: str  # Pass summary directly from UI


class UserSignup(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str

class TokenResponse(BaseModel):
    user: UserOut
    token: str

class BookmarkCreate(BaseModel):
    docid: str
    title: Optional[str]
    court: Optional[str]
    date: Optional[str]

class BookmarkOut(BaseModel):
    id: int
    docid: str
    title: Optional[str]
    court: Optional[str]
    date: Optional[str]
    created_at: str

class BookmarkStatus(BaseModel):
    isBookmarked: bool


from pydantic import BaseModel, EmailStr

# Bookmarks
class BookmarkIn(BaseModel):
    docid: str
    title: str
    court: str
    date: str


