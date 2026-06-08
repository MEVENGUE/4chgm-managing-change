from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    firstName: str
    lastName: str
    username: str = ""
    company: str = ""
    role: str = "member"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember: bool = False


class RefreshRequest(BaseModel):
    refreshToken: str


class UserResponse(BaseModel):
    id: str
    email: str
    firstName: str
    lastName: str
    username: str
    company: str
    role: str
    avatarUrl: str | None = None
    locale: str = "en"
    createdAt: str


class AuthResponse(BaseModel):
    token: str
    refreshToken: str
    user: UserResponse
    expiresAt: str
    workspaceId: str | None = None
    organizationId: str | None = None
