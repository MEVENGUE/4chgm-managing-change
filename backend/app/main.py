"""4CHGM Enterprise AI Backend — FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.legacy import router as legacy_router
from app.api.v1.router import api_router
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Enterprise transformation intelligence API — auth, documents, RAG, copilot",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(legacy_router)


@app.get("/")
def root():
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "ok",
        "docs": "/docs",
        "health": "/health",
        "api": "/api/v1",
        "hint": "Frontend on Vercel · PostgreSQL + Redis + R2 on Railway/Cloudflare",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "openai": settings.openai_enabled,
        "r2": settings.r2_enabled,
        "environment": settings.environment,
    }
