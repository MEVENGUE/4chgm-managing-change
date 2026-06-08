from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models import User
from app.schemas.auth import AuthResponse, LoginRequest, RefreshRequest, RegisterRequest, UserResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    try:
        return auth_service.register_user(db, payload)
    except ValueError as e:
        if str(e) == "email_taken":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        raise


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    try:
        return auth_service.login_user(db, payload.email, payload.password, payload.remember)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")


@router.post("/refresh", response_model=AuthResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        return auth_service.refresh_session(db, payload.refreshToken)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return auth_service.user_to_response(user)
