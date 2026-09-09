// NutriPulse AI - Internationalization (i18n) Module

const translations = {
  es: {
    // Header & Navigation
    app_title: "NutriPulse AI",
    app_tagline: "Nutrición Inteligente y Presupuesto Energético",
    today: "Hoy",
    yesterday: "Ayer",
    date_label: "Fecha",
    tdee_btn: "Calculadora TDEE",
    settings_btn: "API Key",
    lang_toggle: "English 🇺🇸",

    // Energy Budget Section
    energy_budget_title: "Presupuesto Energético Dinámico",
    base_goal: "Meta Base",
    steps_burned: "Pasos Quemados",
    food_consumed: "Alimentos",
    remaining: "Restantes",
    consumed: "Consumidas",
    budget: "Presupuesto",
    over_budget: "Excedido por",
    budget_formula_desc: "Ecuación: Base + Pasos - Comida = Restante",

    // Macros Section
    protein: "Proteína",
    carbs: "Carbohidratos",
    fat: "Grasa",
    macro_goal: "Meta",

    // Steps Section
    steps_card_title: "Pasos Diarios",
    steps_input_placeholder: "Ej. 8500",
    save_steps: "Guardar Pasos",
    steps_burn_detail: "Calorías por pasos",
    step_formula_hint: "Fórmula: (Pasos / 1000) * Peso * 0.5 kcal",

    // Natural Language Food Logger
    ai_logger_title: "Registro Inteligente con Gemini 2.5 Flash",
    ai_logger_subtitle: "Escribe en lenguaje natural lo que comiste y la IA extraerá porciones y macronutrientes estructurados.",
    ai_input_placeholder: "Ej: Comí media lata de atún, 2 rebanadas de pan blanco tostado y una taza de café con leche descremada...",
    ai_analyze_btn: "Analizar con IA",
    ai_analyzing: "Analizando comida...",
    sample_btn_1: "🐟 Atún y pan tostado",
    sample_btn_2: "🍗 Pechuga, arroz y ensalada",
    sample_btn_3: "🥣 Avena, plátano y nueces",
    sample_1_text: "Comí media lata de atún en agua, 2 rebanadas de pan blanco y una taza de café sin azúcar",
    sample_2_text: "150g de pechuga de pollo a la plancha con 1 taza de arroz blanco cocido y ensalada verde con 1 cucharada de aceite de oliva",
    sample_3_text: "Un tazón de avena con 200ml de leche, 1 plátano mediano en rodajas y 20g de nueces",

    // Meals List Section
    daily_meals_title: "Comidas del Día",
    no_meals_message: "No hay comidas registradas para este día. ¡Usa el registro con IA para empezar!",
    meal_type_breakfast: "Desayuno",
    meal_type_lunch: "Almuerzo",
    meal_type_dinner: "Cena",
    meal_type_snack: "Snack / Merienda",
    edit_meal_tooltip: "Modificar comida",
    delete_meal_tooltip: "Eliminar comida",
    delete_confirm_title: "¿Eliminar comida?",
    delete_confirm_desc: "¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.",
    cancel_btn: "Cancelar",
    confirm_delete_btn: "Eliminar",

    // Meal Review & Edit Modal
    review_modal_title_create: "Revisar y Confirmar Comida",
    review_modal_title_edit: "Modificar Comida Registrada",
    meal_name_label: "Nombre de la Comida",
    meal_type_label: "Tipo de Comida",
    items_table_title: "Desglose de Alimentos",
    col_name: "Alimento",
    col_portion: "Porción",
    col_weight: "Gramos (g)",
    col_calories: "Calorías (kcal)",
    col_protein: "Prot (g)",
    col_carbs: "Carbs (g)",
    col_fat: "Grasa (g)",
    col_actions: "Acciones",
    add_item_btn: "+ Agregar Ítem",
    modal_totals_title: "Totales de la Comida",
    save_meal_btn: "Guardar Comida",
    update_meal_btn: "Guardar Cambios",

    // TDEE Calculator Modal
    calculator_modal_title: "Calculadora Metabólica TDEE y Metas",
    calc_gender_label: "Género",
    calc_gender_male: "Masculino",
    calc_gender_female: "Femenino",
    calc_age_label: "Edad (años)",
    calc_weight_label: "Peso actual (kg)",
    calc_height_label: "Altura (cm)",
    calc_activity_label: "Actividad Física Estructurada",
    act_sedentary: "Sedentario (Poco o ningún ejercicio)",
    act_light: "Ligero (Ejercicio 1-3 días/sem)",
    act_moderate: "Moderado (Ejercicio 3-5 días/sem)",
    act_very_active: "Muy Activo (Ejercicio 6-7 días/sem)",
    act_extra_active: "Extra Activo (Entrenamiento intenso diario o trabajo físico)",
    calc_goal_label: "Objetivo Nutricional",
    goal_deficit_mild: "Déficit Suave (-15%)",
    goal_deficit_aggressive: "Déficit Agresivo (-25%)",
    goal_maintenance: "Mantenimiento (0%)",
    goal_surplus_mild: "Superávit Suave (+10%)",
    goal_surplus_aggressive: "Superávit Agresivo (+20%)",
    calc_macro_strategy_label: "Estrategia de Macronutrientes",
    strat_high_protein: "Alto en Proteína (35% P / 40% C / 25% F)",
    strat_balanced: "Balanceado (30% P / 40% C / 30% F)",
    strat_low_carb: "Bajo en Carbohidratos (35% P / 20% C / 45% F)",
    strat_high_carb: "Alto en Carbohidratos (20% P / 60% C / 20% F)",
    strat_low_fat: "Bajo en Grasa (30% P / 55% C / 15% F)",
    calc_results_title: "Resultados Calculados",
    calc_bmr_label: "BMR (Mifflin-St Jeor)",
    calc_tdee_label: "TDEE Base",
    calc_target_label: "Presupuesto Objetivo",
    calc_apply_btn: "Aplicar como Mis Metas Activas",
    calc_applied_success: "¡Metas actualizadas con éxito en tu perfil!",

    // Analytics Section
    analytics_title: "Analíticas y Tendencias Históricas",
    analytics_7_days: "7 Días",
    analytics_14_days: "14 Días",
    analytics_30_days: "30 Días",
    chart_calories_title: "Calorías Consumidas vs Presupuesto Ajustado",
    chart_macros_title: "Consumo de Macronutrientes en el Tiempo",
    chart_steps_title: "Pasos y Calorías Quemadas",
    metric_avg_cals: "Promedio Calorías",
    metric_avg_steps: "Promedio Pasos",
    metric_avg_protein: "Promedio Proteína",

    // API Key Settings Modal
    settings_modal_title: "Configuración de API Key de Gemini",
    settings_modal_desc: "NutriPulse AI requiere una API Key de Google Gemini para procesar el lenguaje natural con el modelo gemini-2.5-flash. Tu clave se guardará localmente.",
    api_key_label: "Google Gemini API Key",
    api_key_placeholder: "Pega tu clave AIzaSy...",
    api_key_status_active: "Clave activa configurada:",
    api_key_status_none: "Sin clave configurada actualmente.",
    save_key_btn: "Guardar Clave",
    key_saved_success: "API Key guardada exitosamente.",
    get_key_link: "¿No tienes una clave? Consíguela gratis en Google AI Studio →",

    // Notifications & Feedback
    error_title: "Error",
    success_title: "Éxito",
    missing_key_warning: "⚠️ Se requiere una Gemini API Key para el análisis por IA. Haz clic en 'API Key' para configurarla.",
    llm_step_1: "Iniciando análisis semántico...",
    llm_step_2: "Gemini 2.5 Flash identificando alimentos y porciones...",
    llm_step_3: "Calculando desglose nutricional preciso...",
    llm_step_4: "Construyendo vista previa editable...",
  },
  en: {
    // Header & Navigation
    app_title: "NutriPulse AI",
    app_tagline: "Smart Nutrition & Dynamic Energy Budget",
    today: "Today",
    yesterday: "Yesterday",
    date_label: "Date",
    tdee_btn: "TDEE Calculator",
    settings_btn: "API Key",
    lang_toggle: "Español 🇪🇸",

    // Energy Budget Section
    energy_budget_title: "Dynamic Energy Budget",
    base_goal: "Base Goal",
    steps_burned: "Steps Burned",
    food_consumed: "Food Consumed",
    remaining: "Remaining",
    consumed: "Consumed",
    budget: "Budget",
    over_budget: "Over budget by",
    budget_formula_desc: "Equation: Base + Steps - Food = Remaining",

    // Macros Section
    protein: "Protein",
    carbs: "Carbohydrates",
    fat: "Fat",
    macro_goal: "Goal",

    // Steps Section
    steps_card_title: "Daily Steps",
    steps_input_placeholder: "e.g. 8500",
    save_steps: "Save Steps",
    steps_burn_detail: "Calories burned from steps",
    step_formula_hint: "Formula: (Steps / 1000) * Weight * 0.5 kcal",

    // Natural Language Food Logger
    ai_logger_title: "Smart Food Logger with Gemini 2.5 Flash",
    ai_logger_subtitle: "Type what you ate in plain natural language and AI will extract structured food items and macronutrients.",
    ai_input_placeholder: "e.g. I had half a can of tuna, 2 slices of toasted white bread and a cup of coffee with skim milk...",
    ai_analyze_btn: "Analyze with AI",
    ai_analyzing: "Analyzing food...",
    sample_btn_1: "🐟 Tuna & Toast",
    sample_btn_2: "🍗 Chicken, rice & salad",
    sample_btn_3: "🥣 Oatmeal, banana & nuts",
    sample_1_text: "I ate half a can of tuna in water, 2 slices of white bread and a cup of black coffee",
    sample_2_text: "150g grilled chicken breast with 1 cup of cooked white rice and a green salad with 1 tablespoon olive oil",
    sample_3_text: "A bowl of oatmeal with 200ml milk, 1 medium sliced banana and 20g walnuts",

    // Meals List Section
    daily_meals_title: "Today's Meals",
    no_meals_message: "No meals logged for this day. Use AI Food Logger above to get started!",
    meal_type_breakfast: "Breakfast",
    meal_type_lunch: "Lunch",
    meal_type_dinner: "Dinner",
    meal_type_snack: "Snack",
    edit_meal_tooltip: "Edit meal",
    delete_meal_tooltip: "Delete meal",
    delete_confirm_title: "Delete meal?",
    delete_confirm_desc: "Are you sure you want to delete this meal record? This action cannot be undone.",
    cancel_btn: "Cancel",
    confirm_delete_btn: "Delete",

    // Meal Review & Edit Modal
    review_modal_title_create: "Review & Confirm Meal",
    review_modal_title_edit: "Edit Logged Meal",
    meal_name_label: "Meal Name",
    meal_type_label: "Meal Type",
    items_table_title: "Food Items Breakdown",
    col_name: "Food Item",
    col_portion: "Portion",
    col_weight: "Weight (g)",
    col_calories: "Calories (kcal)",
    col_protein: "Prot (g)",
    col_carbs: "Carbs (g)",
    col_fat: "Fat (g)",
    col_actions: "Actions",
    add_item_btn: "+ Add Item",
    modal_totals_title: "Meal Totals",
    save_meal_btn: "Save Meal",
    update_meal_btn: "Save Changes",

    // TDEE Calculator Modal
    calculator_modal_title: "TDEE Metabolic Calculator & Goals",
    calc_gender_label: "Gender",
    calc_gender_male: "Male",
    calc_gender_female: "Female",
    calc_age_label: "Age (years)",
    calc_weight_label: "Current Weight (kg)",
    calc_height_label: "Height (cm)",
    calc_activity_label: "Structured Physical Activity",
    act_sedentary: "Sedentary (Little or no exercise)",
    act_light: "Light (Exercise 1-3 days/week)",
    act_moderate: "Moderate (Exercise 3-5 days/week)",
    act_very_active: "Very Active (Exercise 6-7 days/week)",
    act_extra_active: "Extra Active (Daily intense training or physical job)",
    calc_goal_label: "Nutritional Goal",
    goal_deficit_mild: "Mild Deficit (-15%)",
    goal_deficit_aggressive: "Aggressive Deficit (-25%)",
    goal_maintenance: "Maintenance (0%)",
    goal_surplus_mild: "Mild Surplus (+10%)",
    goal_surplus_aggressive: "Aggressive Surplus (+20%)",
    calc_macro_strategy_label: "Macronutrient Split Strategy",
    strat_high_protein: "High Protein (35% P / 40% C / 25% F)",
    strat_balanced: "Balanced (30% P / 40% C / 30% F)",
    strat_low_carb: "Low Carb (35% P / 20% C / 45% F)",
    strat_high_carb: "High Carb (20% P / 60% C / 20% F)",
    strat_low_fat: "Low Fat (30% P / 55% C / 15% F)",
    calc_results_title: "Calculated Results",
    calc_bmr_label: "BMR (Mifflin-St Jeor)",
    calc_tdee_label: "Base TDEE",
    calc_target_label: "Target Calorie Budget",
    calc_apply_btn: "Apply as My Active Goals",
    calc_applied_success: "Goals successfully updated in your profile!",

    // Analytics Section
    analytics_title: "Historical Trends & Analytics",
    analytics_7_days: "7 Days",
    analytics_14_days: "14 Days",
    analytics_30_days: "30 Days",
    chart_calories_title: "Calorie Intake vs Adjusted Budget",
    chart_macros_title: "Macronutrient Breakdown Over Time",
    chart_steps_title: "Steps & Calories Burned",
    metric_avg_cals: "Avg Calories",
    metric_avg_steps: "Avg Steps",
    metric_avg_protein: "Avg Protein",

    // API Key Settings Modal
    settings_modal_title: "Gemini API Key Settings",
    settings_modal_desc: "NutriPulse AI requires a Google Gemini API Key to process natural language meals with gemini-2.5-flash. Your key is stored locally.",
    api_key_label: "Google Gemini API Key",
    api_key_placeholder: "Paste your AIzaSy... key",
    api_key_status_active: "Active key configured:",
    api_key_status_none: "No API key configured currently.",
    save_key_btn: "Save Key",
    key_saved_success: "API Key saved successfully.",
    get_key_link: "Don't have an API key? Get one for free at Google AI Studio →",

    // Notifications & Feedback
    error_title: "Error",
    success_title: "Success",
    missing_key_warning: "⚠️ A Gemini API Key is required for AI parsing. Click 'API Key' to configure.",
    llm_step_1: "Starting semantic analysis...",
    llm_step_2: "Gemini 2.5 Flash identifying food items & portions...",
    llm_step_3: "Calculating precise nutritional breakdown...",
    llm_step_4: "Building editable preview...",
  }
};

let currentLang = localStorage.getItem("nutripulse_lang") || "es";

function t(key, fallback = "") {
  const dict = translations[currentLang] || translations.es;
  return dict[key] !== undefined ? dict[key] : (fallback || key);
}

function setLanguage(lang) {
  if (lang !== "es" && lang !== "en") lang = "es";
  currentLang = lang;
  localStorage.setItem("nutripulse_lang", currentLang);

  // Update text for all elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      el.textContent = t(key);
    }
  });

  // Update placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) {
      el.setAttribute("placeholder", t(key));
    }
  });

  // Update titles/tooltips
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (key) {
      el.setAttribute("title", t(key));
    }
  });

  // Dispatch event for components to react (charts, dynamic cards, etc.)
  window.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: currentLang } }));
}

function toggleLanguage() {
  const newLang = currentLang === "es" ? "en" : "es";
  setLanguage(newLang);
}
