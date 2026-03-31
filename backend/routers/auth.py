from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
import hashlib  # 🔥 qo‘shildi

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production-32-chars-min")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


# 🔐 HASH FUNCTION (FIX)
def hash_password(password: str) -> str:
    password = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.hash(password)


# 🔍 VERIFY FUNCTION (FIX)
def verify_password(plain: str, hashed: str) -> bool:
    plain = hashlib.sha256(plain.encode()).hexdigest()
    return pwd_context.verify(plain, hashed)


# Demo users — FIXED (endi to‘g‘ri hash ishlatiladi)
DEMO_USERS = {
    "admin": {
        "username": "admin",
        "full_name": "Admin User",
        "hashed_password": hash_password("admin123"),
        "role": "admin",
    },
    "dispatcher": {
        "username": "dispatcher",
        "full_name": "Dispatcher",
        "hashed_password": hash_password("dispatch123"),
        "role": "dispatcher",
    },
}


class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    full_name: str
    role: str


def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None or username not in DEMO_USERS:
            raise HTTPException(401, "Invalid credentials")
        return DEMO_USERS[username]
    except JWTError:
        raise HTTPException(401, "Invalid token")


@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = DEMO_USERS.get(form_data.username)

    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(401, "Incorrect username or password")

    token = create_token({"sub": user["username"]})

    return Token(
        access_token=token,
        token_type="bearer",
        username=user["username"],
        full_name=user["full_name"],
        role=user["role"],
    )


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "hashed_password"}