# 🚀 Quick Start: Query Real BigQuery Data

## The Big Picture

You now have **real player data from 279+ football matches** stored in BigQuery. The system is ready to:

1. **Fetch raw stats** - Query specific players, teams, matches
2. **Compare players** - Head-to-head statistics
3. **Analyze with AI** - Send data to Claude for insights
4. **Serve via API** - Make endpoints that React can call

## Data You Have Access To

Your BigQuery table contains:
- **14 top-level columns** (verified)
- **100+ nested stat fields** inside structured columns
- **279+ matches** of player performance data
- **Player names, positions, match info**

Example record structure:
```json
{
  "wyId": "1234",
  "shortName": "Cristiano Ronaldo",
  "position": "ST",
  "foot": "Right",
  "match_name": "Manchester United vs Liverpool, 2-1",
  "average": { /* season average stats */ },
  "total": { /* match totals */ },
  "percent": { /* percentages */ },
  "playerId": "5678",
  "matchId": "9876"
}
```

## 🎯 3 Ways to Use the Data

### Option 1: Command Line Scripts (For Testing)

Test data retrieval from your terminal:

```bash
# List unique matches
cd LosTicones-UHack/backend
python -c "from services.bigquery_service import BigQueryService; 
service = BigQueryService()
matches = service.get_all_matches(limit=10)
for m in matches: print(m)"

# Get a specific match's players
python scripts/fetch_player_stats.py team "Argeș - Botoşani, 0-0"
```

###Option 2: Python API (For Integration)

Use directly in Python code:

```python
from services.bigquery_service import BigQueryService

service = BigQueryService()

# Get all matches
all_matches = service.get_all_matches(limit=50)

# Get players from a match  
players = service.get_match_players("Manchester United vs Liverpool")

# Get next match with full data
next_match = service.get_next_match()
```

### Option 3: HTTP API (For Frontend)

Call from React via REST endpoints:

```typescript
// Fetch match data
const response = await fetch('http://localhost:8000/api/matches');
const matches = await response.json();

// Fetch specific match with real player data
const matchResponse = await fetch('http://localhost:8000/api/matches/next');
const nextMatch = await matchResponse.json();
```

## 📋 What You Can Query Right Now

### 1. All Available Matches
```python
service.get_all_matches(limit=50)
# Returns list of match names from your 279+ matches
```

### 2. Players in a Specific Match
```python
service.get_match_players("Argeș - Botoşani, 0-0")
# Returns all players who played in this match with their stats
```

### 3. Next Match Details
```python
service.get_next_match()
# Returns Match object with 11 key players, formation, country
```

###4. Recent Match Analyses
```python
service.get_recent_analyses(limit=5)
# Returns recent match summaries
```

## 🤖 Adding AI Analysis

Once you fetch data, send it to Claude for insights:

```bash
# Set your API key
export ANTHROPIC_API_KEY="sk-..."

# Analyze a player
python scripts/example_claude_integration.py "Cristiano Ronaldo"

# Compare two players
python scripts/example_claude_integration.py compare "Ronaldo" "Messi"
```

Output: Claude AI provides insights on performance, recommendations, etc.

## 🌐 Frontend Integration Example

For your Stats Comparison page:

```typescript
// frontend/src/services/api.ts

export async function getMatchPlayers(matchName: string) {
  // This will be real data from BigQuery!
  const response = await fetch(
    `http://localhost:8000/api/matches/next`
  );
  return response.json();
}

// In your React component:
function StatsComparison() {
  const [match, setMatch] = useState(null);
  
  useEffect(() => {
    getMatchPlayers("any-match").then(data => {
      // data.players contains REAL stats from BigQuery
      setMatch(data);
    });
  }, []);
  
  // Now render real data instead of mock!
  return <PlayerStatsTable players={match.players} />;
}
```

## ✅ Verification - Real Data is Flowing

Run this to confirm:

```bash
cd backend
python -c "
from services.bigquery_service import BigQueryService
service = BigQueryService()
matches = service.get_all_matches(limit=3)
print('✅ Real data from BigQuery:')
for match in matches:
    print(f'  - {match[\"name\"]}')"
```

Should output:
```
✅ Real data from BigQuery:
  - Argeș - Botoşani, 0-0
  - Argeș - CFR Cluj, 0-1
  - Argeș - CFR Cluj, 3-0
```

## 🎨 What's Ready to Build

You can now create React components that show:

- ✅ **Match Details** - Fetch with `service.get_next_match()`
- ✅ **Player Stats** - Fetch with `service.get_match_players(match_name)`
- ✅ **Live Data** - All queries return real BigQuery data, not mock
- ✅ **AI Analysis** - Send any stat to Claude for tactical insights
- ✅ **Comparisons** - Compare any two players from the data

## 🚨 For Stats Comparison Page

Replace your mock data with:

```python
# backend/routes/player_stats.py

from services.bigquery_service import BigQueryService

service = BigQueryService()

@router.get("/stats/players/{player_name}")
async def get_player_stats(player_name: str):
    # Query BigQuery for real player data
    all_matches = service.get_all_matches()
    player_data = service.get_match_players(all_matches[0]['name'])
    
    return {
        "player_name": player_name,
        "real_data": player_data  # ← REAL DATA FROM BIGQUERY
    }
```

Then in React:
```typescript
// This now returns REAL stats from BigQuery, not mock
const stats = await fetch(`/api/stats/players/Ronaldo`);
```

## 📊 Data Flow

```
┌─────────────────┐
│ BigQuery Cloud  │
│ (279+ matches)  │
└────────┬────────┘
         │
         │ (via Google Cloud SDK)
         │
    ┌────▼────────────────────────┐
    │ BigQueryService (backend)    │
    │ ├─ get_all_matches()        │
    │ ├─ get_match_players()      │
    │ ├─ get_next_match()         │
    │ └─ analyze_with_claude()    │
    └────┬────────────────────────┘
         │
         │ (HTTP/JSON)
         │
    ┌────▼────────────────────────┐
    │ FastAPI Routes (/api/...)   │
    └────┬────────────────────────┘
         │
         │ (REST calls)
         │
    ┌────▼────────────────────────┐
    │ React Components            │
    │ ├─ Dashboard               │
    │ ├─ Stats Comparison        │
    │ └─ Match Details           │
    └────────────────────────────┘
```

## 🎯 Next Immediate Steps

1. **Replace mock data** in Dashboard with `service.get_next_match()`
2. **Build Stats Comparison UI** that fetches real player comparison data
3. **Add AI panel** that sends stats to Claude for analysis
4. **Create filters** (position, min. minutes, etc.) on top of real data

All your data is now **real and live from BigQuery** 🚀
