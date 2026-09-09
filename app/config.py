import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'calories.db'}")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

def get_gemini_api_key() -> str:
    """Retrieve the current Gemini API key, reloading from env if necessary."""
    global GEMINI_API_KEY
    if not GEMINI_API_KEY:
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    return GEMINI_API_KEY

def update_gemini_api_key(new_key: str) -> None:
    """Update the Gemini API key in memory and in the .env file."""
    global GEMINI_API_KEY
    GEMINI_API_KEY = new_key.strip()
    os.environ["GEMINI_API_KEY"] = GEMINI_API_KEY

    # Update or append in .env file
    if ENV_PATH.exists():
        lines = ENV_PATH.read_text(encoding="utf-8").splitlines()
        key_found = False
        new_lines = []
        for line in lines:
            if line.startswith("GEMINI_API_KEY="):
                new_lines.append(f"GEMINI_API_KEY={GEMINI_API_KEY}")
                key_found = True
            else:
                new_lines.append(line)
        if not key_found:
            new_lines.append(f"GEMINI_API_KEY={GEMINI_API_KEY}")
        ENV_PATH.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
    else:
        ENV_PATH.write_text(f"GEMINI_API_KEY={GEMINI_API_KEY}\n", encoding="utf-8")
