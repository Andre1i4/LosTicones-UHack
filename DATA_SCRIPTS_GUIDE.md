# BigQuery Data Scripts & API Integration Guide

This guide explains how to fetch real data from BigQuery for player statistics, comparisons, and AI analysis.

## 📊 Data Structure

Your BigQuery table (`los-ticones-u-hack.u_scout.v_master_stats`) contains:
- **100+ columns** of player statistics
- **279+ matches** of player performance data
- **Nested data** like `total.minutesOnField`, `total.passes`, `location.x`, `location.y`

### Available Fields
```
shortName              - Player name
position              - Player position (CB, RB, CM, ST, etc)
foot                  - Preferred foot (Left/Right)
team.name             - Team name
match_name            - Match identifier

total.minutesOnField  - Minutes played
total.passes          - Pass count
total.passAccuracy    - Pass success rate (%)
total.goals           - Goals scored
total.assists         - Assists
total.duels           - Ground duels
total.aerialDuels     - Aerial duels won
total.tackles         - Tackles made
total.interceptions   - Interceptions
total.dribbles        - Successful dribbles
total.foulsCommitted  - Fouls made
total.foulsReceived   - Fouls against
total.yellowCard      - Yellow cards
total.redCard         - Red cards

location.x            - X position on field
location.y            - Y position on field
```

## 🚀 Script 1: Fetch Player Statistics

### Purpose
Extract real player stats from BigQuery for:
- Individual player performance across matches
- Player comparisons (head-to-head stats)
- Team statistics for specific matches
- Heatmap/positioning data

### File
`backend/scripts/fetch_player_stats.py`

### Usage

#### 1. Get a player's stats across ALL matches
```bash
cd backend
python scripts/fetch_player_stats.py player "Cristiano Ronaldo"
```

Output:
```
player_name | match_name | position | minutesOnField | passes | passAccuracy | goals
-----------|-----------|----------|----------------|--------|--------------|-------
Ronaldo     | Man Utd vs City | ST | 90 | 45 | 82.1 | 2
Ronaldo     | Man Utd vs Pool | ST | 87 | 43 | 79.5 | 1
```

#### 2. Compare two players (career stats)
```bash
python scripts/fetch_player_stats.py compare "Ronaldo" "Messi"
```

Output shows average stats, total goals/assists, matches played for both

#### 3. Compare two players in a specific match
```bash
python scripts/fetch_player_stats.py compare "Ronaldo" "Messi" "Champions League Final"
```

#### 4. Get all players' stats for a match
```bash
python scripts/fetch_player_stats.py team "Manchester United vs Liverpool"
```

#### 5. Get team stats for specific team in match
```bash
python scripts/fetch_player_stats.py team "Man Utd vs City" "Manchester United"
```

#### 6. Get player heatmap data (positioning)
```bash
python scripts/fetch_player_stats.py heatmap "Ronaldo" "Man Utd vs City"
```

### Using in Python Code

```python
from scripts.fetch_player_stats import PlayerStatsExtractor

extractor = PlayerStatsExtractor()

# Get all matches for a player
df = extractor.get_player_all_matches("Cristiano Ronaldo")
print(f"Found {len(df)} matches")
print(df[['match_name', 'goals', 'assists', 'passAccuracy']])

# Compare players in a match
comparison = extractor.get_player_vs_player(
    "Ronaldo", 
    "Messi",
    match_name="Champions League Final"
)

# Get team performance
team_stats = extractor.get_team_stats_for_match("Man Utd vs City", "Manchester United")
```

## 🤖 Script 2: AI Analysis

### Purpose
Prepare player data for AI analysis with Claude/GPT to generate:
- Performance insights
- Tactical recommendations
- Player comparisons
- Trend analysis

### File
`backend/scripts/analyze_player_ai.py`

### Usage

#### 1. Analyze player career
```bash
python scripts/analyze_player_ai.py "Cristiano Ronaldo"
```

#### 2. Analyze specific match performance
```bash
python scripts/analyze_player_ai.py "Ronaldo" "Manchester United vs Liverpool"
```

### Output Example
```
Analysis prepared!

RAW DATA:
{
  "player_name": "Cristiano Ronaldo",
  "career_stats": {
    "total_goals": 45,
    "total_assists": 12,
    "avg_pass_accuracy": 78.5,
    "matches_played": 28
  }
}

AI ANALYSIS PROMPT (send to Claude/GPT):
Analyze the following player statistics...
- Total Goals: 45
- Total Assists: 12
- Average Pass Accuracy: 78.5%
...

Based on this career data, provide:
1. Overall player profile (strengths, role, playstyle)
2. Consistency analysis (form, performance trends)
...
```

### Using in Python Code

```python
from scripts.analyze_player_ai import PlayerAnalyzer

analyzer = PlayerAnalyzer()

# Prepare data for AI
insights = analyzer.get_player_insights_for_api("Ronaldo")

# Get the AI prompt
ai_prompt = insights['ai_prompt']
print(ai_prompt)  # Ready to send to Claude API

# Send to Claude
import anthropic
client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": ai_prompt}]
)
print(response.content[0].text)
```

## 🔗 API Endpoints (New!)

All scripts are now accessible via REST API. Backend includes these new endpoints:

