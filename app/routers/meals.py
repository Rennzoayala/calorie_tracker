from datetime import date as dt_date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MealLog, FoodItem
from app.schemas import (
    MealLogCreate,
    MealLogUpdate,
    MealLogResponse,
    MealAnalyzeRequest,
    MealAnalysisResponse,
)
from app.llm_service import parse_meal_with_gemini

router = APIRouter(prefix="/api/meals", tags=["Meals"])

@router.post("/analyze", response_model=MealAnalysisResponse)
def analyze_meal_text(payload: MealAnalyzeRequest):
    """
    Parses natural language food descriptions using Gemini 2.5 Flash
    and returns a structured breakdown of foods, portions, and macros.
    """
    if not payload.text or len(payload.text.strip()) < 3:
        raise HTTPException(
            status_code=400,
            detail="Por favor ingresa una descripción válida de lo que comiste.",
        )
    try:
        analysis = parse_meal_with_gemini(
            text=payload.text.strip(),
            meal_type_hint=payload.meal_type_hint,
        )
        return analysis
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al analizar alimentos con IA: {str(e)}",
        )

@router.get("", response_model=List[MealLogResponse])
def get_meals_by_date(
    date: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    db: Session = Depends(get_db),
):
    """
    Get all logged meals for a specific date (default: today).
    """
    target_date = date or dt_date.today().isoformat()
    meals = (
        db.query(MealLog)
        .filter(MealLog.date == target_date)
        .order_by(MealLog.created_at.asc())
        .all()
    )
    return meals

@router.post("", response_model=MealLogResponse, status_code=201)
def create_meal(payload: MealLogCreate, db: Session = Depends(get_db)):
    """
    Save a reviewed meal and its individual food items.
    """
    # Calculate sum of macros from items
    total_cal = round(sum(item.calories for item in payload.items), 1)
    total_prot = round(sum(item.protein_g for item in payload.items), 1)
    total_carbs = round(sum(item.carbs_g for item in payload.items), 1)
    total_fat = round(sum(item.fat_g for item in payload.items), 1)

    meal = MealLog(
        date=payload.date,
        meal_type=payload.meal_type,
        meal_name=payload.meal_name,
        total_calories=total_cal,
        total_protein=total_prot,
        total_carbs=total_carbs,
        total_fat=total_fat,
        raw_input=payload.raw_input,
    )
    db.add(meal)
    db.flush()  # assign ID to meal

    for item_data in payload.items:
        item = FoodItem(
            meal_log_id=meal.id,
            name=item_data.name,
            portion_description=item_data.portion_description,
            weight_g=item_data.weight_g,
            calories=item_data.calories,
            protein_g=item_data.protein_g,
            carbs_g=item_data.carbs_g,
            fat_g=item_data.fat_g,
        )
        db.add(item)

    db.commit()
    db.refresh(meal)
    return meal

@router.get("/{meal_id}", response_model=MealLogResponse)
def get_meal(meal_id: int, db: Session = Depends(get_db)):
    """Retrieve a single meal by ID."""
    meal = db.query(MealLog).filter(MealLog.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Comida no encontrada.")
    return meal

@router.put("/{meal_id}", response_model=MealLogResponse)
def update_meal(meal_id: int, payload: MealLogUpdate, db: Session = Depends(get_db)):
    """
    Update an existing meal and completely replace/update its food items list.
    Recalculates totals and persists to database.
    """
    meal = db.query(MealLog).filter(MealLog.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Comida no encontrada.")

    # Calculate new totals
    total_cal = round(sum(item.calories for item in payload.items), 1)
    total_prot = round(sum(item.protein_g for item in payload.items), 1)
    total_carbs = round(sum(item.carbs_g for item in payload.items), 1)
    total_fat = round(sum(item.fat_g for item in payload.items), 1)

    meal.meal_type = payload.meal_type
    meal.meal_name = payload.meal_name
    meal.total_calories = total_cal
    meal.total_protein = total_prot
    meal.total_carbs = total_carbs
    meal.total_fat = total_fat
    meal.updated_at = datetime.utcnow()

    # Remove existing items (SQLAlchemy cascade / manual clear)
    db.query(FoodItem).filter(FoodItem.meal_log_id == meal.id).delete()

    # Insert updated items
    for item_data in payload.items:
        item = FoodItem(
            meal_log_id=meal.id,
            name=item_data.name,
            portion_description=item_data.portion_description,
            weight_g=item_data.weight_g,
            calories=item_data.calories,
            protein_g=item_data.protein_g,
            carbs_g=item_data.carbs_g,
            fat_g=item_data.fat_g,
        )
        db.add(item)

    db.commit()
    db.refresh(meal)
    return meal

@router.delete("/{meal_id}")
def delete_meal(meal_id: int, db: Session = Depends(get_db)):
    """
    Delete a meal log and its associated food items.
    """
    meal = db.query(MealLog).filter(MealLog.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Comida no encontrada.")

    db.delete(meal)
    db.commit()
    return {"status": "deleted", "id": meal_id, "message": "Comida eliminada correctamente."}
