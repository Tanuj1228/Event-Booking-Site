@echo off
echo Starting EventEase Services...

echo Starting Backend Server...
cd backend
start cmd /k "npm run dev"

echo Starting Frontend Server...
cd ../frontend
start cmd /k "npx serve ."

echo Both servers are starting! Open your browser to http://localhost:3000