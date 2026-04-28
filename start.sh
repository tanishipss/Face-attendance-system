#!/bin/bash
echo "============================================"
echo "    Attendance Pro - Starting Services"
echo "============================================"

echo ""
echo "[1/2] Starting FastAPI Backend..."
cd backend
pip install -r requirements.txt -q
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

sleep 3

echo "[2/2] Starting Streamlit Frontend..."
cd frontend
pip install -r requirements.txt -q
streamlit run app.py --server.port 8501 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started!"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:8501"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services."

trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Stopped.'" INT
wait
