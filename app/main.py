from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.database import engine, Base
from app.routers import profile, meals, steps, analytics

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NutriPulse AI",
    description="Nutritional tracking, TDEE calculator, LLM food extraction with Gemini 2.5 Flash, and dynamic energy budget.",
    version="1.0.0",
)

# Enable CORS for local client-server interactions
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(profile.router)
app.include_router(meals.router)
app.include_router(steps.router)
app.include_router(analytics.router)

# Static directory path
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

# Mount static assets
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def serve_index():
    """Serve the single-page application dashboard."""
    return FileResponse(STATIC_DIR / "index.html")

@app.get("/health")
def health_check():
    return {"status": "ok", "app": "NutriPulse AI"}
