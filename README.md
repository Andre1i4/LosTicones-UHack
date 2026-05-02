# U-Scout: Unified Football Analysis Platform

A modern, production-ready monorepo combining a React TypeScript frontend with a FastAPI backend connected to Google Cloud BigQuery.

## 📋 Project Structure

```
LosTicones-UHack/
├── backend/                    # FastAPI Backend Service
│   ├── main.py                # FastAPI application entry point
│   ├── config.py              # Environment configuration
│   ├── requirements.txt        # Python dependencies
│   ├── services/
│   │   ├── bigquery_service.py # BigQuery data access layer
│   │   └── __init__.py
│   ├── models/                # Pydantic data models
│   │   ├── player.py          # Player data structures
│   │   ├── match.py           # Match/opponent structures
│   │   ├── assignment.py      # Player assignment structures
│   │   ├── auth.py            # Auth request/response models
│   │   └── __init__.py
│   ├── routes/                # API endpoints
│   │   ├── health.py          # Health check
│   │   ├── auth.py            # Authentication
│   │   ├── matches.py         # Match analysis endpoints
│   │   └── __init__.py
│   └── .env.example           # Environment template
│
├── frontend/                  # React + Vite Frontend (from App Frontend Design)
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/         # Route pages (Login, Dashboard, etc.)
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── context/       # React context (auth, theme)
│   │   │   ├── data/          # Mock data fallback
│   │   │   ├── routes.tsx     # Route definitions
│   │   │   └── App.tsx        # Main app component
│   │   ├── services/
│   │   │   └── api.ts         # Backend API client
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env.local             # Frontend environment
│   └── tsconfig.json
│
├── pipeline/                  # Data preprocessing scripts (from U-Scout-Data)
│   ├── prep_data.py           # Merge match stats to JSONL
│   ├── show_team.py           # Display team data from BigQuery
│   ├── test_db.py             # Test BigQuery connection
│   ├── all_matches_stats.jsonl # Prepared match statistics
│   └── stats_files/           # Raw match stat JSONs
│
├── dev.sh                     # Development startup (macOS/Linux)
├── dev.bat                    # Development startup (Windows)
└── README.md                  # This file

```

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **GCP Access** with Application Default Credentials (ADC) configured
- `gcloud auth application-default login` already run on your machine

### Setup & Run

#### **Windows**
```bash
.\dev.bat
```
This will open two terminals:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

#### **macOS/Linux**
```bash
chmod +x dev.sh
./dev.sh
```

#### **Manual Setup (if scripts don't work)**

**Backend:**
```bash
cd backend
python -m venv venv

# Activate venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend (in another terminal):**
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

## 🔌 API Endpoints

All endpoints start with `http://localhost:8000/api/`

### Health & Authentication
- `GET /health` - Health check
- `POST /auth/login` - User login

### Matches
- `GET /matches` - Get all matches
- `GET /matches/next` - Get next upcoming match (for Dashboard)
- `GET /matches/recent` - Get recent analyses (for Dashboard)
- `GET /matches/{match_id}` - Get specific match details

### OpenAPI Docs
- Interactive Swagger UI: http://localhost:8000/docs

## 📚 Data Flow

```
Google Cloud BigQuery
    ↓ (u_scout.v_master_stats)
Backend / BigQueryService
    ↓
FastAPI Routes (/api/matches, etc.)
    ↓
Frontend API Client (src/services/api.ts)
    ↓
React Components & Pages
    ↓
User Browser
```

## 🔐 Authentication

### MVP Implementation
For the hackathon, authentication is simplified:
- Any name + password + team key is accepted
- Returns a mock JWT token
- Stored in `localStorage` as `auth_token`

### Upgrade Path (Post-Hackathon)
- Add JWT validation on backend
- Implement role-based access control (Coach vs Player)
- Persist assignments to a database (Firestore/PostgreSQL)

## 🎯 Key Features

### Frontend
✅ **Login Page** - Role selection (Coach/Player)
✅ **Dashboard** - Next match + recent analyses from BigQuery
✅ **Opponent Analysis** - Interactive pitch view (currently mock data)
✅ **Player Assignments** - Assign team players to opponents
✅ **Dark/Light Theme** - Dark mode by default
✅ **Multi-language** - English & Romanian

### Backend
✅ **FastAPI** - Modern async Python framework
✅ **BigQuery Integration** - Real data from your GCP project
✅ **CORS** - Allows frontend to call backend
✅ **Error Handling** - Graceful fallbacks to mock data

### Data
✅ **279+ Match Files** - Converted to JSONL format
✅ **Player Statistics** - From u_scout.v_master_stats table
✅ **Team Data** - U Cluj squad information

## 🧪 Testing

### Test Backend API
```bash
# In another terminal
curl http://localhost:8000/health
curl http://localhost:8000/docs  # Open in browser for Swagger UI
```

### Test Login Flow
1. Go to http://localhost:5173
2. Enter any name, password, team key
3. Click Login
4. Should see Dashboard with real opponent data

### Verify BigQuery Connection
```bash
cd backend
python -c "from services.bigquery_service import BigQueryService; svc = BigQueryService(); print(svc.get_all_matches())"
```

## 📊 Environment Variables

### Backend (backend/.env)
```env
GCP_PROJECT=los-ticones-u-hack
BIGQUERY_DATASET=u_scout
BIGQUERY_TABLE=v_master_stats
DEBUG=true
FRONTEND_URL=http://localhost:5173
```

### Frontend (frontend/.env.local)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## 🐛 Troubleshooting

### "ModuleNotFoundError" for backend modules
Make sure you're in the `backend/` directory or add it to PYTHONPATH:
```bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### Frontend can't reach backend
1. Check backend is running: http://localhost:8000/health
2. Check `VITE_API_BASE_URL` in `frontend/.env.local`
3. Check CORS is enabled in `backend/main.py`

### BigQuery connection error
1. Ensure `gcloud auth application-default login` was run
2. Verify GCP project ID matches in `backend/config.py`
3. Check you have BigQuery API enabled in GCP

### "Port already in use"
```bash
# Find and kill process on port 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # macOS/Linux
```

## 🚢 Deployment (Future)

Current setup is for local development. For production:

1. **Backend**: Deploy to Cloud Run, App Engine, or VPS
2. **Frontend**: Build and deploy to Vercel, Firebase Hosting, or S3+CloudFront
3. **Auth**: Integrate with Firebase Auth or Auth0
4. **Database**: Move assignments storage to Firestore or PostgreSQL

## 📝 Next Steps

- [ ] Wire OpponentAnalysis page to backend
- [ ] Add assignment storage (Firestore)
- [ ] Add real authentication (JWT validation)
- [ ] Add error boundaries and loading states
- [ ] Add unit & integration tests
- [ ] Deploy to production

## 👥 Team Credits

Built for **U Hack 2026** by **Los Ticones**

## 📄 License

Internal project - All rights reserved

---

**Questions?** Check the code comments or open an issue!
