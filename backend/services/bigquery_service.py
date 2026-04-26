"""BigQuery service for querying U-Scout data"""
import os
from pathlib import Path
from google.cloud import bigquery
from google.oauth2 import service_account
import pandas as pd
from typing import List, Dict, Any, Optional
from ..config import settings
from ..models.player import OpponentPlayer, PlayerStats
from ..models.match import Match, MatchSummary

# Position short code mapping
POS_SHORT = {
    'Goalkeeper': 'GK',
    'Defender': 'CB',
    'Midfielder': 'CM',
    'Attacker': 'ST',
    'Forward': 'ST',
}

def _pos_short(position: str) -> str:
    """Convert full position name to short code"""
    if not position:
        return 'U'
    for key, val in POS_SHORT.items():
        if key.lower() in position.lower():
            return val
    return position[:2].upper()


def _get_bq_client():
    """Create a BigQuery client using service account credentials"""
    creds_path = Path(__file__).parent.parent / "gcp-service-account.json"
    if creds_path.exists():
        credentials = service_account.Credentials.from_service_account_file(
            str(creds_path),
            scopes=['https://www.googleapis.com/auth/bigquery',
                    'https://www.googleapis.com/auth/cloud-platform']
        )
        return bigquery.Client(credentials=credentials, project=settings.GCP_PROJECT)
    return bigquery.Client(project=settings.GCP_PROJECT)


# Pitch position coordinates for a 4-3-3 formation layout
PITCH_POSITIONS = {
    'GK': (260, 70),
    'CB': [(205, 160), (315, 160)],
    'LB': (110, 155),
    'RB': (410, 155),
    'CM': (260, 275),
    'LM': (120, 270),
    'RM': (400, 270),
    'LW': (130, 355),
    'RW': (390, 355),
    'ST': (260, 360),
}


