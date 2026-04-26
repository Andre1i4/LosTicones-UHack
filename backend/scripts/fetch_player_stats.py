"""
Script to fetch player statistics from BigQuery for comparisons and analysis
Usage: python scripts/fetch_player_stats.py [player_name] [match_name]
"""

from google.cloud import bigquery
import pandas as pd
from typing import Optional, List, Dict
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings


class PlayerStatsExtractor:
    """Extract and analyze player statistics from BigQuery"""
    
    def __init__(self):
        self.client = bigquery.Client(project=settings.GCP_PROJECT)
        self.dataset = settings.BIGQUERY_DATASET
        self.table = settings.BIGQUERY_TABLE
        self.fully_qualified_table = f"{settings.GCP_PROJECT}.{self.dataset}.{self.table}"
    
    def get_player_all_matches(self, player_name: str) -> pd.DataFrame:
        """Get a specific player's performance across ALL their matches"""
        query = f"""
        SELECT 
            shortName as player_name,
            match_name,
            position,
            foot,
            team.name as team,
            total.minutesOnField,
            total.passes,
            total.passAccuracy,
            total.goals,
            total.assists,
            total.duels,
            total.aerialDuels,
            total.dribbles,
            total.tackles,
            total.interceptions,
            total.clearances,
            total.foulsReceived,
            total.foulsCommitted,
            total.yellowCard,
            total.redCard
        FROM `{self.fully_qualified_table}`
        WHERE shortName = @player_name
            AND total.minutesOnField > 0
        ORDER BY match_name
        """
        
        try:
            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("player_name", "STRING", player_name),
                ]
            )
            df = self.client.query(query, job_config=job_config).to_dataframe()
            return df
        except Exception as e:
            print(f"❌ Error fetching player stats: {e}")
            return pd.DataFrame()
    
    def get_player_vs_player(self, player1: str, player2: str, match_name: Optional[str] = None) -> Dict:
        """Compare two players' stats (same match or career)"""
        
        if match_name:
            # Same match comparison
            query = f"""
            SELECT 
                shortName as player_name,
                position,
                total.minutesOnField,
                total.passes,
                total.passAccuracy,
                total.goals,
                total.assists,
                total.duels,
                total.aerialDuels,
                total.dribbles,
                total.tackles,
                total.interceptions
            FROM `{self.fully_qualified_table}`
            WHERE match_name = @match_name
                AND shortName IN (@player1, @player2)
                AND total.minutesOnField > 0
            """
            
            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("match_name", "STRING", match_name),
                    bigquery.ScalarQueryParameter("player1", "STRING", player1),
                    bigquery.ScalarQueryParameter("player2", "STRING", player2),
                ]
            )
        else:
            # Career stats comparison (averages)
            query = f"""
            SELECT 
                shortName as player_name,
                AVG(total.minutesOnField) as avg_minutes,
                AVG(total.passes) as avg_passes,
                AVG(total.passAccuracy) as avg_passAccuracy,
                SUM(total.goals) as total_goals,
                SUM(total.assists) as total_assists,
                AVG(total.duels) as avg_duels,
                COUNT(*) as matches_played
            FROM `{self.fully_qualified_table}`
            WHERE shortName IN (@player1, @player2)
                AND total.minutesOnField > 0
            GROUP BY shortName
            """
            
            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("player1", "STRING", player1),
                    bigquery.ScalarQueryParameter("player2", "STRING", player2),
                ]
            )
        
        try:
            df = self.client.query(query, job_config=job_config).to_dataframe()
            
            result = {
                "player1": player1,
                "player2": player2,
                "match_name": match_name,
                "data": df.to_dict('records')
            }
            return result
        except Exception as e:
            print(f"❌ Error comparing players: {e}")
            return {}
    
    def get_team_stats_for_match(self, match_name: str, team_name: Optional[str] = None) -> pd.DataFrame:
        """Get all players' stats for a specific team in a specific match"""
        
        # Note: This table has flattened structure, need to query available columns
        query = f"""
        SELECT 
            shortName as player_name,
            position,
            foot,
            match_name,
            wyId,
            shortName
        FROM `{self.fully_qualified_table}`
        WHERE match_name = @match_name
        ORDER BY position, shortName
        LIMIT 50
        """
        
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("match_name", "STRING", match_name),
            ]
        )
        
        try:
            df = self.client.query(query, job_config=job_config).to_dataframe()
            print(f"✅ Found {len(df)} players in match: {match_name}")
            return df
        except Exception as e:
            print(f"❌ Error fetching team stats: {e}")
            return pd.DataFrame()
    
    def get_player_heatmap_data(self, player_name: str, match_name: Optional[str] = None) -> pd.DataFrame:
        """Get player positioning/heatmap data for visualization"""
        
        if match_name:
            query = f"""
            SELECT 
                shortName as player_name,
                match_name,
                match_period as period,
                location.x as x,
                location.y as y,
                possession,
                type
            FROM `{self.fully_qualified_table}`
            WHERE shortName = @player_name
                AND match_name = @match_name
                AND location.x IS NOT NULL
                AND location.y IS NOT NULL
            """
            
            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("player_name", "STRING", player_name),
                    bigquery.ScalarQueryParameter("match_name", "STRING", match_name),
                ]
            )
        else:
            query = f"""
            SELECT 
                shortName as player_name,
                location.x as x,
                location.y as y,
                COUNT(*) as frequency
            FROM `{self.fully_qualified_table}`
            WHERE shortName = @player_name
                AND location.x IS NOT NULL
                AND location.y IS NOT NULL
            GROUP BY player_name, x, y
            ORDER BY frequency DESC
            """
            
            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("player_name", "STRING", player_name),
                ]
            )
        
        try:
            df = self.client.query(query, job_config=job_config).to_dataframe()
            return df
        except Exception as e:
            print(f"❌ Error fetching heatmap data: {e}")
            return pd.DataFrame()


