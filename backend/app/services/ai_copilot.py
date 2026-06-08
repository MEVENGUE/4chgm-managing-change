"""OpenAI copilot, document analysis, and Mermaid generation."""

from __future__ import annotations

import os
from typing import List, Optional

from pydantic import BaseModel

from app.config import get_settings

settings = get_settings()


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


def system_prompt(ctx: Optional[EngineContext] = None) -> str:
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


def openai_chat(messages: list, model: str | None = None) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=settings.openai_api_key or os.getenv("OPENAI_API_KEY"))
    completion = client.chat.completions.create(
        model=model or settings.openai_model,
        messages=messages,
    )
    return completion.choices[0].message.content or ""


def extract_mermaid(text: str) -> str:
    if "```mermaid" in text:
        return text.split("```mermaid", 1)[1].split("```", 1)[0].strip()
    if "```" in text:
        return text.split("```", 1)[1].split("```", 1)[0].strip()
    return text.strip()


def mock_answer(prompt: str) -> str:
    p = prompt.lower()
    if "cost" in p or "cloud" in p:
        return (
            "By consolidating idle compute and moving 3 workloads to reserved instances, "
            "you can reduce cloud costs by 18–22% (~$680K/year) without impacting your SLA."
        )
    if "risk" in p:
        return (
            "I detected 3 elevated risks across Q3 initiatives. The highest priority is the "
            "dependency vulnerabilities, which can be remediated within the current sprint."
        )
    return f'Analysis of "{prompt}": meaningful optimization potential across cost, delivery and risk.'
