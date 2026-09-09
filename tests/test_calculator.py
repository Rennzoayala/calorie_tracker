import pytest
from app.calculator import (
    calculate_bmr,
    calculate_tdee,
    calculate_target_calories,
    calculate_macro_split,
    calculate_step_calories,
    calculate_dynamic_budget,
)

def test_mifflin_st_jeor_bmr_men():
    # Men: 10 * weight (70) + 6.25 * height (175) - 5 * age (25) + 5
    # = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1673.8
    bmr = calculate_bmr(70.0, 175.0, 25, "male")
    assert bmr == 1673.8

def test_mifflin_st_jeor_bmr_women():
    # Women: 10 * weight (60) + 6.25 * height (165) - 5 * age (30) - 161
    # = 600 + 1031.25 - 150 - 161 = 1320.25 -> 1320.2
    bmr = calculate_bmr(60.0, 165.0, 30, "female")
    assert bmr == 1320.2

def test_tdee_calculation():
    bmr = 1600.0
    # Sedentary 1.2
    assert calculate_tdee(bmr, "sedentary") == 1920.0
    # Light 1.375
    assert calculate_tdee(bmr, "light") == 2200.0
    # Moderate 1.55
    assert calculate_tdee(bmr, "moderate") == 2480.0
    # Very active 1.725
    assert calculate_tdee(bmr, "very_active") == 2760.0
    # Extra active 1.9
    assert calculate_tdee(bmr, "extra_active") == 3040.0

def test_target_calories_adjustments():
    tdee = 2000.0
    assert calculate_target_calories(tdee, "maintenance") == 2000.0
    assert calculate_target_calories(tdee, "deficit_mild") == 1700.0       # -15%
    assert calculate_target_calories(tdee, "deficit_aggressive") == 1500.0 # -25%
    assert calculate_target_calories(tdee, "surplus_mild") == 2200.0      # +10%
    assert calculate_target_calories(tdee, "surplus_aggressive") == 2400.0# +20%

def test_macro_strategies():
    cal = 2000.0

    # High Protein (35% P, 40% C, 25% F)
    # P: 700 / 4 = 175g, C: 800 / 4 = 200g, F: 500 / 9 = 55.6g
    hp = calculate_macro_split(cal, "high_protein")
    assert hp["protein_g"] == 175.0
    assert hp["carbs_g"] == 200.0
    assert hp["fat_g"] == 55.6

    # Balanced (30% P, 40% C, 30% F)
    # P: 600 / 4 = 150g, C: 800 / 4 = 200g, F: 600 / 9 = 66.7g
    bal = calculate_macro_split(cal, "balanced")
    assert bal["protein_g"] == 150.0
    assert bal["carbs_g"] == 200.0
    assert bal["fat_g"] == 66.7

    # Low Carb (35% P, 20% C, 45% F)
    # P: 700 / 4 = 175g, C: 400 / 4 = 100g, F: 900 / 9 = 100.0g
    lc = calculate_macro_split(cal, "low_carb")
    assert lc["protein_g"] == 175.0
    assert lc["carbs_g"] == 100.0
    assert lc["fat_g"] == 100.0

    # High Carb (20% P, 60% C, 20% F)
    # P: 400 / 4 = 100g, C: 1200 / 4 = 300g, F: 400 / 9 = 44.4g
    hc = calculate_macro_split(cal, "high_carb")
    assert hc["protein_g"] == 100.0
    assert hc["carbs_g"] == 300.0
    assert hc["fat_g"] == 44.4

    # Low Fat (30% P, 55% C, 15% F)
    # P: 600 / 4 = 150g, C: 1100 / 4 = 275g, F: 300 / 9 = 33.3g
    lf = calculate_macro_split(cal, "low_fat")
    assert lf["protein_g"] == 150.0
    assert lf["carbs_g"] == 275.0
    assert lf["fat_g"] == 33.3

def test_step_calories_formula():
    # Fórmula: calorías_pasos = (pasos_diarios / 1000.0) * peso_kg * 0.5
    # 10,000 steps, 70 kg -> 10 * 70 * 0.5 = 350.0 kcal
    assert calculate_step_calories(10000, 70.0) == 350.0
    # 5,000 steps, 80 kg -> 5 * 80 * 0.5 = 200.0 kcal
    assert calculate_step_calories(5000, 80.0) == 200.0
    # 0 steps
    assert calculate_step_calories(0, 70.0) == 0.0

def test_dynamic_budget():
    # Base: 2000 kcal, Steps: 10,000 (350 kcal burn), Consumed: 1500 kcal
    # Adjusted Budget = 2000 + 350 = 2350
    # Remaining = 2350 - 1500 = 850
    res = calculate_dynamic_budget(
        base_target_calories=2000.0,
        steps=10000,
        weight_kg=70.0,
        consumed_calories=1500.0,
    )
    assert res["step_calories"] == 350.0
    assert res["adjusted_budget"] == 2350.0
    assert res["remaining_calories"] == 850.0