def main():
    """CLI interface for testing"""
    extractor = PlayerStatsExtractor()
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python fetch_player_stats.py player <player_name>")
        print("  python fetch_player_stats.py compare <player1> <player2> [match_name]")
        print("  python fetch_player_stats.py team <match_name> [team_name]")
        print("  python fetch_player_stats.py heatmap <player_name> [match_name]")
        return
    
    command = sys.argv[1]
    
    if command == "player" and len(sys.argv) >= 3:
        player_name = sys.argv[2]
        print(f"\n📊 Fetching stats for {player_name}...")
        df = extractor.get_player_all_matches(player_name)
        print(df)
        print(f"\n✅ Found {len(df)} matches for {player_name}")
    
    elif command == "compare" and len(sys.argv) >= 4:
        player1 = sys.argv[2]
        player2 = sys.argv[3]
        match_name = sys.argv[4] if len(sys.argv) > 4 else None
        print(f"\n⚖️ Comparing {player1} vs {player2}...")
        result = extractor.get_player_vs_player(player1, player2, match_name)
        for record in result.get("data", []):
            print(record)
    
    elif command == "team" and len(sys.argv) >= 3:
        match_name = sys.argv[2]
        team_name = sys.argv[3] if len(sys.argv) > 3 else None
        print(f"\n👥 Fetching team stats for {match_name}...")
        df = extractor.get_team_stats_for_match(match_name, team_name)
        print(df)
    
    elif command == "heatmap" and len(sys.argv) >= 3:
        player_name = sys.argv[2]
        match_name = sys.argv[3] if len(sys.argv) > 3 else None
        print(f"\n🗺️ Fetching heatmap data for {player_name}...")
        df = extractor.get_player_heatmap_data(player_name, match_name)
        print(f"✅ Found {len(df)} position data points")
        print(df.head(20))


if __name__ == "__main__":
    main()
