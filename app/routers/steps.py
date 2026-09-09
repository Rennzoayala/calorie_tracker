from datetime import date as dt_date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DailyStepLog, UserProfile, MealLog
from app.schemas import StepLogCreate, StepLogResponse, DailyBudgetResponse
from app.calculator import calculate_step_calories
from app.routers.profile import get_or_create_profile

router = APIRouter(prefix="/api", tags=["Steps & Budget"])

@router.get("/steps", response_model=StepLogResponse)
def get_steps_for_date(
    date: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    db: Session = Depends(get_db),
):
    """Retrieve daily steps and burned calories for a specific date."""
    target_date = date or dt_date.today().isoformat()
    log = db.query(DailyStepLog).filter(DailyStepLog.date == target_date).first()
    if not log:
        # Return a zeroed entry without creating DB record until user saves
        return StepLogResponse(
            id=0,
            date=target_date,
            steps=0,
            calories_burned=0.0,
            updated_at=dt_date.today(),
        )
    return log

@router.post("/steps", response_model=StepLogResponse)
def record_steps(payload: StepLogCreate, db: Session = Depends(get_db)):
    """
    Log or update walked steps for a date and calculate calories burned:
    calorías_pasos = (pasos_diarios / 1000.0) * peso_kg * 0.5
    """
    profile = get_or_create_profile(db)
    weight_kg = profile.weight_kg if profile else 70.0

    calories_burned = calculate_step_calories(payload.steps, weight_kg)

    log = db.query(DailyStepLog).filter(DailyStepLog.date == payload.date).first()
    if log:
        log.steps = payload.steps
        log.calories_burned = calories_burned
    else:
        log = DailyStepLog(
            date=payload.date,
            steps=payload.steps,
            calories_burned=calories_burned,
        )
        db.add(log)

    db.commit()
    db.refresh(log)
    return log

@router.get("/budget", response_model=DailyBudgetResponse)
def get_daily_budget(
    date: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    db: Session = Depends(get_db),
):
    """
    Calculates dynamic daily energy equation:
    Presupuesto Ajustado = Meta Base + Calorías Quemadas por Pasos
    Calorías Restantes = Presupuesto Ajustado - Alimentos Consumidos
    Also returns daily macronutrient consumption vs targets.
    """
    target_date = date or dt_date.today().isoformat()
    profile = get_or_create_profile(db)

    # Base targets
    base_cal = profile.target_calories
    target_p = profile.target_protein_g
    target_c = profile.target_carbs_g
    target_f = profile.target_fat_g

    # Step log
    step_log = db.query(DailyStepLog).filter(DailyStepLog.date == target_date).first()
    steps = step_log.steps if step_log else 0
    step_burn = step_log.calories_burned if step_log else 0.0

    # Meals consumed
    meals = db.query(MealLog).filter(MealLog.date == target_date).all()
    food_cal = round(sum(m.total_calories for m in meals), 1)
    food_p = round(sum(m.total_protein for m in meals), 1)
    food_c = round(sum(m.total_carbs for m in meals), 1)
    food_f = round(sum(m.total_fat for m in meals), 1)

    # Dynamic calculation
    adjusted_budget = round(base_cal + step_burn, 1)
    remaining_cal = round(adjusted_budget - food_cal, 1)

    return DailyBudgetResponse(
        date=target_date,
        base_calories=round(base_cal, 1),
        steps=steps,
        step_calories=round(step_burn, 1),
        adjusted_budget=adjusted_budget,
        food_calories=food_cal,
        remaining_calories=remaining_cal,
        food_protein=food_p,
        target_protein=round(target_p, 1),
        food_carbs=food_c,
        target_carbs=round(target_c, 1),
        food_fat=food_f,
        target_fat=round(target_f, 1),
    )
