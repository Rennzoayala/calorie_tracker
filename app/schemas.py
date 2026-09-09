from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

# --- User Profile & TDEE Schemas ---

class UserProfileBase(BaseModel):
    weight_kg: float = Field(..., ge=20.0, le=400.0, description="Weight in kilograms")
    height_cm: float = Field(..., ge=50.0, le=280.0, description="Height in centimeters")
    age: int = Field(..., ge=10, le=120, description="Age in years")
    gender: str = Field("male", description="'male' or 'female'")
    activity_level: str = Field("sedentary", description="sedentary, light, moderate, very_active, extra_active")
    goal_type: str = Field("maintenance", description="deficit_mild, deficit_aggressive, maintenance, surplus_mild, surplus_aggressive")
    macro_strategy: str = Field("balanced", description="high_protein, balanced, low_carb, high_carb, low_fat")

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    id: int
    bmr: float
    tdee: float
    target_calories: float
    target_protein_g: float
    target_carbs_g: float
    target_fat_g: float
    updated_at: datetime

    class Config:
        from_attributes = True

class TDEECalculateRequest(UserProfileBase):
    pass

class MacroBreakdown(BaseModel):
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    protein_pct: float
    carbs_pct: float
    fat_pct: float

class TDEECalculateResponse(BaseModel):
    bmr: float
    tdee: float
    target_calories: float
    macro_strategy: str
    goal_type: str
    macros: MacroBreakdown

# --- Food Items & Meals Schemas ---

class FoodItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    portion_description: str = Field("", max_length=100)
    weight_g: float = Field(100.0, ge=0.0)
    calories: float = Field(0.0, ge=0.0)
    protein_g: float = Field(0.0, ge=0.0)
    carbs_g: float = Field(0.0, ge=0.0)
    fat_g: float = Field(0.0, ge=0.0)

class FoodItemCreate(FoodItemBase):
    pass

class FoodItemResponse(FoodItemBase):
    id: int
    meal_log_id: int

    class Config:
        from_attributes = True

class MealLogCreate(BaseModel):
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    meal_type: str = Field("lunch", description="breakfast, lunch, dinner, snack")
    meal_name: str = Field("Comida", min_length=1, max_length=100)
    items: List[FoodItemCreate] = Field(default_factory=list)
    raw_input: Optional[str] = None

class MealLogUpdate(BaseModel):
    meal_type: str = Field("lunch")
    meal_name: str = Field("Comida")
    items: List[FoodItemCreate] = Field(default_factory=list)

class MealLogResponse(BaseModel):
    id: int
    date: str
    meal_type: str
    meal_name: str
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    raw_input: Optional[str] = None
    items: List[FoodItemResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Gemini Structured Extraction Schemas ---

class FoodItemExtracted(BaseModel):
    name: str = Field(..., description="Food item name in Spanish or English according to input")
    portion_description: str = Field(..., description="Estimated portion description, e.g., '1 taza (240ml)', '2 rebanadas'")
    weight_g: float = Field(..., description="Estimated net weight in grams")
    calories: float = Field(..., description="Estimated calories in kcal")
    protein_g: float = Field(..., description="Estimated protein in grams")
    carbs_g: float = Field(..., description="Estimated carbohydrates in grams")
    fat_g: float = Field(..., description="Estimated fat in grams")

class MealAnalysisResponse(BaseModel):
    meal_name: str = Field(..., description="Short descriptive name for the meal, e.g. 'Desayuno con atún y pan'")
    meal_type: str = Field(..., description="Inferred meal type: breakfast, lunch, dinner, or snack")
    items: List[FoodItemExtracted] = Field(..., description="List of recognized food items")
    total_calories: float = Field(..., description="Sum of calories for all items")
    total_protein: float = Field(..., description="Sum of protein in grams")
    total_carbs: float = Field(..., description="Sum of carbs in grams")
    total_fat: float = Field(..., description="Sum of fat in grams")

class MealAnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=3, description="Natural language description of foods eaten")
    meal_type_hint: Optional[str] = None

# --- Steps & Dynamic Budget Schemas ---

class StepLogCreate(BaseModel):
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    steps: int = Field(..., ge=0, le=100000)

class StepLogResponse(BaseModel):
    id: int
    date: str
    steps: int
    calories_burned: float
    updated_at: datetime

    class Config:
        from_attributes = True

class DailyBudgetResponse(BaseModel):
    date: str
    base_calories: float
    steps: int
    step_calories: float
    adjusted_budget: float
    food_calories: float
    remaining_calories: float
    # Macronutrient tracking for the day
    food_protein: float
    target_protein: float
    food_carbs: float
    target_carbs: float
    food_fat: float
    target_fat: float

# --- Analytics Schemas ---

class DailySummaryPoint(BaseModel):
    date: str
    consumed_calories: float
    adjusted_budget: float
    target_calories: float
    steps: int
    step_calories: float
    protein: float
    carbs: float
    fat: float

class AnalyticsResponse(BaseModel):
    days: int
    points: List[DailySummaryPoint]
    avg_calories: float
    avg_protein: float
    avg_carbs: float
    avg_fat: float
    avg_steps: float
    total_calories: float
    total_steps: float

# --- API Key Management Schemas ---

class ApiKeyUpdateRequest(BaseModel):
    api_key: str = Field(..., min_length=10)

class ApiKeyStatusResponse(BaseModel):
    has_key: bool
    masked_key: str
