"""BigQuery service for querying U-Scout data"""
from google.cloud import bigquery
import pandas as pd
from typing import List, Dict, Any, Optional
from config import settings
from models.player import OpponentPlayer, UClujPlayer, PlayerStats
from models.match import Match, MatchSummary

class BigQueryService:
    def __init__(self):
        # Uses local ADC (Application Default Credentials)
        self.client = bigquery.Client(project=settings.GCP_PROJECT)
        self.dataset = settings.BIGQUERY_DATASET
        self.table = settings.BIGQUERY_TABLE
        self.fully_qualified_table = f"{settings.GCP_PROJECT}.{self.dataset}.{self.table}"
    
    def get_all_matches(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch distinct match names/opponents from BigQuery"""
        query = f"""
        SELECT DISTINCT match_name as name
        FROM `{self.fully_qualified_table}`
        WHERE match_name IS NOT NULL
        ORDER BY match_name
        LIMIT {limit}
        """
        try:
            df = self.client.query(query).to_dataframe()
            return df.to_dict('records') if not df.empty else []
        except Exception as e:
            print(f"Error fetching matches: {e}")
            return []
    
    def get_match_players(self, match_name: str) -> List[Dict[str, Any]]:
        """Get all players from a specific match, grouped by team"""
        query = f"""
        SELECT 
            shortName as name,
            position,
            foot,
            CAST(total.minutesOnField as INT64) as minutesOnField,
            CAST(total.passes as INT64) as passes,
            CAST(total.duels as INT64) as duels,
            CAST(total.aerialDuels as INT64) as aerialDuels,
            CAST(total.passAccuracy as FLOAT64) as passAcc,
            CAST(team.name as STRING) as team
        FROM `{self.fully_qualified_table}`
        WHERE match_name = @match_name 
            AND total.minutesOnField > 0
        ORDER BY position, shortName
        """
        try:
            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("match_name", "STRING", match_name),
                ]
            )
            df = self.client.query(query, job_config=job_config).to_dataframe()
            return df.to_dict('records') if not df.empty else []
        except Exception as e:
            print(f"Error fetching match players: {e}")
            return []
    
    def get_next_match(self) -> Optional[Match]:
        """Get next upcoming match (currently returns latest match from data)"""
        try:
            matches = self.get_all_matches(limit=1)
            if matches:
                match_name = matches[0]['name']
                players_data = self.get_match_players(match_name)
                
                # Convert to OpponentPlayer objects
                opponent_players = []
                for idx, p in enumerate(players_data[:11]):  # Limit to squad size
                    player = OpponentPlayer(
                        id=f"opp-{idx}",
                        name=p.get('name', f'Player {idx}'),
                        number=idx + 1,
                        position=p.get('position', 'Unknown'),
                        positionShort=p.get('position', 'U')[:2],
                        age=25,
                        foot=p.get('foot', 'Right'),
                        x=260 + (idx % 3) * 80,
                        y=400 + (idx // 3) * 100,
                        stats=PlayerStats(
                            goals=0,
                            assists=0,
                            xg=0.0,
                            passAcc=float(p.get('passAcc', 75)),
                            duelsWon=int(p.get('duels', 0)),
                            aerialDuels=int(p.get('aerialDuels', 0)),
                            distanceCovered=10.5,
                            minutesOnField=int(p.get('minutesOnField', 90))
                        ),
                        strengths=[],
                        playingStyleNotes=[]
                    )
                    opponent_players.append(player)
                
                return Match(
                    id='next-match',
                    name=match_name,
                    country='Romania',
                    formation='4-3-3',
                    form=['W', 'D', 'W', 'L', 'W'],
                    avgPossession=52,
                    avgGoalsScored=1.8,
                    avgGoalsConceded=1.2,
                    avgShotsOnTarget=4.6,
                    pressingIntensity=67,
                    setPieceThreat='High',
                    coachNote='Analyze this opponent carefully.',
                    dateAnalyzed='Apr 26, 2026',
                    competition='SuperLiga România',
                    matchDate='Mon, 28 Apr 2026 · 20:00',
                    players=opponent_players
                )
        except Exception as e:
            print(f"Error fetching next match: {e}")
            return None
    
    def get_recent_analyses(self, limit: int = 6) -> List[MatchSummary]:
        """Get recent match analyses"""
        try:
            matches = self.get_all_matches(limit=limit)
            result = []
            for idx, match in enumerate(matches):
                result.append(MatchSummary(
                    id=f"analysis-{idx}",
                    opponentName=match['name'],
                    country='Romania',
                    formation='4-3-3',
                    dateAnalyzed='Apr 26, 2026',
                    form=['W', 'D', 'W']
                ))
            return result
        except Exception as e:
            print(f"Error fetching recent analyses: {e}")
            return []
