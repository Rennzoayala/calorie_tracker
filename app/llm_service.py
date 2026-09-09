import json
import logging
from typing import Optional
from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.config import get_gemini_api_key
from app.schemas import MealAnalysisResponse, FoodItemExtracted

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert clinical dietitian and food nutrition analyzer.
Your task is to analyze natural language descriptions of meals (written in Spanish, English, or mixed) and extract structured nutritional data.

Guidelines:
1. Break down composite meals into individual distinct food items (e.g., if the user says "sandwich de pollo con mayonesa y lechuga", identify bread slices, grilled chicken breast, mayonnaise, lettuce).
2. For each food item, provide:
   - name: clear food name (in the user's primary language, e.g. Spanish or English).
   - portion_description: readable portion string (e.g. 'Media lata (80g)', '2 rebanadas (60g)', '1 taza (240ml)').
   - weight_g: realistic estimated net weight in grams.
   - calories: estimated kilocalories.
   - protein_g: protein in grams (rounded to 1 decimal).
   - carbs_g: total carbohydrates in grams (rounded to 1 decimal).
   - fat_g: total dietary fats in grams (rounded to 1 decimal).
3. Infer the meal type: 'breakfast', 'lunch', 'dinner', or 'snack' based on context, food types, or hints.
4. Set a concise, descriptive meal_name (e.g., 'Almuerzo de pollo y arroz', 'Tostadas con aguacate y huevo').
5. Calculate the exact totals: total_calories, total_protein, total_carbs, total_fat as the sum of all individual items.
6. Always return accurate, realistic nutritional values following USDA / FAO standard food databases.
"""

def parse_meal_with_gemini(text: str, meal_type_hint: Optional[str] = None) -> MealAnalysisResponse:
    """
    Calls Gemini 2.5 Flash using the google-genai SDK with Pydantic structured output.
    """
    api_key = get_gemini_api_key()
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY no está configurada. Por favor, ingresa tu API Key en la barra superior o en el archivo .env."
        )

    client = genai.Client(api_key=api_key)

    user_prompt = f"User meal description: \"{text}\""
    if meal_type_hint:
        user_prompt += f"\nHint for meal type: {meal_type_hint}"

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=MealAnalysisResponse,
                temperature=0.2,
            ),
        )

        if not response.text:
            raise ValueError("El modelo no devolvió texto de respuesta.")

        data = json.loads(response.text)
        analysis = MealAnalysisResponse(**data)
        
        # Verify and re-sum totals for precision
        sum_cals = round(sum(item.calories for item in analysis.items), 1)
        sum_prot = round(sum(item.protein_g for item in analysis.items), 1)
        sum_carbs = round(sum(item.carbs_g for item in analysis.items), 1)
        sum_fat = round(sum(item.fat_g for item in analysis.items), 1)
        
        analysis.total_calories = sum_cals
        analysis.total_protein = sum_prot
        analysis.total_carbs = sum_carbs
        analysis.total_fat = sum_fat

        return analysis

    except APIError as e:
        logger.error(f"Gemini API Error: {e}")
        raise ValueError(f"Error en Gemini API: {str(e)}")
    except Exception as e:
        logger.error(f"Error processing meal with LLM: {e}")
        raise ValueError(f"Error al procesar la comida con IA: {str(e)}")
