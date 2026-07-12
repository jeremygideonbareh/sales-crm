#!/usr/bin/env bash
set -e

echo "=== Installing backend dependencies ==="
cd backend
pip install -r requirements.txt

echo "=== Seeding database ==="
python -m app.seed

echo "=== Starting backend on :8000 ==="
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

echo "=== Installing frontend dependencies ==="
cd ../frontend
npm install

echo "=== Starting frontend on :5173 ==="
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo "  API Docs: http://localhost:8000/docs"
echo "  Login:    admin@agency.com / admin123"
echo "============================================"
echo ""
wait
