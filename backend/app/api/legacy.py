"""Legacy routes — backward compatible with existing frontend."""

from typing import List, Literal, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.config import get_settings
from app.services.ai_copilot import (
    EngineContext,
    extract_mermaid,
    mock_answer,
    openai_chat,
    system_prompt,
)

router = APIRouter(tags=["legacy"])
settings = get_settings()


class ImpactSegment(BaseModel):
    label: str
    value: int
    color: str


class TransformationOverview(BaseModel):
    peopleImpacted: int
    projectsOnTrack: int
    projectsTotal: int
    atRisk: int
    completed: int
    impactDistribution: List[ImpactSegment]


class KpiMetric(BaseModel):
    id: str
    title: str
    value: str | int
    change: Optional[str] = None
    suffix: Optional[str] = None
    trend: Optional[List[float]] = None
    trendTone: Optional[str] = None


class DashboardData(BaseModel):
    kpis: List[KpiMetric]
    overview: TransformationOverview
    insights: list
    initiatives: list
    collaboration: list
    sprint: dict
    pipeline: list
    healthScore: float


class ChatRequest(BaseModel):
    prompt: str
    context: Optional[EngineContext] = None
    consentAccepted: bool = False


class DocumentRequest(BaseModel):
    title: str
    content: str
    context: Optional[EngineContext] = None
    consentAccepted: bool = False


class MermaidRequest(BaseModel):
    prompt: str
    context: Optional[str] = None
    consentAccepted: bool = False


class ChatResponse(BaseModel):
    role: Literal["assistant"] = "assistant"
    content: str
    model: Optional[str] = None
    mock: bool = False


class MermaidResponse(BaseModel):
    code: str
    note: str
    mock: bool = False


DASHBOARD = DashboardData(
    kpis=[
        KpiMetric(id="transformation", title="Transformation Score", value="87.4",
                  change="↑ 12.5% vs last month", trend=[62, 65, 64, 70, 73, 78, 82, 87], trendTone="primary"),
        KpiMetric(id="projects", title="Total Projects", value=24,
                  change="↑ 3 this week", trend=[14, 16, 17, 18, 20, 21, 23, 24], trendTone="secondary"),
        KpiMetric(id="savings", title="Cost Savings (YTD)", value="$2.48M",
                  change="↑ 18.7% vs last year", trend=[1.1, 1.3, 1.5, 1.7, 1.9, 2.1, 2.3, 2.48], trendTone="success"),
        KpiMetric(id="velocity", title="Velocity (Avg)", value="68.2",
                  change="↑ 7.3% vs last sprint", trend=[54, 58, 56, 61, 60, 64, 66, 68], trendTone="warning"),
    ],
    overview=TransformationOverview(
        peopleImpacted=2847, projectsOnTrack=18, projectsTotal=24, atRisk=3, completed=8,
        impactDistribution=[
            ImpactSegment(label="High", value=32, color="var(--danger)"),
            ImpactSegment(label="Medium", value=45, color="var(--warning)"),
            ImpactSegment(label="Low", value=23, color="var(--success)"),
        ],
    ),
    insights=[],
    initiatives=[],
    collaboration=[],
    sprint={"name": "Sprint 24", "progress": 68, "storyPoints": {"done": 342, "total": 500},
            "tasksCompleted": 47, "tasksTotal": 62},
    pipeline=[],
    healthScore=98.6,
)


@router.get("/api/dashboard", response_model=DashboardData)
def get_dashboard():
    return DASHBOARD


@router.get("/api/dashboard/health")
def get_health_score():
    return DASHBOARD.healthScore


@router.post("/api/ai/chat", response_model=ChatResponse)
def ai_chat(req: ChatRequest):
    if not settings.openai_enabled:
        return ChatResponse(content=mock_answer(req.prompt), mock=True)
    try:
        content = openai_chat(
            [
                {"role": "system", "content": system_prompt(req.context)},
                {"role": "user", "content": req.prompt},
            ]
        )
        return ChatResponse(content=content, model=settings.openai_model)
    except Exception:
        return ChatResponse(content=mock_answer(req.prompt), mock=True)


@router.post("/api/ai/analyze-document", response_model=ChatResponse)
def analyze_document(req: DocumentRequest):
    if not req.consentAccepted:
        return ChatResponse(
            content="Document analysis requires user consent under the 4CHGM data processing policy.",
            mock=True,
        )
    text = req.content[:50000]
    if not settings.openai_enabled:
        return ChatResponse(
            content=f"Summary of «{req.title}» (mock): document contains {len(text.split())} words.",
            mock=True,
        )
    try:
        content = openai_chat(
            [
                {"role": "system", "content": system_prompt(req.context) + " Analyze documents: summary, risks, action items."},
                {"role": "user", "content": f"Analyze this document titled «{req.title}»:\n\n{text}"},
            ]
        )
        return ChatResponse(content=content, model=settings.openai_model)
    except Exception:
        return ChatResponse(content=f"Could not analyze «{req.title}». Please retry.", mock=True)


@router.post("/api/ai/mermaid", response_model=MermaidResponse)
def generate_mermaid(req: MermaidRequest):
    if not settings.openai_enabled:
        return MermaidResponse(
            code="flowchart LR\n  A[User data] --> B[4CHGM AI]\n  B --> C[Diagram]",
            note="Mock diagram — set OPENAI_API_KEY for AI generation.",
            mock=True,
        )
    try:
        raw = openai_chat(
            [
                {"role": "system", "content": "Return ONLY valid Mermaid diagram code in a ```mermaid fenced block."},
                {"role": "user", "content": f"Generate a Mermaid diagram: {req.prompt}\n\nContext:\n{req.context or 'none'}"},
            ]
        )
        return MermaidResponse(code=extract_mermaid(raw), note="AI-generated via OpenAI — edit the source freely.")
    except Exception:
        return MermaidResponse(
            code="flowchart TD\n  Error[Generation failed] --> Retry[Retry prompt]",
            note="OpenAI request failed.",
            mock=True,
        )
