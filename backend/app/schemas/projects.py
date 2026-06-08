from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    title: str
    description: str = ""
    status: str = "planning"
    risk_score: int = 0
    impact_score: int = 0
    health_score: int = 0
    budget_planned: float = 0
    budget_spent: float = 0
    progress: int = 0
    owner: str = ""
    phase: str = "Discovery"
    start_date: str = ""
    due_date: str = ""
    tags: list[str] = Field(default_factory=list)
    dependencies: list[str] = Field(default_factory=list)


class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    risk_score: int | None = None
    impact_score: int | None = None
    health_score: int | None = None
    budget_planned: float | None = None
    budget_spent: float | None = None
    progress: int | None = None
    owner: str | None = None
    phase: str | None = None
    start_date: str | None = None
    due_date: str | None = None
    tags: list[str] | None = None
    dependencies: list[str] | None = None


class ProjectResponse(BaseModel):
    id: str
    workspace_id: str
    name: str
    description: str
    owner: str
    status: str
    phase: str
    progress: int
    budgetPlanned: float
    budgetSpent: float
    riskScore: int
    impactScore: int
    startDate: str
    dueDate: str
    dependencies: list[str]
    tags: list[str]
