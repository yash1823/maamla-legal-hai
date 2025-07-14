from fastapi import APIRouter, HTTPException, Header, Query,Request
from utils.jwt_utils import verify_token
from models.schemas import BookmarkIn
from utils.db import add_bookmark, get_user_bookmarks,delete_bookmark 

router = APIRouter()

@router.post("/bookmark")
async def bookmark_case(bookmark: BookmarkIn, authorization: str = Header(...)):
    user_id = verify_token(authorization.split(" ")[1])
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    await add_bookmark(user_id, bookmark.docid, bookmark.title, bookmark.court, bookmark.date)
    return {"message": "Bookmarked"}

@router.get("/bookmarks")
async def get_bookmarks(authorization: str = Header(...)):
    user_id = verify_token(authorization.split(" ")[1])
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    bookmarks = await get_user_bookmarks(user_id)
    return bookmarks

@router.delete("/bookmark")
async def remove_bookmark(docid: str = Query(...), authorization: str = Header(...)):
    user_id = verify_token(authorization.split(" ")[1])
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    await delete_bookmark(user_id, docid)
    return {"message": "Bookmark removed"}