from typing import Dict, Tuple

# Activity level multipliers for Mifflin-St Jeor TDEE
ACTIVITY_MULTIPLIERS: Dict[str, float] = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "very_active": 1.725,
    "extra_active": 1.9,
}

# Goal calorie adjustment multipliers
GOAL_ADJUSTMENTS: Dict[str, float] = {
    "deficit_mild": -0.15,        # -15%
    "deficit_aggressive": -0.25,  # -25%
    "maintenance": 0.0,           # 0%
    "surplus_mild": 0.10,         # +10%
    "surplus_aggressive": 0.20,   # +20%
}

# Macronutrient split strategies: (Protein %, Carbs %, Fat %)
# Must sum to 1.0 (100%)
MACRO_STRATEGIES: Dict[str, Tuple[float, float, float]] = {
    "high_protein": (0.35, 0.40, 0.25),  # 35% P / 40% C / 25% F
    "balanced": (0.30, 0.40, 0.30),      # 30% P / 40% C / 30% F
    "low_carb": (0.35, 0.20, 0.45),      # 35% P / 20% C / 45% F
    "high_carb": (0.20, 0.60, 0.20),     # 20% P / 60% C / 20% F
    "low_fat": (0.30, 0.55, 0.15),       # 30% P / 55% C / 15% F
}

def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    """
    Calculates Basal Metabolic Rate using the validated Mifflin-St Jeor formula.
    Men: BMR = 10 * weight + 6.25 * height - 5 * age + 5
    Women: BMR = 10 * weight + 6.25 * height - 5 * age - 161
    """
    base = 10.0 * weight_kg + 6.25 * height_cm - 5.0 * age
    if gender.lower() == "female":
        bmr = base - 161.0
    else:
        bmr = base + 5.0
    return round(max(500.0, bmr), 1)

def calculate_tdee(bmr: float, activity_level: str) -> float:
    """
    Calculates Total Daily Energy Expenditure based on structured physical activity.
    Steps are intentionally excluded to prevent double-counting.
    """
    multiplier = ACTIVITY_MULTIPLIERS.get(activity_level.lower(), 1.2)
    return round(bmr * multiplier, 1)

def calculate_target_calories(tdee: float, goal_type: str) -> float:
    """
    Adjusts TDEE according to nutritional goal (deficit, maintenance, surplus).
    """
    adj = GOAL_ADJUSTMENTS.get(goal_type.lower(), 0.0)
    target = tdee * (1.0 + adj)
    # Reasonable minimum safety threshold
    return round(max(1000.0, target), 1)

def calculate_macro_split(target_calories: float, strategy: str) -> Dict[str, float]:
    """
    Calculates grams and percentages for protein, carbs, and fat.
    - Protein: 4 kcal per gram
    - Carbohydrates: 4 kcal per gram
    - Fat: 9 kcal per gram
    """
    p_pct, c_pct, f_pct = MACRO_STRATEGIES.get(strategy.lower(), MACRO_STRATEGIES["balanced"])

    protein_cal = target_calories * p_pct
    carbs_cal = target_calories * c_pct
    fat_cal = target_calories * f_pct

    protein_g = round(protein_cal / 4.0, 1)
    carbs_g = round(carbs_cal / 4.0, 1)
    fat_g = round(fat_cal / 9.0, 1)

    return {
        "calories": round(target_calories, 1),
        "protein_g": protein_g,
        "carbs_g": carbs_g,
        "fat_g": fat_g,
        "protein_pct": round(p_pct * 100, 1),
        "carbs_pct": round(c_pct * 100, 1),
        "fat_pct": round(f_pct * 100, 1),
    }

def calculate_step_calories(steps: int, weight_kg: float) -> float:
    """
    Calculates energy burned by walking steps:
    calorías_pasos = (pasos_diarios / 1000.0) * peso_kg * 0.5
    """
    if steps <= 0 or weight_kg <= 0:
        return 0.0
    return round((steps / 1000.0) * weight_kg * 0.5, 1)

def calculate_dynamic_budget(
    base_target_calories: float,
    steps: int,
    weight_kg: float,
    consumed_calories: float,
) -> Dict[str, float]:
    """
    Calculates dynamic daily energy budget:
    Presupuesto Ajustado = Meta Base + Calorías Quemadas por Pasos
    Calorías Restantes = Presupuesto Ajustado - Alimentos Consumidos
    """
    step_burn = calculate_step_calories(steps, weight_kg)
    adjusted_budget = round(base_target_calories + step_burn, 1)
    remaining_calories = round(adjusted_budget - consumed_calories, 1)

    return {
        "base_target_calories": round(base_target_calories, 1),
        "steps": steps,
        "step_calories": step_burn,
        "adjusted_budget": adjusted_budget,
        "consumed_calories": round(consumed_calories, 1),
        "remaining_calories": remaining_calories,
    }