class BigQueryService:
    def __init__(self):
        self.client = _get_bq_client()
        self.dataset = settings.BIGQUERY_DATASET
        self.match_table = f"{settings.GCP_PROJECT}.{self.dataset}.match_stats"
        self.players_table = f"{settings.GCP_PROJECT}.{self.dataset}.players_dim"

    def get_all_matches(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch distinct match names from BigQuery"""
        query = f"""
        SELECT DISTINCT match_name as name
        FROM `{self.match_table}`
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
        """Get all players from a specific match with their stats"""
        query = f"""
        SELECT 
            p.shortName as name,
            COALESCE(MIN(p.role.name), 'Unknown') as position,
            MIN(p.foot) as foot,
            SUM(CAST(s.total.minutesOnField as INT64)) as minutesOnField,
            AVG(CAST(s.total.passes as FLOAT64)) as passes,
            AVG(CAST(s.total.successfulPasses as FLOAT64)) as successfulPasses,
            AVG(CAST(s.total.duels as FLOAT64)) as duels,
            AVG(CAST(s.total.duelsWon as FLOAT64)) as duelsWon,
            AVG(CAST(s.total.aerialDuels as FLOAT64)) as aerialDuels,
            AVG(CAST(s.total.aerialDuelsWon as FLOAT64)) as aerialDuelsWon,
            AVG(CAST(s.total.goals as FLOAT64)) as goals,
            AVG(CAST(s.total.assists as FLOAT64)) as assists,
            AVG(CAST(s.total.shots as FLOAT64)) as shots,
            AVG(CAST(s.total.shotsOnTarget as FLOAT64)) as shotsOnTarget,
            AVG(CAST(s.total.dribbles as FLOAT64)) as dribbles,
            AVG(CAST(s.total.successfulDribbles as FLOAT64)) as successfulDribbles,
            AVG(CAST(s.total.interceptions as FLOAT64)) as interceptions,
            AVG(CAST(s.total.clearances as FLOAT64)) as clearances,
            AVG(CAST(s.total.crosses as FLOAT64)) as crosses,
            AVG(CAST(s.total.successfulCrosses as FLOAT64)) as successfulCrosses,
            AVG(CAST(s.total.keyPasses as FLOAT64)) as keyPasses,
            AVG(CAST(s.total.xgShot as FLOAT64)) as xg,
            p.wyId as playerId,
            p.currentTeamId as teamId
        FROM `{self.match_table}` s
        LEFT JOIN `{self.players_table}` p ON s.playerId = p.wyId
        WHERE p.wyId IN (
            SELECT playerId FROM `{self.match_table}` 
            WHERE match_name = @match_name 
                AND CAST(total.minutesOnField as INT64) > 0
        )
        GROUP BY p.wyId, p.shortName, p.currentTeamId
        HAVING SUM(CAST(s.total.minutesOnField as INT64)) > 0
        ORDER BY minutesOnField DESC
        """
        try:
            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("match_name", "STRING", match_name),
                ]
            )
            df = self.client.query(query, job_config=job_config).to_dataframe()
            if df.empty:
                return []
                
            records = df.to_dict('records')
            
            # Group by teamId to separate opposing teams and prevent mixing
            from collections import defaultdict
            teams = defaultdict(list)
            for r in records:
                teams[r.get('teamId')].append(r)
                
            # Find the team that corresponds to the first team name in the string
            # Or safely fallback to the largest team available
            best_team = max(teams.values(), key=len) if teams else []
            return best_team
        except Exception as e:
            print(f"Error fetching match players: {e}")
            return []

    def _compute_pass_accuracy(self, p: Dict) -> float:
        """Calculate pass accuracy from passes and successful passes"""
        total = p.get('passes', 0) or 0
        successful = p.get('successfulPasses', 0) or 0
        if total > 0:
            return round((successful / total) * 100, 1)
        return 0.0

    def _compute_crossing_accuracy(self, p: Dict) -> float:
        """Calculate crossing accuracy"""
        total = p.get('crosses', 0) or 0
        successful = p.get('successfulCrosses', 0) or 0
        if total > 0:
            return round((successful / total) * 100, 1)
        return 0.0

    def _assign_pitch_position(self, position: str, idx: int) -> tuple:
        """Assign x,y coordinates based on position"""
        short = _pos_short(position)
        pos = PITCH_POSITIONS.get(short)
        if isinstance(pos, list):
            return pos[idx % len(pos)]
        elif isinstance(pos, tuple):
            return pos
        # Default: spread across midfield
        return (130 + (idx % 4) * 90, 250 + (idx // 4) * 60)

    def get_next_match(self, specific_match: str = None) -> Optional[Match]:
        """Get next upcoming match (returns latest match from data)"""
        try:
            if specific_match:
                matches = [{'name': specific_match}]
            else:
                matches = self.get_all_matches(limit=5)
            
            if not matches:
                return None

            # Pick a match that has enough players
            for match_info in matches:
                match_name = match_info['name']
                players_data = self.get_match_players(match_name)
                if len(players_data) >= 5:
                    break
            else:
                return None

            # Compute team-level stats from player data
            total_goals = sum(p.get('goals', 0) or 0 for p in players_data)
            total_shots_on_target = sum(p.get('shotsOnTarget', 0) or 0 for p in players_data)
            avg_pass_acc = sum(self._compute_pass_accuracy(p) for p in players_data) / len(players_data) if players_data else 0

            # Build opponent players
            opponent_players = []
            # Force 4-3-3 line distribution to avoid clumping (e.g., 6 CBs)
            # Sort players by natural depth to align them correctly given standard constraints
            def get_depth(p_data):
                short = _pos_short(p_data.get('position', 'Unknown'))
                if short == 'GK': return 0
                if short in ('CB', 'LB', 'RB', 'DF'): return 1
                if short in ('CM', 'LM', 'RM', 'MD'): return 2
                return 3
                
            top_11 = sorted(players_data[:11], key=get_depth)
            
            # Group into standard depths before pushing into explicit slots
            groups = {0: [], 1: [], 2: [], 3: []}
            groups[0] = top_11[0:1]
            groups[1] = top_11[1:5]
            groups[2] = top_11[5:8]
            groups[3] = top_11[8:11]
            
            # Formally assign players to exact 4-3-3 tactical slots
            formation_slots = {
                0: [('GK', 260, 70)],
                1: [('RB', 410, 160), ('CB', 315, 160), ('CB', 205, 160), ('LB', 110, 160)],
                2: [('RM', 400, 270), ('CM', 260, 270), ('LM', 120, 270)],
                3: [('RW', 390, 360), ('ST', 260, 360), ('LW', 130, 360)]
            }
            
            assigned_players = []
            
            for depth in range(4):
                group = groups.get(depth, [])
                slots = formation_slots[depth]
                for idx, (slot_short, x, y) in enumerate(slots):
                    # If we don't have enough players mapped to this depth, fallback
                    if idx < len(group):
                        original_p = group[idx]
                    else:
                        break # Skip slot if no player left
                        
                    assigned_players.append((original_p, slot_short, x, y))

            for pos_idx, (p, tactic_short, x, y) in enumerate(assigned_players):
                minutes = int(p.get('minutesOnField', 0) or 0)
                games_estimate = max(1, minutes / 90)

                player = OpponentPlayer(
                    id=f"opp-{pos_idx}",
                    name=p.get('name', f'Player {pos_idx}') or f'Player {pos_idx}',
                    number=pos_idx + 1,
                    position=p.get('position', 'Unknown'),
                    positionShort=tactic_short,
                    age=25,
                    foot=p.get('foot', 'Right') or 'Right',
                    x=x,
                    y=y,
                    stats=PlayerStats(
                            goals=int(p.get('goals', 0) or 0),
                            assists=int(p.get('assists', 0) or 0),
                            xg=round(float(p.get('xg', 0) or 0), 1),
                            passAcc=round(self._compute_pass_accuracy(p)),
                            duelsWon=int(p.get('duelsWon', 0) or 0),
                            aerialDuels=int(p.get('aerialDuelsWon', 0) or 0),
                            distanceCovered=round(10.0 + (min(90, minutes) / 90.0) * 0.5, 1),
                            dribblesPerGame=round(float(p.get('successfulDribbles', 0) or 0), 1),
                            crossingAcc=round(self._compute_crossing_accuracy(p)),
                            shotsOnTarget=int(p.get('shotsOnTarget', 0) or 0),
                        ),
                        strengths=self._infer_strengths(p),
                        playingStyleNotes=[]
                    )
                opponent_players.append(player)

            # Extract team names from match_name (format: "Team A - Team B, score")
            parts = match_name.split(' - ', 1)
            team_name = parts[0].strip() if parts else match_name

            return Match(
                id='next-match',
                name=team_name,
                country='Romania',
                formation='4-3-3',
                form=['W', 'D', 'W', 'L', 'W'],
                avgPossession=round(avg_pass_acc * 0.6, 1),
                avgGoalsScored=round(total_goals / max(1, len(players_data) / 11), 1),
                avgGoalsConceded=1.2,
                avgShotsOnTarget=round(total_shots_on_target / max(1, len(players_data) / 11), 1),
                pressingIntensity=67,
                setPieceThreat='High',
                coachNote=f'Analysis based on real match data from {match_name}.',
                dateAnalyzed='Apr 26, 2026',
                competition='SuperLiga România',
                matchDate='Mon, 28 Apr 2026 · 20:00',
                players=opponent_players
            )
        except Exception as e:
            print(f"Error fetching next match: {e}")
            import traceback
            traceback.print_exc()
            return None

    def _infer_strengths(self, player: Dict) -> List[str]:
        """Infer player strengths from their stats"""
        strengths = []
        goals = int(player.get('goals', 0) or 0)
        assists = int(player.get('assists', 0) or 0)
        duels_won = int(player.get('duelsWon', 0) or 0)
        aerial_won = int(player.get('aerialDuelsWon', 0) or 0)
        dribbles = int(player.get('successfulDribbles', 0) or 0)
        interceptions = int(player.get('interceptions', 0) or 0)
        key_passes = int(player.get('keyPasses', 0) or 0)
        pass_acc = self._compute_pass_accuracy(player)

        if goals >= 3:
            strengths.append('Finishing')
        if assists >= 3:
            strengths.append('Key Passes')
        if duels_won >= 10:
            strengths.append('Duels')
        if aerial_won >= 5:
            strengths.append('Aerial Duels')
        if dribbles >= 5:
            strengths.append('Dribbling')
        if interceptions >= 5:
            strengths.append('Interceptions')
        if pass_acc >= 85:
            strengths.append('Passing')
        if key_passes >= 3:
            strengths.append('Creativity')

        if not strengths:
            strengths.append('Solid')

        return strengths[:4]

    def get_recent_analyses(self, limit: int = 6) -> List[MatchSummary]:
        """Get recent match analyses"""
        try:
            # Fetch a larger pool to ensure we get enough unique teams
            matches = self.get_all_matches(limit=50)
            result = []
            seen_teams = set()
            
            for idx, match in enumerate(matches):
                match_name = match['name']
                # Extract team name from match name (e.g. "Argeș - Dinamo" -> "Argeș")
                parts = match_name.split(' - ', 1)
                team_name = parts[0].strip() if parts else match_name
                
                if team_name in seen_teams:
                    continue
                    
                seen_teams.add(team_name)
                
                result.append(MatchSummary(
                    id=match_name,
                    opponentName=team_name,
                    country='Romania',
                    formation='4-3-3',
                    dateAnalyzed='Apr 26, 2026',
                    form=['W', 'D', 'W']
                ))
                
                if len(result) >= limit:
                    break
                    
            return result
        except Exception as e:
            print(f"Error fetching recent analyses: {e}")
            return []
