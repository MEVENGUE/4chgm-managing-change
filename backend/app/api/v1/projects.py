from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models import Organization, Project, User, Workspace
from app.schemas.projects import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


def _get_workspace(db: Session, user: User, workspace_id: str | None) -> Workspace:
    org = db.query(Organization).filter(Organization.owner_id == user.id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    if workspace_id:
        ws = db.query(Workspace).filter(Workspace.id == workspace_id, Workspace.organization_id == org.id).first()
    else:
        ws = db.query(Workspace).filter(Workspace.organization_id == org.id).first()
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    return ws


def _to_response(p: Project) -> ProjectResponse:
    return ProjectResponse(
        id=p.id,
        workspace_id=p.workspace_id,
        name=p.title,
        description=p.description,
        owner=p.owner,
        status=p.status,
        phase=p.phase,
        progress=p.progress,
        budgetPlanned=p.budget_planned,
        budgetSpent=p.budget_spent,
        riskScore=p.risk_score,
        impactScore=p.impact_score,
        startDate=p.start_date,
        dueDate=p.due_date,
        dependencies=p.dependencies or [],
        tags=p.tags or [],
    )


@router.get("", response_model=list[ProjectResponse])
def list_projects(
    workspace_id: str | None = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(db, user, workspace_id)
    projects = db.query(Project).filter(Project.workspace_id == ws.id).order_by(Project.created_at.desc()).all()
    return [_to_response(p) for p in projects]


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    workspace_id: str | None = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(db, user, workspace_id)
    project = Project(
        workspace_id=ws.id,
        title=payload.title,
        description=payload.description,
        status=payload.status,
        risk_score=payload.risk_score,
        impact_score=payload.impact_score,
        health_score=payload.health_score,
        budget_planned=payload.budget_planned,
        budget_spent=payload.budget_spent,
        progress=payload.progress,
        owner=payload.owner or user.full_name,
        phase=payload.phase,
        start_date=payload.start_date,
        due_date=payload.due_date,
        tags=payload.tags,
        dependencies=payload.dependencies,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return _to_response(project)


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(db, user, None)
    project = db.query(Project).filter(Project.id == project_id, Project.workspace_id == ws.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return _to_response(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(db, user, None)
    project = db.query(Project).filter(Project.id == project_id, Project.workspace_id == ws.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    db.delete(project)
    db.commit()
