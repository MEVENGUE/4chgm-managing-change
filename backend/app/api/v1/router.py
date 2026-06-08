from fastapi import APIRouter

from app.api.v1 import analytics, auth, copilot, diagrams, documents, exports, integrations, knowledge, projects

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(projects.router)
api_router.include_router(documents.router)
api_router.include_router(knowledge.router)
api_router.include_router(copilot.router)
api_router.include_router(analytics.router)
api_router.include_router(integrations.router)
api_router.include_router(exports.router)
api_router.include_router(diagrams.router)
