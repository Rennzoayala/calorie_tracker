from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import UserProfile
from app.schemas import (
    UserProfileResponse,
    UserProfileUpdate,
    TDEECalculateRequest,
    TDEECalculateResponse,
    MacroBreakdown,
    ApiKeyUpdateRequest,
    ApiKeyStatusResponse,
)
from app.calculator import (
    calculate_bmr,
    calculate_tdee,
    calculate_target_calories,
    calculate_macro_split,
)
from app.config import get_gemini_api_key, update_gemini_api_key

router = APIRouter(prefix="/api/profile", tags=["Profile & TDEE"])

def get_or_create_profile(db: Session) -> UserProfile:
    profile = db.query(UserProfile).first()
    if not profile:
        bmr = calculate_bmr(70.0, 170.0, 30, "male")
        tdee = calculate_tdee(bmr, "sedentary")
        target_cal = calculate_target_calories(tdee, "maintenance")
        macros = calculate_macro_split(target_cal, "balanced")

        profile = UserProfile(
            weight_kg=70.0,
            height_cm=170.0,
            age=30,
            gender="male",
            activity_level="sedentary",
            goal_type="maintenance",
            macro_strategy="balanced",
            bmr=bmr,
            tdee=tdee,
            target_calories=target_cal,
            target_protein_g=macros["protein_g"],
            target_carbs_g=macros["carbs_g"],
            target_fat_g=macros["fat_g"],
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.get("", response_model=UserProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    """Retrieve the current user profile with active goals and metabolic metrics."""
    return get_or_create_profile(db)

@router.put("", response_model=UserProfileResponse)
def update_profile(data: UserProfileUpdate, db: Session = Depends(get_db)):
    """Update profile and recalculate BMR, TDEE and nutritional targets."""
    profile = get_or_create_profile(db)

    bmr = calculate_bmr(data.weight_kg, data.height_cm, data.age, data.gender)
    tdee = calculate_tdee(bmr, data.activity_level)
    target_cal = calculate_target_calories(tdee, data.goal_type)
    macros = calculate_macro_split(target_cal, data.macro_strategy)

    profile.weight_kg = data.weight_kg
    profile.height_cm = data.height_cm
    profile.age = data.age
    profile.gender = data.gender
    profile.activity_level = data.activity_level
    profile.goal_type = data.goal_type
    profile.macro_strategy = data.macro_strategy
    profile.bmr = bmr
    profile.tdee = tdee
    profile.target_calories = target_cal
    profile.target_protein_g = macros["protein_g"]
    profile.target_carbs_g = macros["carbs_g"]
    profile.target_fat_g = macros["fat_g"]
    profile.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(profile)
    return profile

@router.post("/calculate-tdee", response_model=TDEECalculateResponse)
def calculate_tdee_endpoint(data: TDEECalculateRequest):
    """
    Simulate BMR, TDEE, calorie target and macro split without committing to DB.
    """
    bmr = calculate_bmr(data.weight_kg, data.height_cm, data.age, data.gender)
    tdee = calculate_tdee(bmr, data.activity_level)
    target_cal = calculate_target_calories(tdee, data.goal_type)
    macros_data = calculate_macro_split(target_cal, data.macro_strategy)

    macro_breakdown = MacroBreakdown(**macros_data)

    return TDEECalculateResponse(
        bmr=bmr,
        tdee=tdee,
        target_calories=target_cal,
        macro_strategy=data.macro_strategy,
        goal_type=data.goal_type,
        macros=macro_breakdown,
    )

@router.post("/apply-goals", response_model=UserProfileResponse)
def apply_goals(data: TDEECalculateRequest, db: Session = Depends(get_db)):
    """Apply the calculated TDEE and macro split to the persistent user profile."""
    return update_profile(data=UserProfileUpdate(**data.model_dump()), db=db)

# --- API Key Management ---

@router.get("/config/api-key", response_model=ApiKeyStatusResponse)
def get_api_key_status():
    """Check if Gemini API key is configured."""
    key = get_gemini_api_key()
    has_key = bool(key and len(key.strip()) > 5)
    masked = ""
    if has_key:
        clean = key.strip()
        masked = f"{clean[:4]}...{clean[-4:]}" if len(clean) > 8 else "***"
    return ApiKeyStatusResponse(has_key=has_key, masked_key=masked)

@router.post("/config/api-key")
def set_api_key(data: ApiKeyUpdateRequest):
    """Set or update Gemini API key in configuration."""
    update_gemini_api_key(data.api_key)
    return {"status": "success", "message": "API Key actualizada correctamente."}
