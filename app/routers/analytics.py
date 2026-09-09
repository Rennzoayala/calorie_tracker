from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MealLog, DailyStepLog
from app.schemas import AnalyticsResponse, DailySummaryPoint
from app.routers.profile import get_or_create_profile

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsResponse)
def get_analytics(
    days: int = Query(7, ge=1, le=90),
    end_date: str = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    db: Session = Depends(get_db),
):
    """
    Returns aggregated historical trends for 7, 14, or 30 days.
    """
    reference_date = date.fromisoformat(end_date) if end_date else date.today()
    start_date = reference_date - timedelta(days=days - 1)

    profile = get_or_create_profile(db)
    base_target = profile.target_calories if profile else 2000.0

    # Fetch meals and steps in date range
    start_str = start_date.isoformat()
    end_str = reference_date.isoformat()

    meals = (
        db.query(MealLog)
        .filter(MealLog.date >= start_str, MealLog.date <= end_str)
        .all()
    )
    step_logs = (
        db.query(DailyStepLog)
        .filter(DailyStepLog.date >= start_str, DailyStepLog.date <= end_str)
        .all()
    )

    # Index by date
    meals_by_date = {}
    for m in meals:
        if m.date not in meals_by_date:
            meals_by_date[m.date] = {"cals": 0.0, "p": 0.0, "c": 0.0, "f": 0.0}
        meals_by_date[m.date]["cals"] += m.total_calories
        meals_by_date[m.date]["p"] += m.total_protein
        meals_by_date[m.date]["c"] += m.total_carbs
        meals_by_date[m.date]["f"] += m.total_fat

    steps_by_date = {s.date: s for s in step_logs}

    points = []
    total_cals = 0.0
    total_p = 0.0
    total_c = 0.0
    total_f = 0.0
    total_steps = 0

    curr = start_date
    while curr <= reference_date:
        d_str = curr.isoformat()
        meal_info = meals_by_date.get(d_str, {"cals": 0.0, "p": 0.0, "c": 0.0, "f": 0.0})
        step_entry = steps_by_date.get(d_str)

        steps = step_entry.steps if step_entry else 0
        step_burn = step_entry.calories_burned if step_entry else 0.0
        adjusted_budget = round(base_target + step_burn, 1)

        cals = round(meal_info["cals"], 1)
        p = round(meal_info["p"], 1)
        c = round(meal_info["c"], 1)
        f = round(meal_info["f"], 1)

        points.append(
            DailySummaryPoint(
                date=d_str,
                consumed_calories=cals,
                adjusted_budget=adjusted_budget,
                target_calories=round(base_target, 1),
                steps=steps,
                step_calories=round(step_burn, 1),
                protein=p,
                carbs=c,
                fat=f,
            )
        )

        total_cals += cals
        total_p += p
        total_c += c
        total_f += f
        total_steps += steps

        curr += timedelta(days=1)

    n = len(points) or 1
    return AnalyticsResponse(
        days=days,
        points=points,
        avg_calories=round(total_cals / n, 1),
        avg_protein=round(total_p / n, 1),
        avg_carbs=round(total_c / n, 1),
        avg_fat=round(total_f / n, 1),
        avg_steps=round(total_steps / n, 1),
        total_calories=round(total_cals, 1),
        total_steps=float(total_steps),
    )
