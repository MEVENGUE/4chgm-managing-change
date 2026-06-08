"""Agent orchestration layer — extensible for Phase 5."""

from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel

from app.services.ai_copilot import openai_chat, system_prompt


class AgentType(str, Enum):
    EXECUTIVE = "executive"
    FINANCE = "finance"
    RISK = "risk"
    SCRUM = "scrum"
    DEVOPS = "devops"
    TRANSFORMATION = "transformation"


AGENT_PROMPTS = {
    AgentType.EXECUTIVE: "You are the Executive Agent. Produce strategic summaries and board-ready insights.",
    AgentType.FINANCE: "You are the Finance Agent. Analyze budgets, forecasts, and cost drift.",
    AgentType.RISK: "You are the Risk Agent. Detect risks and propose mitigations.",
    AgentType.SCRUM: "You are the Scrum Agent. Analyze sprints, velocity, and blockers.",
    AgentType.DEVOPS: "You are the DevOps Agent. Analyze pipelines, deployments, and failures.",
    AgentType.TRANSFORMATION: "You are the Transformation Agent. Analyze adoption and change resistance.",
}


class AgentContext(BaseModel):
    agent: AgentType
    workspace_id: str
    query: str
    retrieved_context: str = ""


class AgentResult(BaseModel):
    agent: AgentType
    content: str
    citations: list[dict] = []
    suggested_actions: list[str] = []


def run_agent(ctx: AgentContext, org_context: Optional[dict] = None) -> AgentResult:
    """Run a specialized agent with RAG context (Phase 5 full implementation)."""
    role_prompt = AGENT_PROMPTS[ctx.agent]
    messages = [
        {"role": "system", "content": f"{system_prompt()}\n{role_prompt}"},
        {
            "role": "user",
            "content": f"Context:\n{ctx.retrieved_context}\n\nQuestion: {ctx.query}",
        },
    ]
    try:
        content = openai_chat(messages)
    except Exception:
        content = f"[{ctx.agent.value}] Analysis pending — configure OPENAI_API_KEY."
    return AgentResult(
        agent=ctx.agent,
        content=content,
        suggested_actions=["Review portfolio risks", "Schedule stakeholder sync"],
    )
