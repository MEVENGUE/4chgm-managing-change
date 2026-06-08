from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models import Document, Project, User
from app.services.workspace import get_user_org_workspace

router = APIRouter(prefix="/analytics", tags=["analytics"])


class AnalyticsInsight(BaseModel):
    id: str
    text: str
    priority: str
    tag: str


class ForecastPoint(BaseModel):
    label: str
    value: float


class AnalyticsResponse(BaseModel):
    healthScore: float
    projectsTotal: int
    atRisk: int
    onTrack: int
    documentsIndexed: int
    insights: list[AnalyticsInsight]
    costTrend: list[ForecastPoint]
    velocityTrend: list[ForecastPoint]


@router.get("/dashboard", response_model=AnalyticsResponse)
def analytics_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _, ws = get_user_org_workspace(db, user)
    projects = db.query(Project).filter(Project.workspace_id == ws.id).all()
    docs = db.query(Document).filter(Document.workspace_id == ws.id).count()
    total = len(projects) or 1
    at_risk = sum(1 for p in projects if p.status == "at-risk")
    on_track = sum(1 for p in projects if p.status in ("on-track", "completed"))
    avg_health = sum(p.health_score or p.progress for p in projects) / total
    avg_progress = sum(p.progress for p in projects) / total
    budget_spent = sum(p.budget_spent for p in projects)
    budget_planned = sum(p.budget_planned for p in projects) or 1

    insights = []
    for p in projects:
        if p.status == "at-risk" or (p.risk_score or 0) >= 60:
            insights.append(
                AnalyticsInsight(
                    id=p.id,
                    text=f"{p.title}: risk {p.risk_score}, progress {p.progress}%",
                    priority="high" if p.risk_score >= 70 else "medium",
                    tag="At Risk" if p.status == "at-risk" else "Watch",
                )
            )
    if docs > 0:
        insights.append(
            AnalyticsInsight(
                id="knowledge",
                text=f"{docs} documents indexed — copilot RAG enriched.",
                priority="low",
                tag="Knowledge",
            )
        )

    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    util = budget_spent / budget_planned * 100
    cost_trend = [ForecastPoint(label=months[i], value=round(util * (0.7 + i * 0.025), 1)) for i in range(12)]
    vel_trend = [ForecastPoint(label=months[i], value=round(avg_progress * (0.72 + i * 0.023), 1)) for i in range(12)]

    return AnalyticsResponse(
        healthScore=round(avg_health, 1),
        projectsTotal=len(projects),
        atRisk=at_risk,
        onTrack=on_track,
        documentsIndexed=docs,
        insights=insights[:6],
        costTrend=cost_trend,
        velocityTrend=vel_trend,
    )
