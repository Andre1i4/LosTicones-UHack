# GCP Authentication Setup: BigQuery + Vertex AI

## Quick Answer: Do You Need 2 API Keys?

**NO!** You need **ONE service account** that has permissions for both BigQuery AND Vertex AI. They share the same credentials.

---

## Current Setup: You're Already Good! ✅

You're already using **Application Default Credentials (ADC)** which is the BEST approach:

```bash
gcloud auth application-default login
```

This gives you:
- ✅ BigQuery access
- ✅ Vertex AI access
- ✅ No API keys needed locally
- ✅ Automatic refresh (no manual key management)
- ✅ Free (uses your gcloud login)

**If this is working for you, KEEP IT!** Skip to "Python Code" section below.

---

## Alternative 1: Use Service Account JSON Key (Recommended for Production)

If you need to deploy or share credentials, create a service account:

### Step 1: Create Service Account in GCP Console
1. Go to [GCP Console](https://console.cloud.google.com)
2. Select `los-ticones-u-hack` project
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**
5. Name: `u-scout-service` 
6. Click **Create**

### Step 2: Add Permissions (ONE account for both services!)
1. Click the service account you just created
2. Go to **Permissions** tab (top menu)
3. Click **Grant Access**
4. Add these roles:
   - `BigQuery Editor` (for querying data)
   - `Vertex AI User` (for AI analysis)
   - `Service Account User`

### Step 3: Create & Download JSON Key
1. Go to **Keys** tab
2. Click **Add Key** → **Create new key**
3. Choose **JSON**
4. Save as `key.json` in your project root (⚠️ **DON'T commit to GitHub!**)

### Step 4: Tell Python to Use It
```bash
# Set environment variable (Windows PowerShell)
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\key.json"

# Or in your Python code:
import os
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'key.json'
```

---

## Alternative 2: API Keys (Simpler, Less Secure)

⚠️ **Not recommended** because:
- Can't be restricted to specific services
- Less secure than service accounts
- Harder to manage permissions

But if you want it:

### Step 1: Create API Key
1. Go to [GCP Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Click **Create Credentials** → **API Key**
4. Copy the key

### Step 2: Enable APIs
1. **APIs & Services** → **Enabled APIs & services**
2. Click **Enable APIs and Services**
3. Search and enable:
   - `bigquery.googleapis.com`
   - `aiplatform.googleapis.com`

### Step 3: Use in Python
```python
from google.cloud import bigquery
from google.cloud import aiplatform

# Set your API key
API_KEY = "your-api-key-here"
os.environ['GOOGLE_API_KEY'] = API_KEY

# BigQuery will use it automatically
client = bigquery.Client()
```

---

## ⚠️ Important: $5 Credit Alert!

Your $5 credit will be used by:

| Service | Cost Per | Your Usage |
|---------|----------|-----------|
| BigQuery | $6.25 per TB scanned | ✅ FREE for first 1TB/month |
| Vertex AI (API calls) | $0.001 - $0.1 per 1K requests | ~$0.10 for 100 analyses |
| Vertex AI (training) | $3.59 per hour | ❌ DON'T use for hackathon |
| **Total for Hackathon** | | **~$0.20** ✅ Safe! |

**You're fine for the hackathon!** Just don't train custom models.

---

## Python Code: Query BigQuery + Analyze with Vertex AI

### Your Current Setup (Using ADC - BEST!)

```python
from google.cloud import bigquery
from google.cloud import aiplatform

# No credentials needed! Uses local gcloud login
bq_client = bigquery.Client(project='los-ticones-u-hack')
aiplatform.init(project='los-ticones-u-hack', location='us-central1')
```

### Get Player Data from BigQuery

```python
def get_player_stats(player_name: str):
    """Query BigQuery for player stats"""
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
        aerialDuels,
        interceptions
    FROM `los-ticones-u-hack.u_scout.v_master_stats`
    WHERE shortName = '{player_name}'
    LIMIT 20
    """
    
    df = bq_client.query(query).to_dataframe()
    return df
```

### Analyze with Vertex AI

```python
from google.cloud import aiplatform

def analyze_player_with_vertex_ai(player_name: str, stats_df):
    """Use Vertex AI to analyze player"""
    
    # Convert stats to text for AI
    stats_text = stats_df.to_string()
    
    prompt = f"""
    Analyze this footballer's performance:
    
    Player: {player_name}
    Stats:
    {stats_text}
    
    Provide:
    1. Strengths
    2. Weaknesses
    3. Position fit
    4. Recommendation
    """
    
    # Use Vertex AI Text Generation
    model = aiplatform.TextGenerationModel.from_pretrained("text-bison@002")
    
    response = model.predict(
        prompt=prompt,
        max_output_tokens=500,
        temperature=0.7,
    )
    
    return response.text
```

### Complete Example: Query → Analyze → Display

```python
from google.cloud import bigquery, aiplatform
import os

# Initialize (uses ADC automatically)
bq_client = bigquery.Client(project='los-ticones-u-hack')
aiplatform.init(project='los-ticones-u-hack', location='us-central1')

def analyze_player(player_name: str):
    """Complete pipeline: BigQuery → Vertex AI → Result"""
    
    # Step 1: Get data from BigQuery
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
        aerialDuels,
        interceptions
    FROM `los-ticones-u-hack.u_scout.v_master_stats`
    WHERE shortName = '{player_name}'
    """
    
    df = bq_client.query(query).to_dataframe()
    
    if df.empty:
        return f"No data found for {player_name}"
    
    # Step 2: Create prompt with real data
    stats_summary = {
        'total_matches': len(df),
        'avg_passes': df['passes'].mean(),
        'total_goals': df['goals'].sum(),
        'total_assists': df['assists'].sum(),
        'avg_duels': df['duels'].mean(),
    }
    
    prompt = f"""
    Analyze this footballer:
    
    Name: {player_name}
    Position: {df['position'].iloc[0]}
    Matches analyzed: {stats_summary['total_matches']}
    
    Performance stats:
    - Average passes per match: {stats_summary['avg_passes']:.1f}
    - Total goals: {stats_summary['total_goals']:.0f}
    - Total assists: {stats_summary['total_assists']:.0f}
    - Average duels won: {stats_summary['avg_duels']:.1f}
    
    Provide a brief analysis of their strengths and areas for improvement.
    """
    
    # Step 3: Get AI analysis
    model = aiplatform.TextGenerationModel.from_pretrained("text-bison@002")
    response = model.predict(
        prompt=prompt,
        max_output_tokens=300,
        temperature=0.7,
    )
    
    return {
        'player': player_name,
        'stats': stats_summary,
        'analysis': response.text
    }

# Use it!
result = analyze_player("Cristiano Ronaldo")
print(result['analysis'])
```

---

## Backend Integration: FastAPI Endpoint

```python
# backend/routes/ai_analysis.py

from fastapi import APIRouter
from google.cloud import bigquery, aiplatform
import os

router = APIRouter()

# Initialize clients
bq_client = bigquery.Client(project='los-ticones-u-hack')
aiplatform.init(project='los-ticones-u-hack', location='us-central1')

@router.get("/analyze/{player_name}")
async def analyze_player(player_name: str):
    """Get BigQuery data + Vertex AI analysis for a player"""
    
    try:
        # Get real data from BigQuery
        query = f"""
        SELECT 
            shortName,
            position,
            passes,
            assists,
            goals,
            shots
        FROM `los-ticones-u-hack.u_scout.v_master_stats`
        WHERE shortName = '{player_name}'
        LIMIT 20
        """
        
        df = bq_client.query(query).to_dataframe()
        
        if df.empty:
            return {"error": f"No data for {player_name}"}
        
        # Create AI prompt with REAL data
        prompt = f"""
        Analyze {player_name} from these real stats:
        Matches: {len(df)}
        Goals: {df['goals'].sum():.0f}
        Assists: {df['assists'].sum():.0f}
        
        Be specific and brief.
        """
        
        # Get Vertex AI analysis
        model = aiplatform.TextGenerationModel.from_pretrained("text-bison@002")
        response = model.predict(prompt=prompt, max_output_tokens=200)
        
        return {
            "player": player_name,
            "stats": {
                "matches": len(df),
                "goals": float(df['goals'].sum()),
                "assists": float(df['assists'].sum()),
            },
            "analysis": response.text
        }
        
    except Exception as e:
        return {"error": str(e)}
```

---

## Setup Checklist

### For Hackathon (Right Now - Use What You Have!)
- [ ] Verify `gcloud auth application-default login` worked
- [ ] Test: `python -c "from google.cloud import bigquery; print('OK!')"`
- [ ] Run your BigQuery queries (they already work!)
- [ ] Update FastAPI to use Vertex AI (code above)

### If Deploying to Cloud Run (Later)
- [ ] Create service account
- [ ] Download JSON key
- [ ] Set `GOOGLE_APPLICATION_CREDENTIALS` env var
- [ ] Upload key to Cloud Secret Manager

### Environment Variables You Need
```bash
# .env file
GCP_PROJECT_ID=los-ticones-u-hack
GCP_REGION=us-central1
# If using JSON key:
GOOGLE_APPLICATION_CREDENTIALS=./key.json
```

---

## Troubleshooting

**"Authentication failed"**
```bash
# Re-authenticate
gcloud auth application-default login

# Verify it worked
gcloud auth application-default print-access-token
```

**"Module not found"**
```bash
pip install google-cloud-bigquery google-cloud-aiplatform
```

**"Permission denied"**
- Make sure your GCP user has Editor role on the project
- Or use service account with proper roles

**"API not enabled"**
```bash
# Enable them
gcloud services enable bigquery.googleapis.com
gcloud services enable aiplatform.googleapis.com
```

---

## Cost Summary for Your Hackathon

| Operation | Queries | Cost |
|-----------|---------|------|
| BigQuery scan (first 1TB free) | 1000s | **$0** |
| Vertex AI text generation | 100 analyses | **~$0.10** |
| Network/storage | Small | **<$0.05** |
| **TOTAL** | | **~$0.20** ✅ |

You're safe with your $5 credit! 🎉

---

## Next: Update Your Backend

1. Install: `pip install google-cloud-aiplatform`
2. Add the FastAPI endpoint from above
3. Test: `curl http://localhost:8000/api/analyze/PlayerName`
4. Update frontend to call it

That's it! Real BigQuery data + Vertex AI analysis = No more mocks! 🚀
