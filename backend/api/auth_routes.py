"""
Authentication routes - JWT-based login for admin/teacher/student
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os

from database.db import get_connection

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "attendance-pro-secret-key-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 hours

pwd_ctx = CryptContext(schemes=["bcrypt"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ─── Schemas ────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    role: str = "teacher"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    full_name: str


# ─── Helpers ────────────────────────────────────────────────────────────────

def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def require_role(*roles):
    def checker(user=Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return checker


# ─── Routes ─────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends()):
    conn = get_connection()
    user = conn.execute(
        "SELECT * FROM users WHERE username = ? AND is_active = 1", (form.username,)
    ).fetchone()
    conn.close()

    if not user or not pwd_ctx.verify(form.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"sub": str(user["id"]), "role": user["role"], "name": user["full_name"]})
    return {"access_token": token, "token_type": "bearer", "role": user["role"], "full_name": user["full_name"]}


@router.post("/register")
def register(req: RegisterRequest, user=Depends(require_role("admin"))):
    conn = get_connection()
    existing = conn.execute("SELECT id FROM users WHERE username = ? OR email = ?", (req.username, req.email)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Username or email already exists")

    hashed = pwd_ctx.hash(req.password)
    conn.execute(
        "INSERT INTO users (username, email, password_hash, role, full_name) VALUES (?, ?, ?, ?, ?)",
        (req.username, req.email, hashed, req.role, req.full_name)
    )
    conn.commit()
    conn.close()
    return {"message": f"User '{req.username}' created successfully"}


@router.get("/me")
def get_me(user=Depends(get_current_user)):
    return user


@router.get("/users")
def list_users(user=Depends(require_role("admin"))):
    conn = get_connection()
    users = conn.execute("SELECT id, username, email, role, full_name, created_at, is_active FROM users").fetchall()
    conn.close()
    return [dict(u) for u in users]
