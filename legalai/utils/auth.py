import bcrypt
import jwt
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from fastapi import Header, HTTPException, Depends, Request
from utils.jwt_utils import verify_token
from utils.db import get_user_by_id
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend

load_dotenv()

# JWT-related env vars
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
TOKEN_EXPIRY_SECONDS = int(os.getenv("TOKEN_EXPIRY_SECONDS", 900))

# RSA Public key for verifying admin tokens
PUBLIC_KEY_PEM = os.getenv("PUBLIC_KEY", "").encode().replace(b"\\n", b"\n")
public_key = serialization.load_pem_public_key(PUBLIC_KEY_PEM, backend=default_backend())


# ---------- Password utils ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(12)).decode()

def verify_password(password: str, hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), hash.encode())


# ---------- JWT token utils ----------
def create_token(user_id: int) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(seconds=TOKEN_EXPIRY_SECONDS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


# ---------- Admin verification using RSA ----------
def verify_admin_signature(user_id: int, signature_hex: str) -> bool:
    try:
        public_key.verify(
            bytes.fromhex(signature_hex),
            f"admin:{user_id}".encode(),
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        return True
    except Exception:
        return False


# ---------- Protected admin route dependency ----------
async def require_admin(
    authorization: str = Header(...),
    x_admin_token: str = Header(..., alias="X-Admin-Token")
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")
    
    token = authorization.split(" ")[1]
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not verify_admin_signature(user_id, x_admin_token):
        raise HTTPException(status_code=403, detail="Admin signature invalid")

    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
