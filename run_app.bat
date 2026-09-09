@echo off
REM Auto‑run NutriPulse AI FastAPI app
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
