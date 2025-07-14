from fastapi import APIRouter, HTTPException, Header
from passlib.hash import bcrypt
from utils.jwt_utils import create_token, verify_token
from utils.db import get_user_by_email, create_user, get_user_by_id
from models.schemas import UserSignup, UserLogin

router = APIRouter()

@router.post("/signup")
async def signup(user: UserSignup):
    existing_user = await get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = bcrypt.hash(user.password)
    user_record = await create_user(user.email, user.name, hashed_pw)

    token = create_token(user_record["id"])
    return {"token": token}

@router.post("/login")
async def login(user: UserLogin):
    user_record = await get_user_by_email(user.email)
    if not user_record or not bcrypt.verify(user.password, user_record["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(user_record["id"])
    return {"token": token}

@router.get("/me")
async def get_me(authorization: str = Header(...)):
    user_id = verify_token(authorization.split(" ")[1])
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_record = await get_user_by_id(user_id)
    if not user_record:
        raise HTTPException(status_code=404, detail="User not found")

    return {"id": user_record["id"], "email": user_record["email"], "name": user_record["name"]}
