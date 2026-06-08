from fastapi import APIRouter, Depends
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.agents.base import AgentContext, AgentType, run_agent
from app.core.deps import get_current_user
from app.database import get_db
from app.models import Project, User
from app.services.export_engine import export_and_store, generate_pdf_report, generate_ppt_summary
from app.services.knowledge_engine import build_context_block, hybrid_retrieve
from app.services.workspace import get_user_org_workspace

router = APIRouter(prefix="/exports", tags=["exports"])


class ExportRequest(BaseModel):
    title: str = "4CHGM Executive Report"
    orgName: str = "Enterprise"
    format: str = "pdf"  # pdf | pptx


class AgentRequest(BaseModel):
    agent: str
    query: str


@router.post("/executive")
def export_executive(req: ExportRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org, ws = get_user_org_workspace(db, user)
    projects = db.query(Project).filter(Project.workspace_id == ws.id).all()
    hits = hybrid_retrieve(db, ws.id, "transformation risk budget", top_k=5)
    ctx_block = build_context_block(hits)

    sections = [
        {"heading": "Organization", "body": f"{req.orgName} — Transformation intelligence report."},
        {"heading": "Portfolio", "body": f"{len(projects)} initiatives. " + "; ".join(f"{p.title} ({p.progress}%)" for p in projects[:6])},
        {"heading": "AI Insights", "body": ctx_block},
    ]
    bullets = [f"{p.title}: {p.status}, progress {p.progress}%" for p in projects[:6]]
    bullets.append("Knowledge base cited in RAG analysis.")

    if req.format == "pptx":
        data = generate_ppt_summary(req.title, bullets)
        key, url = export_and_store(data, f"{req.title}.pptx", "exports", org.id, ws.id, user.id, "application/vnd.openxmlformats-officedocument.presentationml.presentation")
        return {"format": "pptx", "storageKey": key, "url": url, "size": len(data)}

    data = generate_pdf_report(req.title, sections)
    key, url = export_and_store(data, f"{req.title}.pdf", "exports", org.id, ws.id, user.id, "application/pdf")
    return {"format": "pdf", "storageKey": key, "url": url, "size": len(data)}


@router.get("/executive/download")
def download_executive_pdf(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org, ws = get_user_org_workspace(db, user)
    projects = db.query(Project).filter(Project.workspace_id == ws.id).all()
    sections = [
        {"heading": "Executive Summary", "body": f"Portfolio health across {len(projects)} initiatives."},
        {"heading": "Initiatives", "body": "\n".join(f"• {p.title} — {p.progress}% ({p.status})" for p in projects)},
    ]
    data = generate_pdf_report("4CHGM Executive Report", sections)
    return Response(content=data, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=4chgm-executive-report.pdf"})


@router.post("/agents/run")
def run_specialized_agent(req: AgentRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _, ws = get_user_org_workspace(db, user)
    try:
        agent_type = AgentType(req.agent)
    except ValueError:
        agent_type = AgentType.EXECUTIVE
    hits = hybrid_retrieve(db, ws.id, req.query, top_k=6)
    ctx = AgentContext(agent=agent_type, workspace_id=ws.id, query=req.query, retrieved_context=build_context_block(hits))
    result = run_agent(ctx)
    return {
        "agent": result.agent.value,
        "content": result.content,
        "citations": [{"title": h.title, "snippet": h.snippet} for h in hits[:4]],
        "suggested_actions": result.suggested_actions,
    }
