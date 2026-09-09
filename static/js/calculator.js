// NutriPulse AI - TDEE & Goals Calculator Module

let simulatedTDEEResults = null;

function openCalculatorModal() {
  const modal = document.getElementById("tdeeCalculatorModal");
  if (!modal) return;

  // Pre-fill form from user profile if available
  if (window.currentUserProfile) {
    const p = window.currentUserProfile;
    document.getElementById("calcGender").value = p.gender || "male";
    document.getElementById("calcAge").value = p.age || 30;
    document.getElementById("calcWeight").value = p.weight_kg || 70;
    document.getElementById("calcHeight").value = p.height_cm || 170;
    document.getElementById("calcActivity").value = p.activity_level || "sedentary";
    document.getElementById("calcGoal").value = p.goal_type || "maintenance";
    document.getElementById("calcMacroStrategy").value = p.macro_strategy || "balanced";
  }

  modal.classList.remove("modal-hidden");
  runTDEECalculationPreview();
}

function closeCalculatorModal() {
  const modal = document.getElementById("tdeeCalculatorModal");
  if (modal) modal.classList.add("modal-hidden");
}

async function runTDEECalculationPreview() {
  const gender = document.getElementById("calcGender").value;
  const age = parseInt(document.getElementById("calcAge").value, 10) || 30;
  const weight = parseFloat(document.getElementById("calcWeight").value) || 70;
  const height = parseFloat(document.getElementById("calcHeight").value) || 170;
  const activity = document.getElementById("calcActivity").value;
  const goal = document.getElementById("calcGoal").value;
  const macroStrategy = document.getElementById("calcMacroStrategy").value;

  try {
    const res = await fetch("/api/profile/calculate-tdee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gender,
        age,
        weight_kg: weight,
        height_cm: height,
        activity_level: activity,
        goal_type: goal,
        macro_strategy: macroStrategy,
      }),
    });

    if (!res.ok) throw new Error("Error calculating TDEE");
    const data = await res.json();
    simulatedTDEEResults = data;

    renderCalculatedPreview(data);
  } catch (err) {
    console.error("Error in TDEE preview:", err);
  }
}

function renderCalculatedPreview(data) {
  const bmrEl = document.getElementById("previewBmrVal");
  const tdeeEl = document.getElementById("previewTdeeVal");
  const targetEl = document.getElementById("previewTargetVal");
  const protEl = document.getElementById("previewProtVal");
  const carbsEl = document.getElementById("previewCarbsVal");
  const fatEl = document.getElementById("previewFatVal");

  if (bmrEl) bmrEl.textContent = `${Math.round(data.bmr)} kcal`;
  if (tdeeEl) tdeeEl.textContent = `${Math.round(data.tdee)} kcal`;
  if (targetEl) targetEl.textContent = `${Math.round(data.target_calories)} kcal`;

  const m = data.macros;
  if (protEl) protEl.textContent = `${Math.round(m.protein_g)}g (${m.protein_pct}%)`;
  if (carbsEl) carbsEl.textContent = `${Math.round(m.carbs_g)}g (${m.carbs_pct}%)`;
  if (fatEl) fatEl.textContent = `${Math.round(m.fat_g)}g (${m.fat_pct}%)`;
}

async function applyCalculatedGoals() {
  if (!simulatedTDEEResults) return;

  const applyBtn = document.getElementById("applyGoalsBtn");
  try {
    if (applyBtn) {
      applyBtn.disabled = true;
      applyBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg> Aplicando...
      `;
    }

    const payload = {
      gender: document.getElementById("calcGender").value,
      age: parseInt(document.getElementById("calcAge").value, 10),
      weight_kg: parseFloat(document.getElementById("calcWeight").value),
      height_cm: parseFloat(document.getElementById("calcHeight").value),
      activity_level: document.getElementById("calcActivity").value,
      goal_type: document.getElementById("calcGoal").value,
      macro_strategy: document.getElementById("calcMacroStrategy").value,
    };

    const res = await fetch("/api/profile/apply-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Error applying goals");
    const updatedProfile = await res.json();
    window.currentUserProfile = updatedProfile;

    closeCalculatorModal();
    showToast(t("success_title"), t("calc_applied_success"), "success");

    // Refresh budget and analytics immediately
    await loadStepsAndBudget();
    loadAnalytics(currentAnalyticsDays);
  } catch (err) {
    console.error("Error applying goals:", err);
    showToast(t("error_title"), err.message, "error");
  } finally {
    if (applyBtn) {
      applyBtn.disabled = false;
      applyBtn.textContent = t("calc_apply_btn");
    }
  }
}
