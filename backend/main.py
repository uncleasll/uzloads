from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from routers import loads, drivers, settlements, attachments, auth
from models.base import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

# Ensure upload directory exists
os.makedirs(os.getenv("UPLOAD_DIR", "./uploads"), exist_ok=True)

app = FastAPI(
    title="Uzloads TMS API",
    description="Enterprise Transportation Management System",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://uzloads-frontend.onrender.com/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads for static file serving
upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(drivers.router, prefix="/api/drivers", tags=["Drivers"])
app.include_router(loads.router, prefix="/api/loads", tags=["Loads"])
app.include_router(attachments.router, prefix="/api/attachments", tags=["Attachments"])
app.include_router(settlements.router, prefix="/api/settlements", tags=["Settlements"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Uzloads TMS"}
