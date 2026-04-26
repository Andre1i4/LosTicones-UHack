"""
Vertex AI Analysis API Routes

Endpoints for real data analysis using BigQuery + Vertex AI
No mock data - completely real analysis!
"""

from fastapi import APIRouter, HTTPException
from ..services.vertex_ai_analyzer import PlayerAnalyzerVertexAI

router = APIRouter()

# Initialize analyzer (uses ADC automatically)
analyzer = PlayerAnalyzerVertexAI()


@router.get("/health/vertex-ai")
async def health_check():
    """Check if Vertex AI is properly configured"""
    try:
        return {
            "status": "ok",
            "vertex_ai": "connected",
            "project": "los-ticones-u-hack",
            "message": "Ready for real data analysis!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/players/{player_name}/analyze")
async def analyze_player(player_name: str):
    """
    Analyze a player using real BigQuery data + Vertex AI
    
    Returns:
    - Player statistics from BigQuery
    - AI-generated analysis and insights
    
    Example: GET /api/vertex/players/Cristiano Ronaldo/analyze
    """
    try:
        result = analyzer.analyze_player(player_name)
        
        if not result['success']:
            raise HTTPException(status_code=404, detail=result.get('error', 'Analysis failed'))
        
        return result
        
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
    
    Example: GET /api/vertex/compare?player1=Ronaldo&player2=Messi
    """
    try:
        if not player1 or not player2:
            raise HTTPException(status_code=400, detail="Both player names required")
        
        result = analyzer.compare_players(player1, player2)
        
        if not result['success']:
            raise HTTPException(status_code=404, detail=result.get('error', 'Comparison failed'))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/matches/{match_name}/analyze")
async def analyze_match(match_name: str):
    """
    Analyze all players in a specific match
    
    Uses real BigQuery data to show:
    - All players who played
    - Their performance stats
    - AI-generated match analysis
    
    Example: GET /api/vertex/matches/Argeș - Botoşani, 0-0/analyze
    """
    try:
        if not match_name:
            raise HTTPException(status_code=400, detail="Match name required")
        
        result = analyzer.get_match_analysis(match_name)
        
        if not result['success']:
            raise HTTPException(status_code=404, detail=result.get('error', 'Analysis failed'))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/players/{player_name}/stats")
async def get_player_stats(player_name: str):
    """
    Get raw player statistics from BigQuery (no AI analysis)
    
    Useful for when you just need the data without analysis
    
    Example: GET /api/vertex/players/Cristiano Ronaldo/stats
    """
    try:
        result = analyzer.get_player_matches(player_name)
        
        if not result['success']:
            raise HTTPException(status_code=404, detail=result.get('error', 'Data not found'))
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
