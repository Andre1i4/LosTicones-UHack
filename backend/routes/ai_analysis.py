"""
AI Analysis Routes - Using simple REST-based approach
No complex dependencies - just FastAPI + requests
"""

from fastapi import APIRouter, HTTPException
from ..simple_analyzer import SimplePlayerAnalyzer

router = APIRouter()

# Initialize analyzer (uses local ADC)
analyzer = SimplePlayerAnalyzer()


@router.get("/health")
async def health_check():
    """Check if AI analysis service is ready"""
    return {
        "status": "ok",
        "service": "ai-analysis",
        "bigquery": "connected",
        "vertex_ai": "ready",
        "message": "Ready to analyze real data!"
    }


@router.get("/analyze/{player_name}")
async def analyze_player(player_name: str):
    """
    Analyze a player using real BigQuery data + Vertex AI
    
    Returns:
    - Player statistics from BigQuery
    - AI-generated analysis
    
    Example: GET /api/ai/analyze/Cristiano Ronaldo
    """
    try:
        result = analyzer.analyze_player(player_name)
        
        if not result['success']:
            raise HTTPException(
                status_code=404,
                detail=result.get('error', 'Analysis failed')
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/compare")
async def compare_players(player1: str, player2: str):
    """
    Compare two players using real BigQuery data + Vertex AI
    
    Query parameters:
    - player1: First player name
    - player2: Second player name
    
    Returns:
    - Statistics for both players
    - AI-generated comparison
    
    Example: GET /api/ai/compare?player1=Ronaldo&player2=Messi
    """
    try:
        if not player1 or not player2:
            raise HTTPException(
                status_code=400,
                detail="Both player1 and player2 required"
            )
        
        result = analyzer.compare_players(player1, player2)
        
        if not result['success']:
            raise HTTPException(
                status_code=404,
                detail=result.get('error', 'Comparison failed')
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/{player_name}")
async def get_player_stats(player_name: str):
    """
    Get player statistics from BigQuery (no AI analysis)
    
    Useful when you just need the raw data
    
    Example: GET /api/ai/stats/Cristiano Ronaldo
    """
    try:
        stats = analyzer.get_player_stats(player_name)
        
        if not stats:
            raise HTTPException(
                status_code=404,
                detail=f"No data found for {player_name}"
            )
        
        return {
            "success": True,
            "stats": stats
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
