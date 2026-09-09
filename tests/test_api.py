import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models import MealLog, FoodItem, DailyStepLog, UserProfile

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup after test if needed

def test_profile_endpoints():
    # 1. Get default profile
    res = client.get("/api/profile")
    assert res.status_code == 200
    data = res.json()
    assert "weight_kg" in data
    assert "target_calories" in data

    # 2. Update profile
    payload = {
        "weight_kg": 75.0,
        "height_cm": 178.0,
        "age": 28,
        "gender": "male",
        "activity_level": "moderate",
        "goal_type": "deficit_mild",
        "macro_strategy": "high_protein"
    }
    res = client.put("/api/profile", json=payload)
    assert res.status_code == 200
    updated = res.json()
    assert updated["weight_kg"] == 75.0
    assert updated["goal_type"] == "deficit_mild"
    assert updated["macro_strategy"] == "high_protein"
    assert updated["target_protein_g"] > 0

def test_tdee_calculation_and_apply():
    payload = {
        "weight_kg": 80.0,
        "height_cm": 180.0,
        "age": 30,
        "gender": "male",
        "activity_level": "very_active",
        "goal_type": "maintenance",
        "macro_strategy": "balanced"
    }
    # Calculate simulation
    res = client.post("/api/profile/calculate-tdee", json=payload)
    assert res.status_code == 200
    calc = res.json()
    assert calc["bmr"] > 1700
    assert calc["tdee"] > 2500
    assert calc["macros"]["protein_pct"] == 30.0

    # Apply goals
    res2 = client.post("/api/profile/apply-goals", json=payload)
    assert res2.status_code == 200
    profile = res2.json()
    assert profile["weight_kg"] == 80.0
    assert profile["macro_strategy"] == "balanced"

def test_meals_crud_workflow():
    test_date = "2026-09-05"

    # 1. Create a meal
    meal_payload = {
        "date": test_date,
        "meal_type": "breakfast",
        "meal_name": "Desayuno Proteico",
        "items": [
            {
                "name": "Huevos revueltos",
                "portion_description": "2 piezas",
                "weight_g": 120.0,
                "calories": 180.0,
                "protein_g": 14.0,
                "carbs_g": 1.5,
                "fat_g": 12.0
            },
            {
                "name": "Pan integral",
                "portion_description": "2 rebanadas",
                "weight_g": 60.0,
                "calories": 140.0,
                "protein_g": 6.0,
                "carbs_g": 26.0,
                "fat_g": 2.0
            }
        ]
    }
    create_res = client.post("/api/meals", json=meal_payload)
    assert create_res.status_code == 201
    meal_data = create_res.json()
    meal_id = meal_data["id"]
    assert meal_data["total_calories"] == 320.0
    assert meal_data["total_protein"] == 20.0
    assert len(meal_data["items"]) == 2

    # 2. Get meals for date
    get_res = client.get(f"/api/meals?date={test_date}")
    assert get_res.status_code == 200
    meals_list = get_res.json()
    assert any(m["id"] == meal_id for m in meals_list)

    # 3. Update meal via PUT
    update_payload = {
        "meal_type": "breakfast",
        "meal_name": "Desayuno Proteico Modificado",
        "items": [
            {
                "name": "Huevos revueltos con jamón",
                "portion_description": "2 piezas + 30g jamón",
                "weight_g": 150.0,
                "calories": 230.0,
                "protein_g": 20.0,
                "carbs_g": 2.0,
                "fat_g": 15.0
            },
            {
                "name": "Pan integral",
                "portion_description": "1 rebanada",
                "weight_g": 30.0,
                "calories": 70.0,
                "protein_g": 3.0,
                "carbs_g": 13.0,
                "fat_g": 1.0
            }
        ]
    }
    put_res = client.put(f"/api/meals/{meal_id}", json=update_payload)
    assert put_res.status_code == 200
    updated_meal = put_res.json()
    assert updated_meal["meal_name"] == "Desayuno Proteico Modificado"
    assert updated_meal["total_calories"] == 300.0
    assert updated_meal["total_protein"] == 23.0

    # 4. Delete meal
    del_res = client.delete(f"/api/meals/{meal_id}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"

    # Confirm deletion
    get_after_del = client.get(f"/api/meals/{meal_id}")
    assert get_after_del.status_code == 404

def test_steps_and_dynamic_budget():
    test_date = "2026-09-06"

    # 1. Log steps: 10,000 steps
    step_payload = {"date": test_date, "steps": 10000}
    step_res = client.post("/api/steps", json=step_payload)
    assert step_res.status_code == 200
    step_data = step_res.json()
    assert step_data["steps"] == 10000
    assert step_data["calories_burned"] > 0

    # 2. Add a meal on that day
    client.post("/api/meals", json={
        "date": test_date,
        "meal_type": "lunch",
        "meal_name": "Almuerzo",
        "items": [
            {
                "name": "Pollo con ensalada",
                "portion_description": "1 plato",
                "weight_g": 250.0,
                "calories": 450.0,
                "protein_g": 40.0,
                "carbs_g": 10.0,
                "fat_g": 12.0
            }
        ]
    })

    # 3. Check dynamic energy budget: Base + Steps - Food = Remaining
    budget_res = client.get(f"/api/budget?date={test_date}")
    assert budget_res.status_code == 200
    budget = budget_res.json()

    expected_adjusted = round(budget["base_calories"] + budget["step_calories"], 1)
    expected_remaining = round(expected_adjusted - budget["food_calories"], 1)

    assert budget["adjusted_budget"] == expected_adjusted
    assert budget["remaining_calories"] == expected_remaining
    assert budget["food_calories"] == 450.0

def test_analytics_endpoint():
    res = client.get("/api/analytics?days=7")
    assert res.status_code == 200
    data = res.json()
    assert data["days"] == 7
    assert len(data["points"]) == 7
    assert "avg_calories" in data
    assert "avg_steps" in data
