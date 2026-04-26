"""Player stats API routes - serves real BigQuery data"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from ..scripts.fetch_player_stats import PlayerStatsExtractor
from ..scripts.analyze_player_ai import PlayerAnalyzer

router = APIRouter()
extractor = PlayerStatsExtractor()
analyzer = PlayerAnalyzer()


@router.get("/players/stats/{player_name}")
async def get_player_stats(
    player_name: str,
    match_name: Optional[str] = Query(None)
):
    """
    Get player statistics
    
    Args:
        player_name: Name of the player (e.g., "Cristiano Ronaldo")
        match_name: (Optional) Specific match name for single-match stats
    
    Returns:
        Player stats as JSON
    """
    try:
        if match_name:
            df = extractor.get_team_stats_for_match(match_name)
            player_data = df[df['player_name'] == player_name]
            
            if player_data.empty:
                raise HTTPException(
                    status_code=404,
                    detail=f"Player {player_name} not found in match {match_name}"
                )
            
            return {
                "player_name": player_name,
                "match_name": match_name,
                "stats": player_data.to_dict('records')[0]
            }
        else:
            df = extractor.get_player_all_matches(player_name)
            
            if df.empty:
                raise HTTPException(
                    status_code=404,
                    detail=f"Player {player_name} not found"
                )
            
            # Return career stats
            career_summary = {
                "matches_played": len(df),
                "total_goals": float(df['total.goals'].sum()),
                "total_assists": float(df['total.assists'].sum()),
                "avg_passes": float(df['total.passes'].mean()),
                "avg_pass_accuracy": float(df['total.passAccuracy'].mean()),
                "avg_duels": float(df['total.duels'].mean()),
                "positions": df['position'].unique().tolist()
            }
            
            return {
                "player_name": player_name,
                "career_stats": career_summary,
                "recent_matches": df.tail(10).to_dict('records')
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/players/compare")
async def compare_players(
    player1: str = Query(...),
    player2: str = Query(...),
    match_name: Optional[str] = Query(None)
):
    """
    Compare two players' statistics
    
    Args:
        player1: First player name
        player2: Second player name
        match_name: (Optional) Specific match for comparison
    
    Returns:
        Comparison data
    """
    try:
        result = extractor.get_player_vs_player(player1, player2, match_name)
        
        if not result.get('data'):
            raise HTTPException(
                status_code=404,
                detail="No data found for comparison"
            )
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/players/analyze/{player_name}")
async def analyze_player(
    player_name: str,
    match_name: Optional[str] = Query(None)
):
    """
    Get AI-ready analysis of a player
    
    Args:
        player_name: Player name to analyze
        match_name: (Optional) Specific match to analyze
    
    Returns:
        Raw data + AI prompt ready to send to LLM
    """
    try:
        insights = analyzer.get_player_insights_for_api(player_name, match_name)
        
        if "error" in insights:
            raise HTTPException(status_code=404, detail=insights['error'])
        
        return insights
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/teams/stats/{match_name}")
async def get_team_stats(
    match_name: str,
    team_name: Optional[str] = Query(None)
):
    """
    Get all players' stats for a match or specific team
    
    Args:
        match_name: Name of the match
        team_name: (Optional) Specific team name
    
    Returns:
        All players' stats for the match/team
    """
    try:
        df = extractor.get_team_stats_for_match(match_name, team_name)
        
        if df.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No data found for {match_name}" + 
                       (f" - {team_name}" if team_name else "")
            )
        
        return {
            "match_name": match_name,
            "team_name": team_name,
            "players": df.to_dict('records')
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/heatmap/{player_name}")
async def get_heatmap_data(
    player_name: str,
    match_name: Optional[str] = Query(None)
):
    """
    Get player positioning/heatmap data for visualization
    
    Args:
        player_name: Player name
        match_name: (Optional) Specific match
    
    Returns:
        Heatmap data with x,y coordinates
    """
    try:
        df = extractor.get_player_heatmap_data(player_name, match_name)
        
        if df.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No position data for {player_name}"
            )
        
        return {
            "player_name": player_name,
            "match_name": match_name,
            "heatmap_points": df.to_dict('records')
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/unique-players")
async def get_unique_players(limit: int = Query(100)):
    """
    Get list of unique players in the dataset
    
    Returns:
        List of all players available
    """
    try:
        query = f"""
        SELECT DISTINCT shortName as name, position
        FROM `{extractor.fully_qualified_table}`
        ORDER BY shortName
        LIMIT {limit}
        """
        df = extractor.client.query(query).to_dataframe()
        return {
            "total_unique_players": len(df),
            "players": df.to_dict('records')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
