from typing import List, Literal, Optional

from pydantic import BaseModel

from app.services.ai_copilot import EngineContext


class CopilotChatRequest(BaseModel):
    prompt: str
    threadId: Optional[str] = None
    context: Optional[EngineContext] = None
    consentAccepted: bool = True


class DocumentChatRequest(BaseModel):
    title: str
    content: str
    threadId: Optional[str] = None
    context: Optional[EngineContext] = None
    consentAccepted: bool = False


class Citation(BaseModel):
    sourceId: str
    title: str
    snippet: str
    score: float


class AiAction(BaseModel):
    id: str
    label: str
    kind: Literal["navigate", "generate", "open"] = "navigate"
    payload: str


class CopilotChatResponse(BaseModel):
    content: str
    threadId: str
    messageId: str
    citations: List[Citation] = []
    actions: List[AiAction] = []
    contextUsed: List[str] = []
    model: Optional[str] = None
    mock: bool = False


class ThreadMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    citations: list = []
    createdAt: str


class ThreadResponse(BaseModel):
    id: str
    title: str
    createdAt: str
    updatedAt: str
    messages: List[ThreadMessageResponse]
