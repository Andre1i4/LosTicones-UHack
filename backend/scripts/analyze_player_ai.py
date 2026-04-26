"""
AI Analysis script - Analyze player stats and generate insights
This script fetches player data and can send it to an LLM for analysis

Usage: python scripts/analyze_player_ai.py <player_name> [match_name]
"""

import sys
import os
import json
from typing import Optional
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.fetch_player_stats import PlayerStatsExtractor


class PlayerAnalyzer:
    """Analyze player statistics and generate insights"""
    
    def __init__(self):
        self.extractor = PlayerStatsExtractor()
    
    def prepare_player_summary(self, player_name: str, match_name: Optional[str] = None) -> dict:
        """
        Fetch player data and prepare it for AI analysis
        Returns a structured dict ready to send to Claude/GPT
        """
        
        if match_name:
            # Single match analysis
            team_data = self.extractor.get_team_stats_for_match(match_name)
            player_data = team_data[team_data['player_name'] == player_name]
            
            if player_data.empty:
                return {"error": f"Player {player_name} not found in match {match_name}"}
            
            player_row = player_data.iloc[0]
            
            summary = {
                "player_name": player_name,
                "match_name": match_name,
                "analysis_type": "match_performance",
                "position": player_row.get('position'),
                "minutes_played": player_row.get('total.minutesOnField'),
                "stats": {
                    "passes": player_row.get('total.passes'),
                    "pass_accuracy": player_row.get('total.passAccuracy'),
                    "goals": player_row.get('total.goals'),
                    "assists": player_row.get('total.assists'),
                    "duels": player_row.get('total.duels'),
                    "aerial_duels": player_row.get('total.aerialDuels'),
                    "tackles": player_row.get('total.tackles'),
                    "interceptions": player_row.get('total.interceptions')
                }
            }
        else:
            # Career/season analysis
            all_matches = self.extractor.get_player_all_matches(player_name)
            
            if all_matches.empty:
                return {"error": f"No data found for player {player_name}"}
            
            summary = {
                "player_name": player_name,
                "analysis_type": "career_performance",
                "matches_played": len(all_matches),
                "positions_played": all_matches['position'].unique().tolist(),
                "career_stats": {
                    "total_goals": all_matches['total.goals'].sum(),
                    "total_assists": all_matches['total.assists'].sum(),
                    "avg_pass_accuracy": all_matches['total.passAccuracy'].mean(),
                    "avg_passes_per_match": all_matches['total.passes'].mean(),
                    "avg_duels_per_match": all_matches['total.duels'].mean(),
                    "total_minutes": all_matches['total.minutesOnField'].sum()
                },
                "recent_form": all_matches.tail(5).to_dict('records')
            }
        
        return summary
    
    def format_for_ai(self, summary: dict) -> str:
        """
        Format the player summary as a prompt for AI analysis
        """
        
        if "error" in summary:
            return f"Error: {summary['error']}"
        
        prompt = f"""
Analyze the following player statistics and provide actionable insights:

Player: {summary['player_name']}
Analysis Type: {summary['analysis_type']}

"""
        
        if summary['analysis_type'] == 'match_performance':
            prompt += f"""Match: {summary['match_name']}
Position: {summary['position']}
Minutes Played: {summary['minutes_played']}

Match Statistics:
- Passes: {summary['stats']['passes']} (Accuracy: {summary['stats']['pass_accuracy']:.1f}%)
- Goals: {summary['stats']['goals']}
- Assists: {summary['stats']['assists']}
- Duels Won: {summary['stats']['duels']}
- Aerial Duels: {summary['stats']['aerial_duels']}
- Tackles: {summary['stats']['tackles']}
- Interceptions: {summary['stats']['interceptions']}

Based on these stats, provide:
1. Overall performance rating (1-10)
2. Key strengths demonstrated
3. Areas for improvement
4. Key moments/highlights suggested by the data
5. Tactical recommendations
"""
        
        elif summary['analysis_type'] == 'career_performance':
            prompt += f"""Matches Analyzed: {summary['matches_played']}
Positions: {', '.join(summary['positions_played'])}

Career Statistics:
- Total Goals: {summary['career_stats']['total_goals']}
- Total Assists: {summary['career_stats']['total_assists']}
- Average Pass Accuracy: {summary['career_stats']['avg_pass_accuracy']:.1f}%
- Average Passes/Match: {summary['career_stats']['avg_passes_per_match']:.1f}
- Average Duels/Match: {summary['career_stats']['avg_duels_per_match']:.1f}
- Total Minutes: {summary['career_stats']['total_minutes']}

Recent Form (Last 5 Matches):
"""
            for match in summary['recent_form']:
                prompt += f"\n- {match['match_name']}: {match['total.passes']} passes, {match['total.goals']} goals"
            
            prompt += """

Based on this career data, provide:
1. Overall player profile (strengths, role, playstyle)
2. Consistency analysis (form, performance trends)
3. Comparison context (where does this player rank?)
4. Development trajectory
5. Suitability for different tactical systems
"""
        
        return prompt
    
    def get_player_insights_for_api(self, player_name: str, match_name: Optional[str] = None) -> dict:
        """
        Get insights ready to be served via API endpoint
        """
        summary = self.prepare_player_summary(player_name, match_name)
        
        if "error" in summary:
            return summary
        
        return {
            "success": True,
            "player_name": player_name,
            "match_name": match_name,
            "raw_data": summary,
            "ai_prompt": self.format_for_ai(summary),
            "note": "Send 'ai_prompt' to Claude API for analysis insights"
        }


def main():
    if len(sys.argv) < 2:
        print("Usage: python analyze_player_ai.py <player_name> [match_name]")
        print("\nExample:")
        print("  python analyze_player_ai.py 'Diogo Dalot'")
        print("  python analyze_player_ai.py 'Diogo Dalot' 'Manchester United vs Liverpool'")
        return
    
    player_name = sys.argv[1]
    match_name = sys.argv[2] if len(sys.argv) > 2 else None
    
    analyzer = PlayerAnalyzer()
    
    print(f"\n📊 Preparing analysis for {player_name}...")
    insights = analyzer.get_player_insights_for_api(player_name, match_name)
    
    if "error" in insights:
        print(f"❌ {insights['error']}")
        return
    
    print(f"\n✅ Analysis prepared!")
    print(f"\n{'='*70}")
    print("RAW DATA:")
    print(json.dumps(insights['raw_data'], indent=2, default=str))
    
    print(f"\n{'='*70}")
    print("AI ANALYSIS PROMPT (send to Claude/GPT):")
    print(insights['ai_prompt'])
    
    print(f"\n{'='*70}")
    print("Ready to send to LLM API endpoint!")


if __name__ == "__main__":
    main()
