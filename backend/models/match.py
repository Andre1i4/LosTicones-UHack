from pydantic import BaseModel
from typing import List
from .player import OpponentPlayer, UClujPlayer

class Match(BaseModel):
    """Match/Opponent profile"""
    id: str
    name: str
    country: str
    formation: str
    form: List[str]  # ['W', 'D', 'L']
    avgPossession: float
    avgGoalsScored: float
    avgGoalsConceded: float
    avgShotsOnTarget: float
    pressingIntensity: float
    setPieceThreat: str  # 'Low' | 'Medium' | 'High' | 'Very High'
    coachNote: str
    dateAnalyzed: str
    competition: str
    matchDate: str
    players: List[OpponentPlayer] = []

class MatchSummary(BaseModel):
    """Recent match analysis summary"""
    id: str
    opponentName: str
    country: str
    formation: str
    dateAnalyzed: str
    form: List[str]
