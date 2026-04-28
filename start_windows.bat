@echo off
echo ============================================
echo     Attendance Pro - Starting Services
echo ============================================

echo.
echo [1/2] Starting FastAPI Backend...
start "Backend" cmd /k "cd backend && pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 5

echo [2/2] Starting Streamlit Frontend...
start "Frontend" cmd /k "cd frontend && pip install -r requirements.txt && streamlit run app.py --server.port 8501"

echo.
echo ✅ Services started!
echo    Backend:  http://localhost:8000
echo    Frontend: http://localhost:8501
echo    API Docs: http://localhost:8000/docs
echo.
pause
