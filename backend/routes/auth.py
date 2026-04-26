"""Authentication routes (MVP: simple pass-through)"""
from fastapi import APIRouter
from ..models.auth import LoginRequest, LoginResponse

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """MVP Login - just validate presence of credentials"""
    if not request.name or not request.password or not request.teamKey:
        return LoginResponse(
            success=False,
            message="Missing credentials"
        )
    
    # MVP: Simple pass-through auth
    return LoginResponse(
        success=True,
        message="Login successful",
        name=request.name,
        role=request.role,
        token=f"token-{request.name}"  # Mock token
    )
