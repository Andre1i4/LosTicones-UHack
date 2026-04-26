from pydantic import BaseModel
from typing import List

class Attachment(BaseModel):
    """File attachment for assignment"""
    id: str
    name: str
    fileType: str  # 'image' | 'video' | 'pdf' | 'document'
    dataUrl: str = ""
    size: int = 0

class Assignment(BaseModel):
    """Player-to-player assignment"""
    opponentPlayerId: str
    uclujPlayerId: str
    note: str
    attachments: List[Attachment] = []

class AssignmentResponse(Assignment):
    """Assignment with IDs for storage"""
    id: str = ""
