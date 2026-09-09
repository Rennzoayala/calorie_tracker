from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    weight_kg = Column(Float, default=70.0, nullable=False)
    height_cm = Column(Float, default=170.0, nullable=False)
    age = Column(Integer, default=30, nullable=False)
    gender = Column(String(10), default="male", nullable=False)  # "male" | "female"
    activity_level = Column(String(20), default="sedentary", nullable=False)
    goal_type = Column(String(25), default="maintenance", nullable=False)
    macro_strategy = Column(String(25), default="balanced", nullable=False)

    # Calculated metabolic metrics
    bmr = Column(Float, default=1650.0, nullable=False)
    tdee = Column(Float, default=1980.0, nullable=False)
    target_calories = Column(Float, default=1980.0, nullable=False)
    target_protein_g = Column(Float, default=148.5, nullable=False)
    target_carbs_g = Column(Float, default=198.0, nullable=False)
    target_fat_g = Column(Float, default=66.0, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class MealLog(Base):
    __tablename__ = "meal_logs"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), index=True, nullable=False)  # YYYY-MM-DD
    meal_type = Column(String(20), default="lunch", nullable=False)  # breakfast, lunch, dinner, snack
    meal_name = Column(String(100), default="Comida", nullable=False)
    total_calories = Column(Float, default=0.0, nullable=False)
    total_protein = Column(Float, default=0.0, nullable=False)
    total_carbs = Column(Float, default=0.0, nullable=False)
    total_fat = Column(Float, default=0.0, nullable=False)
    raw_input = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # One-to-many relationship with FoodItem, cascading delete
    items = relationship(
        "FoodItem",
        back_populates="meal_log",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    meal_log_id = Column(
        Integer,
        ForeignKey("meal_logs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(150), nullable=False)
    portion_description = Column(String(100), default="", nullable=False)
    weight_g = Column(Float, default=100.0, nullable=False)
    calories = Column(Float, default=0.0, nullable=False)
    protein_g = Column(Float, default=0.0, nullable=False)
    carbs_g = Column(Float, default=0.0, nullable=False)
    fat_g = Column(Float, default=0.0, nullable=False)

    meal_log = relationship("MealLog", back_populates="items")


class DailyStepLog(Base):
    __tablename__ = "daily_step_logs"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), unique=True, index=True, nullable=False)  # YYYY-MM-DD
    steps = Column(Integer, default=0, nullable=False)
    calories_burned = Column(Float, default=0.0, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
