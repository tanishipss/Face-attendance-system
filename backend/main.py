"""
Attendance Pro - FastAPI Backend
Industry-grade architecture with DeepFace, SQLite, anti-spoofing, JWT auth
"""
import os
# ── MUST be set before any TensorFlow/Keras import ──────────────────────────
os.environ["TF_USE_LEGACY_KERAS"] = "1"
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database.db import init_db
from api import face_routes, attendance_routes, auth_routes, admin_routes, export_routes

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[
        logging.FileHandler("logs/app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

os.makedirs("logs", exist_ok=True)
os.makedirs("face_db", exist_ok=True)
os.makedirs("embeddings", exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Attendance Pro API...")
    init_db()
    logger.info("✅ Database initialized")
    yield
    logger.info("🛑 Shutting down...")


app = FastAPI(
    title="Attendance Pro API",
    description="AI-powered attendance system with DeepFace, anti-spoofing, and real-time dashboard",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(face_routes.router, prefix="/api/face", tags=["Face Recognition"])
app.include_router(attendance_routes.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(admin_routes.router, prefix="/api/admin", tags=["Admin"])
app.include_router(export_routes.router, prefix="/api/export", tags=["Export"])


@app.get("/")
def root():
    return {"status": "online", "version": "2.0.0", "message": "Attendance Pro API"}


@app.get("/health")
def health():
    return {"status": "healthy"}