### 1. Get Player Stats
```
GET /api/stats/players/stats/{player_name}?match_name=optional
```

**Example:**
```bash
curl "http://localhost:8000/api/stats/players/stats/Cristiano%20Ronaldo"
```

**Response:**
```json
{
  "player_name": "Cristiano Ronaldo",
  "career_stats": {
    "matches_played": 28,
    "total_goals": 45,
    "avg_passes": 42.5,
    "positions": ["ST", "LW"]
  },
  "recent_matches": [...]
}
```

### 2. Compare Two Players
```
GET /api/stats/players/compare?player1=Name1&player2=Name2&match_name=optional
```

**Example:**
```bash
curl "http://localhost:8000/api/stats/players/compare?player1=Ronaldo&player2=Messi"
```

### 3. AI Analysis Endpoint
```
GET /api/stats/players/analyze/{player_name}?match_name=optional
```

**Example:**
```bash
curl "http://localhost:8000/api/stats/players/analyze/Ronaldo"
```

**Response includes:**
- Raw statistics from BigQuery
- AI prompt ready for Claude/GPT

### 4. Team Stats for Match
```
GET /api/stats/teams/stats/{match_name}?team_name=optional
```

### 5. Heatmap Data
```
GET /api/stats/heatmap/{player_name}?match_name=optional
```

**Response:**
```json
{
  "player_name": "Ronaldo",
  "heatmap_points": [
    {"x": 52.3, "y": 48.2, "frequency": 45},
    {"x": 53.1, "y": 47.9, "frequency": 38}
  ]
}
```

### 6. List All Players
```
GET /api/stats/stats/unique-players?limit=100
```

## 🔄 Integration with Frontend

### Using Stats in React Components

```typescript
// frontend/src/services/api.ts - Add these functions

export async function getPlayerStats(playerName: string, matchName?: string) {
  const url = new URL(`${API_BASE_URL}/stats/players/stats/${playerName}`);
  if (matchName) url.searchParams.append('match_name', matchName);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch player stats');
  return response.json();
}

export async function comparePlayersStats(
  player1: string, 
  player2: string, 
  matchName?: string
) {
  const url = new URL(`${API_BASE_URL}/stats/players/compare`);
  url.searchParams.append('player1', player1);
  url.searchParams.append('player2', player2);
  if (matchName) url.searchParams.append('match_name', matchName);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to compare players');
  return response.json();
}

export async function getPlayerAnalysis(playerName: string, matchName?: string) {
  const url = new URL(`${API_BASE_URL}/stats/players/analyze/${playerName}`);
  if (matchName) url.searchParams.append('match_name', matchName);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch player analysis');
  return response.json();
}
```

### Using in a React Component

```typescript
// Example: Stats Comparison Page
import { useEffect, useState } from 'react';
import { comparePlayersStats } from '../services/api';

export function StatsComparison() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    comparePlayersStats('Cristiano Ronaldo', 'Lionel Messi')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>No data</div>;

  return (
    <div className="stats-comparison">
      <h2>Player Comparison</h2>
      <div className="comparison-table">
        {stats.data.map((row) => (
          <div key={row.player_name} className="player-row">
            <h3>{row.player_name}</h3>
            <p>Goals: {row.total_goals}</p>
            <p>Pass Accuracy: {row.avg_passAccuracy}%</p>
            {/* More stats... */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 📝 Creating Custom Queries

Need something specific? Add methods to `PlayerStatsExtractor`:

```python
# backend/scripts/fetch_player_stats.py

def get_top_scorers(self, match_name: str, limit: int = 10) -> pd.DataFrame:
    """Get top scorers from a specific match"""
    query = f"""
    SELECT 
        shortName as player_name,
        position,
        total.goals,
        total.assists,
        total.minutesOnField
    FROM `{self.fully_qualified_table}`
    WHERE match_name = @match_name
    ORDER BY total.goals DESC
    LIMIT {limit}
    """
    
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("match_name", "STRING", match_name),
        ]
    )
    
    df = self.client.query(query, job_config=job_config).to_dataframe()
    return df
```

Then expose via API:

```python
# backend/routes/player_stats.py

@router.get("/stats/top-scorers/{match_name}")
async def get_top_scorers(match_name: str, limit: int = Query(10)):
    try:
        df = extractor.get_top_scorers(match_name, limit)
        return {"match_name": match_name, "scorers": df.to_dict('records')}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## ✅ Workflow Summary

1. **Identify what you need**: Player stats, team comparison, AI analysis?
2. **Use the script**: Run `python scripts/fetch_player_stats.py` to test locally
3. **Expose via API**: Add endpoint in `routes/player_stats.py`
4. **Call from React**: Use `api.ts` functions in your components
5. **Add AI**: Send data to Claude API for insights

## 🎯 Next Steps

- [ ] Create Stats Comparison UI component using `/api/stats/players/compare`
- [ ] Build heatmap visualization using `/api/stats/heatmap`
- [ ] Add AI analysis panel that calls `/api/stats/players/analyze`
- [ ] Create "Match Report" endpoint aggregating all stats
- [ ] Add filtering (by position, min. minutes played, etc)

All your data is real, coming directly from BigQuery! 🚀
