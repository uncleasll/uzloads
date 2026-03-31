from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta
import os

router = APIRouter()

# Muhit o'zgaruvchilari (Environment Variables)
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-64-chars-long")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

# Bcrypt konfiguratsiyasi
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# --- YORDAMCHI FUNKSIYALAR ---

def get_safe_password(password: str) -> str:
    # 72 bayt limitini saqlab, yana stringga qaytaradi
    return password.encode("utf-8")[:72].decode("utf-8", "ignore")

def hash_password(password: str) -> str:
    # Passlib faqat string bilan ishlashini ta'minlaymiz
    return pwd_context.hash(get_safe_password(password))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(get_safe_password(plain_password), hashed_password)

# --- DEMO MA'LUMOTLAR ---

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

# --- MODELLAR ---

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    full_name: str
    role: str

# --- JWT LOGIKASI ---

def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None or username not in DEMO_USERS:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return DEMO_USERS[username]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- ENDPOINTLAR ---

@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = DEMO_USERS.get(form_data.username)

    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

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
    # Parol xeshini javobdan olib tashlaymiz
    user_data = current_user.copy()
    user_data.pop("hashed_password", None)
    return user_data