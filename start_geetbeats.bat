@echo off
start "GeetBeats Backend" cmd /k "cd /d %~dp0backend && .\venv\Scripts\activate && uvicorn main:app --reload"
start "GeetBeats Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 >nul
start http://localhost:5173