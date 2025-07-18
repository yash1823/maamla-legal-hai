import os
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend

# Load private key from env
private_key_pem = os.getenv("PRIVATE_KEY").encode().replace(b"\\n", b"\n")
public_key_pem = os.getenv("PUBLIC_KEY").encode().replace(b"\\n", b"\n")

private_key = serialization.load_pem_private_key(
    private_key_pem,
    password=None,
    backend=default_backend()
)

public_key = serialization.load_pem_public_key(
    public_key_pem,
    backend=default_backend()
)

def sign_admin_token(user_id: int) -> str:
    message = f"admin:{user_id}".encode()
    signature = private_key.sign(
        message,
        padding.PKCS1v15(),
        hashes.SHA256()
    )
    return signature.hex()  # send to frontend

def verify_admin_token(user_id: int, signature_hex: str) -> bool:
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
