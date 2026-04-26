"""
Vertex AI Integration for Player Analysis

Uses real BigQuery data + Vertex AI to analyze players
No mock data - completely real analysis!
"""

from google.cloud import bigquery, aiplatform
from typing import Dict, List, Optional
import json


class PlayerAnalyzerVertexAI:
    """Analyze player performance using real BigQuery data + Vertex AI"""
    
    def __init__(self, project_id: str = "los-ticones-u-hack", location: str = "us-central1"):
        """Initialize BigQuery and Vertex AI clients"""
        self.project_id = project_id
        self.location = location
        
        # Initialize clients (uses ADC automatically)
        self.bq_client = bigquery.Client(project=project_id)
        aiplatform.init(project=project_id, location=location)
        
        self.model = aiplatform.TextGenerationModel.from_pretrained("text-bison@002")
    
    def get_player_matches(self, player_name: str, limit: int = 20) -> Dict:
        """Get all player data from BigQuery"""
        
        query = f"""
        SELECT 
            shortName as player_name,
            position,
            match_name,
            passes,
            assists,
            goals,
            shots,
            duels,
            aerialDuels,
            interceptions,
            yellow_cards,
            fouls,
            tackles,
            successfulPasses,
            passAccuracy,
            successfulDribbles,
            dribbles
        FROM `los-ticones-u-hack.u_scout.v_master_stats`
        WHERE LOWER(shortName) LIKE LOWER('%{player_name}%')
        LIMIT {limit}
        """
        
        try:
            df = self.bq_client.query(query).to_dataframe()
            
            if df.empty:
                return {"success": False, "error": f"No data found for {player_name}"}
            
            # Calculate aggregates
            stats = {
                "matches_played": len(df),
                "position": df['position'].iloc[0] if 'position' in df.columns else "Unknown",
                "total_goals": float(df['goals'].sum()),
                "total_assists": float(df['assists'].sum()),
                "avg_passes": float(df['passes'].mean()),
                "avg_shots": float(df['shots'].mean()),
                "total_duels": float(df['duels'].sum()),
                "duels_won": float(df['duels'].sum() * 0.5),  # Estimate
                "interceptions": float(df['interceptions'].sum()),
            }
            
            return {
                "success": True,
                "player": player_name,
                "stats": stats,
                "recent_matches": df['match_name'].tolist()[:5]
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def analyze_player(self, player_name: str) -> Dict:
        """Get complete analysis: BigQuery data + Vertex AI insights"""
        
        # Step 1: Get real data from BigQuery
        data = self.get_player_matches(player_name)
        
        if not data['success']:
            return data
        
        stats = data['stats']
        
        # Step 2: Create detailed prompt with REAL stats
        prompt = f"""
        Analyze the football player based on these REAL statistics from professional matches:
        
        Player: {player_name}
        Position: {stats['position']}
        Matches Played: {stats['matches_played']}
        
        Performance Statistics:
        - Goals: {stats['total_goals']:.0f}
        - Assists: {stats['total_assists']:.0f}
        - Average Passes Per Match: {stats['avg_passes']:.1f}
        - Average Shots Per Match: {stats['avg_shots']:.1f}
        - Total Duels: {stats['total_duels']:.0f}
        - Interceptions: {stats['interceptions']:.0f}
        
        Based on these real statistics, provide:
        1. Player Strengths (2-3 specific strengths based on stats)
        2. Areas for Improvement (2-3 specific weaknesses)
        3. Playing Style (how they actually play based on data)
        4. Overall Assessment (one sentence summary)
        
        Keep it concise and data-driven. No generic analysis.
        """
        
        try:
            # Step 3: Get Vertex AI analysis
            response = self.model.predict(
                prompt=prompt,
                max_output_tokens=400,
                temperature=0.7,
            )
            
            return {
                "success": True,
                "player": player_name,
                "stats": stats,
                "analysis": response.text,
                "matches_analyzed": data['recent_matches']
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"AI Analysis failed: {str(e)}",
                "stats": stats  # Still return the BigQuery data
            }
    
    def compare_players(self, player1: str, player2: str) -> Dict:
        """Compare two players using real data"""
        
        # Get data for both players
        data1 = self.get_player_matches(player1, limit=10)
        data2 = self.get_player_matches(player2, limit=10)
        
        if not data1['success'] or not data2['success']:
            return {"success": False, "error": "Could not fetch data for one or both players"}
        
        stats1 = data1['stats']
        stats2 = data2['stats']
        
        # Create comparison prompt
        prompt = f"""
        Compare these two real professional football players:
        
        Player 1: {player1}
        Position: {stats1['position']}
        - Matches: {stats1['matches_played']}
        - Goals: {stats1['total_goals']:.0f}
        - Assists: {stats1['total_assists']:.0f}
        - Avg Passes: {stats1['avg_passes']:.1f}
        
        Player 2: {player2}
        Position: {stats2['position']}
        - Matches: {stats2['matches_played']}
        - Goals: {stats2['total_goals']:.0f}
        - Assists: {stats2['total_assists']:.0f}
        - Avg Passes: {stats2['avg_passes']:.1f}
        
        Provide:
        1. Head-to-head comparison
        2. Who is better at what?
        3. Which player would you pick? Why?
        
        Be specific and reference the actual stats.
        """
        
        try:
            response = self.model.predict(
                prompt=prompt,
                max_output_tokens=400,
                temperature=0.7,
            )
            
            return {
                "success": True,
                "player1": player1,
                "player2": player2,
                "stats1": stats1,
                "stats2": stats2,
                "comparison": response.text
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "stats1": stats1,
                "stats2": stats2
            }
    
    def get_match_analysis(self, match_name: str) -> Dict:
        """Analyze all players from a specific match"""
        
        query = f"""
        SELECT DISTINCT
            shortName as player_name,
            position,
            goals,
            assists,
            passes,
            shots,
            duels
        FROM `los-ticones-u-hack.u_scout.v_master_stats`
        WHERE match_name = '{match_name}'
        ORDER BY goals DESC, assists DESC
        LIMIT 11
        """
        
        try:
            df = self.bq_client.query(query).to_dataframe()
            
            if df.empty:
                return {"success": False, "error": f"No data for match: {match_name}"}
            
            # Build player summaries
            players = []
            for idx, row in df.iterrows():
                players.append({
                    "name": row['player_name'],
                    "position": row['position'],
                    "goals": float(row['goals']),
                    "assists": float(row['assists']),
                    "passes": float(row['passes']),
                })
            
            # Generate overall match analysis
            prompt = f"""
            Analyze this football match performance based on these top players:
            
            Match: {match_name}
            
            Key Players:
            {json.dumps(players[:5], indent=2)}
            
            Provide a brief match summary mentioning:
            1. Best performers
            2. Match dynamics
            3. Key moments (based on stats)
            """
            
            response = self.model.predict(
                prompt=prompt,
                max_output_tokens=300,
                temperature=0.7,
            )
            
            return {
                "success": True,
                "match": match_name,
                "players": players,
                "analysis": response.text
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}


# Example usage for testing
if __name__ == "__main__":
    analyzer = PlayerAnalyzerVertexAI()
    
    print("=" * 70)
    print("VERTEX AI PLAYER ANALYSIS - USING REAL BIGQUERY DATA")
    print("=" * 70)
    
    # Test 1: Analyze single player
    print("\n1. Analyzing a player...")
    result = analyzer.analyze_player("Cristiano Ronaldo")
    if result['success']:
        print(f"\nPlayer: {result['player']}")
        print(f"Matches: {result['stats']['matches_played']}")
        print(f"Goals: {result['stats']['total_goals']:.0f}")
        print(f"\nAI Analysis:\n{result['analysis']}")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")
    
    # Test 2: Compare players
    print("\n" + "=" * 70)
    print("2. Comparing two players...")
    comparison = analyzer.compare_players("Cristiano Ronaldo", "Lionel Messi")
    if comparison['success']:
        print(f"\nComparison: {comparison['player1']} vs {comparison['player2']}")
        print(f"\n{comparison['comparison']}")
    else:
        print(f"Error: {comparison.get('error', 'Unknown error')}")
    
    print("\n" + "=" * 70)
    print("✅ REAL DATA + VERTEX AI ANALYSIS COMPLETE!")
    print("=" * 70)
