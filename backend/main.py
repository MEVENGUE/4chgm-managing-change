"""4CHGM — FastAPI backend.

Serves the same data shapes the Next.js frontend expects. The frontend points at
this API by setting NEXT_PUBLIC_API_URL (e.g. http://localhost:8000). Without it,
the frontend uses local mock data.

Run:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import os
from typing import List, Literal, Optional

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="4CHGM API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ───────────────────────── Models ─────────────────────────
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


class PortfolioContext(BaseModel):
    total: Optional[int] = None
    atRisk: Optional[int] = None
    avgHealth: Optional[int] = None
    overrunPct: Optional[int] = None


class EngineContext(BaseModel):
    orgName: Optional[str] = None
    industry: Optional[str] = None
    goals: Optional[List[str]] = None
    workspace: Optional[str] = None
    role: Optional[str] = None
    portfolio: Optional[PortfolioContext] = None


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


# ───────────────────────── Mock data ─────────────────────────
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
    insights=[
        {"id": "1", "text": "Cloud migration costs trending 15% above forecast for Q3.", "priority": "high", "tag": "High Impact"},
        {"id": "2", "text": "Team velocity increased 7.3% — consider expanding sprint capacity.", "priority": "medium", "tag": "Medium Risk"},
        {"id": "3", "text": "3 initiatives approaching deadline without risk mitigation plan.", "priority": "high", "tag": "High Impact"},
        {"id": "4", "text": "Stakeholder engagement score improved to 82% this quarter.", "priority": "low", "tag": "Positive"},
    ],
    initiatives=[
        {"id": "1", "name": "Cloud Migration Phase 2", "progress": 72, "status": "on-track"},
        {"id": "2", "name": "ERP Modernization", "progress": 45, "status": "at-risk"},
        {"id": "3", "name": "AI Adoption Program", "progress": 88, "status": "on-track"},
        {"id": "4", "name": "Data Governance Framework", "progress": 34, "status": "at-risk"},
    ],
    collaboration=[
        {"id": "1", "user": "Alex Johnson", "action": "updated the roadmap timeline", "time": "2m ago"},
        {"id": "2", "user": "Maria Santos", "action": "completed sprint review", "time": "15m ago"},
        {"id": "3", "user": "James Park", "action": "flagged risk on ERP project", "time": "1h ago"},
        {"id": "4", "user": "Dr. Sarah Chen", "action": "approved Q3 budget forecast", "time": "2h ago"},
    ],
    sprint={"name": "Sprint 24", "progress": 68, "storyPoints": {"done": 342, "total": 500},
            "tasksCompleted": 47, "tasksTotal": 62},
    pipeline=[
        {"id": "1", "name": "Code Commit", "status": "done", "time": "2m ago"},
        {"id": "2", "name": "Build", "status": "done", "time": "1m ago"},
        {"id": "3", "name": "Tests", "status": "done", "time": "45s ago"},
        {"id": "4", "name": "Security Scan", "status": "done", "time": "30s ago"},
        {"id": "5", "name": "Deploy", "status": "active", "time": "In progress"},
        {"id": "6", "name": "Monitor", "status": "pending"},
    ],
    healthScore=98.6,
)


# ───────────────────────── Routes ─────────────────────────
@app.get("/")
def root():
    return {
        "service": "4CHGM API",
        "version": "0.1.0",
        "status": "ok",
        "docs": "/docs",
        "health": "/health",
        "hint": "This is the backend API. Deploy the Next.js frontend on Vercel.",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/dashboard", response_model=DashboardData)
def get_dashboard():
    return DASHBOARD


@app.get("/api/dashboard/health")
def get_health_score():
    return DASHBOARD.healthScore


def _system_prompt(ctx: Optional[EngineContext] = None) -> str:
    base = (
        "You are 4CHGM, an enterprise transformation copilot. Be concise, strategic and actionable. "
        "Responses must be grounded in the user's organizational context when provided. "
        "Never invent confidential data; state assumptions clearly."
    )
    if not ctx:
        return base
    parts = [base]
    if ctx.orgName:
        parts.append(f"Organization: {ctx.orgName}.")
    if ctx.workspace:
        parts.append(f"Workspace: {ctx.workspace} ({ctx.role or 'user'}).")
    if ctx.portfolio:
        p = ctx.portfolio
        parts.append(
            f"Portfolio: {p.total or 0} initiatives, {p.atRisk or 0} at risk, "
            f"health {p.avgHealth or 0}, budget forecast {p.overrunPct or 0}%."
        )
    if ctx.goals:
        parts.append(f"Goals: {', '.join(ctx.goals)}.")
    return " ".join(parts)


def _openai_chat(messages: list, model: str) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    completion = client.chat.completions.create(model=model, messages=messages)
    return completion.choices[0].message.content or ""


def _extract_mermaid(text: str) -> str:
    if "```mermaid" in text:
        return text.split("```mermaid", 1)[1].split("```", 1)[0].strip()
    if "```" in text:
        return text.split("```", 1)[1].split("```", 1)[0].strip()
    return text.strip()


@app.post("/api/ai/chat", response_model=ChatResponse)
def ai_chat(req: ChatRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    if not api_key:
        return ChatResponse(content=_mock_answer(req.prompt), mock=True)
    try:
        content = _openai_chat(
            [
                {"role": "system", "content": _system_prompt(req.context)},
                {"role": "user", "content": req.prompt},
            ],
            model,
        )
        return ChatResponse(content=content, model=model)
    except Exception:
        return ChatResponse(content=_mock_answer(req.prompt), mock=True)


@app.post("/api/ai/analyze-document", response_model=ChatResponse)
def analyze_document(req: DocumentRequest):
    if not req.consentAccepted:
        return ChatResponse(
            content="Document analysis requires user consent under the 4CHGM data processing policy.",
            mock=True,
        )
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    text = req.content[:50000]
    if not api_key:
        return ChatResponse(
            content=f"Summary of «{req.title}» (mock): document contains {len(text.split())} words. Key themes detected from user content.",
            mock=True,
        )
    try:
        content = _openai_chat(
            [
                {"role": "system", "content": _system_prompt(req.context) + " Analyze documents: summary, risks, action items."},
                {
                    "role": "user",
                    "content": f"Analyze this document titled «{req.title}»:\n\n{text}",
                },
            ],
            model,
        )
        return ChatResponse(content=content, model=model)
    except Exception:
        return ChatResponse(content=f"Could not analyze «{req.title}». Please retry.", mock=True)


@app.post("/api/ai/mermaid", response_model=MermaidResponse)
def generate_mermaid(req: MermaidRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    if not api_key:
        return MermaidResponse(
            code="flowchart LR\n  A[User data] --> B[4CHGM AI]\n  B --> C[Diagram]",
            note="Mock diagram — set OPENAI_API_KEY for AI generation.",
            mock=True,
        )
    try:
        raw = _openai_chat(
            [
                {
                    "role": "system",
                    "content": "Return ONLY valid Mermaid diagram code in a ```mermaid fenced block. Enterprise architecture style, no prose.",
                },
                {
                    "role": "user",
                    "content": f"Generate a Mermaid diagram: {req.prompt}\n\nContext:\n{req.context or 'none'}",
                },
            ],
            model,
        )
        code = _extract_mermaid(raw)
        return MermaidResponse(code=code, note="AI-generated via OpenAI — edit the source freely.")
    except Exception:
        return MermaidResponse(
            code="flowchart TD\n  Error[Generation failed] --> Retry[Retry prompt]",
            note="OpenAI request failed.",
            mock=True,
        )


def _mock_answer(prompt: str) -> str:
    p = prompt.lower()
    if "cost" in p or "cloud" in p:
        return ("By consolidating idle compute and moving 3 workloads to reserved instances, "
                "you can reduce cloud costs by 18–22% (~$680K/year) without impacting your SLA.")
    if "risk" in p:
        return ("I detected 3 elevated risks across Q3 initiatives. The highest priority is the "
                "dependency vulnerabilities, which can be remediated within the current sprint.")
    return f'Analysis of "{prompt}": meaningful optimization potential across cost, delivery and risk.'
