from pydantic import BaseModel
from typing import Literal

class LoginRequest(BaseModel):
    """Login payload"""
    name: str
    password: str
    teamKey: str
    role: Literal['coach', 'player'] = 'player'

class LoginResponse(BaseModel):
    """Login response"""
    success: bool
    message: str
    name: str = ""
    role: str = ""
    token: str = ""
