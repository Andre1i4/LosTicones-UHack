from pydantic import BaseModel
from typing import List, Optional

class PlayerStats(BaseModel):
    """Player performance statistics"""
    goals: int = 0
    assists: int = 0
    xg: float = 0.0
    passAcc: float = 0.0
    duelsWon: int = 0
    aerialDuels: int = 0
    distanceCovered: float = 0.0
    dribblesPerGame: Optional[float] = None
    crossingAcc: Optional[float] = None
    shotsOnTarget: Optional[int] = None
    minutesOnField: int = 0

class OpponentPlayer(BaseModel):
    """Opponent player profile"""
    id: str
    name: str
    number: int
    position: str
    positionShort: str
    age: int
    foot: str
    x: float
    y: float
    stats: PlayerStats
    strengths: List[str] = []
    playingStyleNotes: List[str] = []

class UClujPlayer(BaseModel):
    """U Cluj player profile"""
    id: str
    name: str
    number: int
    position: str
    positionShort: str
    age: int
    foot: str
    x: float
    y: float
    stats: PlayerStats
    strengths: List[str] = []
