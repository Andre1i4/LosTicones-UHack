"""
Practical Examples: How to Query Real BigQuery Data

This script shows the simplest, most practical ways to:
1. Get all matches
2. Get player data from a match
3. Compare players
4. Analyze with Claude AI

Run these examples to see REAL data from BigQuery!
"""

from services.bigquery_service import BigQueryService
import pandas as pd

# Initialize the service (uses your local ADC credentials)
service = BigQueryService()

print("=" * 70)
print("EXAMPLE 1: Get All Available Matches")
print("=" * 70)

matches = service.get_all_matches(limit=10)
print(f"\nFound {len(matches)} matches:")
for i, match in enumerate(matches, 1):
    print(f"  {i}. {match['name']}")


print("\n" + "=" * 70)
print("EXAMPLE 2: Get Player Data from a Specific Match")
print("=" * 70)

if matches:
    match_name = matches[0]['name']
    print(f"\nQuerying players from: {match_name}")
    
    players = service.get_match_players(match_name)
    print(f"Found {len(players)} players with stats:\n")
    
    # Show first 5 players
    for i, player in enumerate(players[:5], 1):
        print(f"{i}. {player.get('name', 'Unknown')} - {player.get('position', '?')}")
        print(f"   Minutes: {player.get('minutesOnField', '?')}, "
              f"Passes: {player.get('passes', '?')}, "
              f"Pass Acc: {player.get('passAcc', '?')}%")


print("\n" + "=" * 70)
print("EXAMPLE 3: Get Next Match with Full Lineup")
print("=" * 70)

next_match = service.get_next_match()
if next_match:
    print(f"\nMatch: {next_match.id}")
    print(f"Players: {len(next_match.players)}")
    print("\nKey Players:")
    for player in next_match.players[:5]:
        print(f"  • {player.name} ({player.position}) - Pass Acc: {player.stats.passAcc}%")


print("\n" + "=" * 70)
print("EXAMPLE 4: Get Recent Match Analyses")
print("=" * 70)

recent = service.get_recent_analyses(limit=3)
print(f"\nRecent analyses ({len(recent)} matches):")
for i, analysis in enumerate(recent, 1):
    print(f"  {i}. {analysis.name} - {analysis.stats}")


print("\n" + "=" * 70)
print("EXAMPLE 5: Raw BigQuery Query (Advanced)")
print("=" * 70)

# You can also run custom queries
query = """
SELECT DISTINCT match_name
FROM `los-ticones-u-hack.u_scout.v_master_stats`
LIMIT 5
"""

print("\nCustom Query Results:")
df = service.client.query(query).to_dataframe()
for idx, row in df.iterrows():
    print(f"  - {row['match_name']}")


print("\n" + "=" * 70)
print("✅ ALL EXAMPLES COMPLETE - REAL DATA FROM BIGQUERY!")
print("=" * 70)

print("\n💡 NEXT: Use these functions in your React components:")
print("""
Example in React:
  const players = await fetch('http://localhost:8000/api/matches/next');
  const matchData = await players.json();
  // matchData.players contains REAL stats from BigQuery!
""")
