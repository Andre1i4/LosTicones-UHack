"""
Simple working analysis using BigQuery + Vertex AI REST API
No complex dependencies - just requests!
"""

from google.cloud import bigquery
import requests
import google.auth
from google.auth.transport.requests import Request
import json

class SimplePlayerAnalyzer:
    def __init__(self, project_id: str = "los-ticones-u-hack"):
        self.project_id = project_id
        self.bq_client = bigquery.Client(project=project_id)
    
    def get_player_stats(self, player_name: str):
        """Get real player data from BigQuery"""
        
        query = f"""
        SELECT 
            shortName,
            position,
            match_name,
            passes,
            assists,
            goals,
            shots,
            duels,
            interceptions
        FROM `{self.project_id}.u_scout.v_master_stats`
        WHERE LOWER(shortName) LIKE LOWER('%{player_name}%')
        LIMIT 20
        """
        
        df = self.bq_client.query(query).to_dataframe()
        
        if df.empty:
            return None
        
        # Calculate stats
        return {
            "player": player_name,
            "position": df['position'].iloc[0],
            "matches": len(df),
            "goals": float(df['goals'].sum()),
            "assists": float(df['assists'].sum()),
            "passes": float(df['passes'].mean()),
            "shots": float(df['shots'].sum()),
            "duels": float(df['duels'].sum()),
            "interceptions": float(df['interceptions'].sum()),
        }
    
    def call_vertex_ai(self, prompt: str) -> str:
        """Call Vertex AI Text Generation API via REST"""
        
        # Get credentials
        credentials, project = google.auth.default()
        credentials.refresh(Request())
        
        # API endpoint
        url = f"https://us-central1-aiplatform.googleapis.com/v1/projects/{project}/locations/us-central1/publishers/google/models/text-bison:predict"
        
        headers = {
            "Authorization": f"Bearer {credentials.token}",
            "Content-Type": "application/json"
        }
        
        data = {
            "instances": [
                {
                    "prompt": prompt
                }
            ],
            "parameters": {
                "temperature": 0.7,
                "maxOutputTokens": 300
            }
        }
        
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        return result['predictions'][0]['content']
    
    def analyze_player(self, player_name: str) -> dict:
        """Complete analysis: BigQuery + Vertex AI"""
        
        # Get real data
        stats = self.get_player_stats(player_name)
        
        if not stats:
            return {
                "success": False,
                "error": f"No data found for {player_name}"
            }
        
        # Create detailed prompt with REAL statistics
        prompt = f"""
        Analyze this professional footballer based on real match statistics:
        
        Player: {stats['player']}
        Position: {stats['position']}
        Matches analyzed: {stats['matches']}
        
        Performance Data:
        - Goals scored: {stats['goals']:.0f}
        - Assists provided: {stats['assists']:.0f}
        - Average passes per match: {stats['passes']:.1f}
        - Total shots: {stats['shots']:.0f}
        - Total duels: {stats['duels']:.0f}
        - Interceptions: {stats['interceptions']:.0f}
        
        Provide a 3-sentence professional analysis of this player's performance and style.
        Focus on the actual numbers, not generic statements.
        """
        
        try:
            analysis = self.call_vertex_ai(prompt)
            
            return {
                "success": True,
                "player": player_name,
                "stats": stats,
                "analysis": analysis
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "stats": stats  # Still return stats even if AI fails
            }
    
    def compare_players(self, player1: str, player2: str) -> dict:
        """Compare two players"""
        
        stats1 = self.get_player_stats(player1)
        stats2 = self.get_player_stats(player2)
        
        if not stats1 or not stats2:
            return {
                "success": False,
                "error": "Could not find data for one or both players"
            }
        
        prompt = f"""
        Compare these two real professional footballers:
        
        {stats1['player']} ({stats1['position']})
        - Matches: {stats1['matches']}, Goals: {stats1['goals']:.0f}, Assists: {stats1['assists']:.0f}
        
        vs
        
        {stats2['player']} ({stats2['position']})
        - Matches: {stats2['matches']}, Goals: {stats2['goals']:.0f}, Assists: {stats2['assists']:.0f}
        
        Based on these real statistics, who is more valuable and why? 2-3 sentences.
        """
        
        try:
            analysis = self.call_vertex_ai(prompt)
            
            return {
                "success": True,
                "player1": player1,
                "player2": player2,
                "stats1": stats1,
                "stats2": stats2,
                "comparison": analysis
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "stats1": stats1,
                "stats2": stats2
            }


# Example usage
if __name__ == "__main__":
    analyzer = SimplePlayerAnalyzer()
    
    print("=" * 70)
    print("SIMPLE PLAYER ANALYSIS - BIGQUERY + VERTEX AI")
    print("=" * 70)
    
    # Test 1: Analyze single player
    print("\n✨ Analyzing a player...")
    result = analyzer.analyze_player("Cristiano Ronaldo")
    
    if result['success']:
        print(f"\n✅ {result['player']}")
        print(f"   Position: {result['stats']['position']}")
        print(f"   Matches: {result['stats']['matches']}")
        print(f"   Goals: {result['stats']['goals']:.0f}")
        print(f"   Assists: {result['stats']['assists']:.0f}")
        print(f"\n📊 Analysis:\n{result['analysis']}")
    else:
        print(f"❌ Error: {result['error']}")
    
    # Test 2: Compare players
    print("\n" + "=" * 70)
    print("Comparing two players...")
    comparison = analyzer.compare_players("Cristiano Ronaldo", "Lionel Messi")
    
    if comparison['success']:
        print(f"\n✅ {comparison['player1']} vs {comparison['player2']}")
        print(f"\n📊 Comparison:\n{comparison['comparison']}")
    else:
        print(f"❌ Error: {comparison['error']}")
    
    print("\n" + "=" * 70)
    print("✅ COMPLETE!")
    print("=" * 70)
