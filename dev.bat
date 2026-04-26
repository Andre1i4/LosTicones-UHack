@echo off
REM Development startup script for Windows

echo.
echo 🚀 Starting U-Scout Development Environment
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.9+
    exit /b 1
)

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+
    exit /b 1
)

REM Setup backend
echo 📦 Setting up backend...
cd backend

if not exist "venv" (
    python -m venv venv
)

call venv\Scripts\activate.bat

pip install -r requirements.txt

echo ✅ Backend ready
echo Starting FastAPI backend on http://localhost:8000...
start cmd /k "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

cd ..

REM Setup frontend
echo.
echo 📦 Setting up frontend...
cd frontend
call npm install --legacy-peer-deps

echo ✅ Frontend ready
echo Starting Vite dev server on http://localhost:5173...
start cmd /k "npm run dev"

cd ..

echo.
echo ✅ U-Scout Development Environment Started!
echo.
echo 🌐 Frontend:  http://localhost:5173
echo 🔌 Backend:   http://localhost:8000
echo 📚 API Docs:  http://localhost:8000/docs
echo.
echo Press Ctrl+C in each terminal to stop the services
