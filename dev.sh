#!/bin/bash
# Install and run backend and frontend in development mode

echo "🚀 Starting U-Scout Development Environment"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Python and pip
if ! command -v python &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.9+"
    exit 1
fi

# Check Node and npm
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Setup backend
echo -e "${BLUE}📦 Setting up backend...${NC}"
cd backend
if [ ! -d "venv" ]; then
    python -m venv venv
fi

# Activate venv
if [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
pip install -r requirements.txt

# Start backend in background
echo -e "${GREEN}✅ Backend ready${NC}"
echo "Starting FastAPI backend on http://localhost:8000..."
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

echo ""
echo -e "${BLUE}📦 Setting up frontend...${NC}"
cd frontend
npm install --legacy-peer-deps
echo -e "${GREEN}✅ Frontend ready${NC}"
echo "Starting Vite dev server on http://localhost:5173..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ U-Scout Development Environment Started!${NC}"
echo ""
echo "🌐 Frontend:  http://localhost:5173"
echo "🔌 Backend:   http://localhost:8000"
echo "📚 API Docs:  http://localhost:8000/docs"
echo ""
echo "💡 Press Ctrl+C to stop all services"

# Trap Ctrl+C and kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT INT TERM

wait
