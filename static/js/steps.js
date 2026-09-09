// NutriPulse AI - Daily Steps & Energy Budget Module

async function loadStepsAndBudget() {
  try {
    const [stepsRes, budgetRes] = await Promise.all([
      fetch(`/api/steps?date=${currentDate}`),
      fetch(`/api/budget?date=${currentDate}`),
    ]);

    if (!stepsRes.ok || !budgetRes.ok) {
      throw new Error("Error fetching steps or budget");
    }

    const stepsData = await stepsRes.json();
    const budgetData = await budgetRes.json();

    window.latestBudgetData = budgetData;

    renderStepsData(stepsData);
    renderBudgetData(budgetData);
  } catch (err) {
    console.error("Error loading steps and budget:", err);
  }
}

function renderStepsData(stepsData) {
  const stepsInput = document.getElementById("stepsInput");
  const stepsBurnVal = document.getElementById("stepsBurnVal");

  if (stepsInput) {
    stepsInput.value = stepsData.steps || "";
  }
  if (stepsBurnVal) {
    stepsBurnVal.textContent = `+${Math.round(stepsData.calories_burned || 0)} kcal`;
  }
}

function renderBudgetData(data) {
  // Equation Card Elements: Base + Steps - Food = Remaining
  const eqBaseEl = document.getElementById("eqBaseVal");
  const eqStepsEl = document.getElementById("eqStepsVal");
  const eqFoodEl = document.getElementById("eqFoodVal");
  const eqRemainingEl = document.getElementById("eqRemainingVal");

  if (eqBaseEl) eqBaseEl.textContent = `${Math.round(data.base_calories)} kcal`;
  if (eqStepsEl) eqStepsEl.textContent = `+${Math.round(data.step_calories)} kcal`;
  if (eqFoodEl) eqFoodEl.textContent = `-${Math.round(data.food_calories)} kcal`;

  if (eqRemainingEl) {
    const rem = Math.round(data.remaining_calories);
    eqRemainingEl.textContent = `${rem >= 0 ? rem : rem} kcal`;
    if (rem < 0) {
      eqRemainingEl.className = "text-xl font-bold text-rose-400";
    } else {
      eqRemainingEl.className = "text-xl font-bold text-emerald-400";
    }
  }

  // Update central Donut Gauge
  updateCalorieDonut(data.food_calories, data.adjusted_budget);

  // Update Macronutrient Bars
  renderMacroBar("protein", data.food_protein, data.target_protein);
  renderMacroBar("carbs", data.food_carbs, data.target_carbs);
  renderMacroBar("fat", data.food_fat, data.target_fat);
}

function renderMacroBar(type, current, target) {
  const currentEl = document.getElementById(`macro_${type}_current`);
  const targetEl = document.getElementById(`macro_${type}_target`);
  const pctEl = document.getElementById(`macro_${type}_pct`);
  const barEl = document.getElementById(`macro_${type}_bar`);

  if (!currentEl || !targetEl || !pctEl || !barEl) return;

  const pct = target > 0 ? Math.round((current / target) * 100) : 0;

  currentEl.textContent = `${Math.round(current)}g`;
  targetEl.textContent = `/ ${Math.round(target)}g`;
  pctEl.textContent = `${pct}%`;

  barEl.style.width = `${Math.min(100, pct)}%`;

  if (pct > 105) {
    barEl.classList.remove("bg-emerald-500", "bg-cyan-500", "bg-amber-500", "bg-blue-500");
    barEl.classList.add("bg-rose-500");
  } else {
    barEl.classList.remove("bg-rose-500");
    if (type === "protein") barEl.classList.add("bg-blue-500");
    else if (type === "carbs") barEl.classList.add("bg-cyan-500");
    else if (type === "fat") barEl.classList.add("bg-amber-500");
  }
}

async function handleSaveSteps() {
  const stepsInput = document.getElementById("stepsInput");
  if (!stepsInput) return;

  const stepsVal = parseInt(stepsInput.value, 10) || 0;
  const saveBtn = document.getElementById("saveStepsBtn");

  try {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg> Guardando...
      `;
    }

    const res = await fetch("/api/steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: currentDate,
        steps: stepsVal,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error saving steps");
    }

    // Refresh budget and analytics
    await loadStepsAndBudget();
    loadAnalytics(currentAnalyticsDays);

    showToast(t("success_title"), "Pasos actualizados con éxito", "success");
  } catch (err) {
    console.error("Error saving steps:", err);
    showToast(t("error_title"), err.message, "error");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = t("save_steps");
    }
  }
}
