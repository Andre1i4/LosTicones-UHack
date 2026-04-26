"""Match and opponent analysis routes"""
from fastapi import APIRouter, HTTPException
from typing import List
from ..services.bigquery_service import BigQueryService
from ..models.match import Match, MatchSummary

router = APIRouter()
bq_service = BigQueryService()

@router.get("", response_model=List[dict])
async def get_all_matches():
    """Get list of all available matches"""
    try:
        matches = bq_service.get_all_matches(limit=50)
        return matches
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/next", response_model=Match)
async def get_next_match():
    """Get next match (for dashboard)"""
    try:
        match = bq_service.get_next_match()
        if not match:
            raise HTTPException(status_code=404, detail="No matches found")
        return match
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recent", response_model=List[MatchSummary])
async def get_recent_analyses():
    """Get recent match analyses (for dashboard)"""
    try:
        analyses = bq_service.get_recent_analyses(limit=6)
        return analyses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{match_id}", response_model=Match)
async def get_match_detail(match_id: str):
    """Get specific match details"""
    try:
        # For MVP, just return the match by name
        match = bq_service.get_next_match(specific_match=match_id)
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        return match
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
