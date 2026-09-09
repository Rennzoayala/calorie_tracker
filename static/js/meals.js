// NutriPulse AI - Meals Management & Gemini Food Logging Module

let currentEditingMealId = null;
let currentReviewItems = [];
let progressInterval = null;

/**
 * Handles LLM Natural Language Meal Analysis with animated progress bar.
 */
async function handleAnalyzeMeal() {
  const inputEl = document.getElementById("aiMealInput");
  if (!inputEl) return;

  const text = inputEl.value.trim();
  if (!text || text.length < 3) {
    showToast(t("error_title"), "Por favor describe lo que comiste.", "error");
    return;
  }

  const analyzeBtn = document.getElementById("aiAnalyzeBtn");
  const progressContainer = document.getElementById("aiProgressContainer");
  const progressBar = document.getElementById("aiProgressBar");
  const progressStatus = document.getElementById("aiProgressStatus");

  // Show progress container
  progressContainer.classList.remove("hidden");
  analyzeBtn.disabled = true;

  // Animated multi-step progress simulation while awaiting LLM
  let progress = 10;
  progressBar.style.width = "10%";
  progressStatus.textContent = t("llm_step_1");

  const steps = [
    { at: 35, msg: t("llm_step_2") },
    { at: 65, msg: t("llm_step_3") },
    { at: 85, msg: t("llm_step_4") },
  ];

  let stepIdx = 0;
  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    if (stepIdx < steps.length) {
      if (progress < steps[stepIdx].at) {
        progress += 4;
        progressBar.style.width = `${progress}%`;
      } else {
        progressStatus.textContent = steps[stepIdx].msg;
        stepIdx++;
      }
    } else if (progress < 92) {
      progress += 1;
      progressBar.style.width = `${progress}%`;
    }
  }, 180);

  try {
    const res = await fetch("/api/meals/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    clearInterval(progressInterval);

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error al analizar comida con IA");
    }

    const data = await res.json();

    // 100% complete
    progressBar.style.width = "100%";
    progressStatus.textContent = "¡Análisis completado!";

    setTimeout(() => {
      progressContainer.classList.add("hidden");
      analyzeBtn.disabled = false;
      progressBar.style.width = "0%";

      // Open review modal in CREATE mode
      openMealReviewModal(data, false);
    }, 400);

  } catch (err) {
    clearInterval(progressInterval);
    progressContainer.classList.add("hidden");
    analyzeBtn.disabled = false;
    progressBar.style.width = "0%";

    console.error("Error analyzing meal:", err);
    if (err.message && err.message.includes("GEMINI_API_KEY")) {
      openApiKeyModal();
    }
    showToast(t("error_title"), err.message, "error");
  }
}

/**
 * Opens Review Modal either for new AI extraction or existing meal modification.
 */
function openMealReviewModal(data, isEdit = false, mealId = null) {
  const modal = document.getElementById("mealReviewModal");
  if (!modal) return;

  currentEditingMealId = isEdit ? mealId : null;

  const modalTitle = document.getElementById("mealReviewModalTitle");
  const saveBtn = document.getElementById("saveReviewedMealBtn");

  if (modalTitle) {
    modalTitle.textContent = isEdit ? t("review_modal_title_edit") : t("review_modal_title_create");
  }
  if (saveBtn) {
    saveBtn.textContent = isEdit ? t("update_meal_btn") : t("save_meal_btn");
  }

  // Pre-fill general meal info
  document.getElementById("reviewMealName").value = data.meal_name || "Comida";
  document.getElementById("reviewMealType").value = data.meal_type || "lunch";

  // Deep copy items array
  currentReviewItems = (data.items || []).map((item) => ({
    name: item.name || "",
    portion_description: item.portion_description || "",
    weight_g: item.weight_g || 100,
    calories: item.calories || 0,
    protein_g: item.protein_g || 0,
    carbs_g: item.carbs_g || 0,
    fat_g: item.fat_g || 0,
  }));

  renderReviewItemsTable();
  modal.classList.remove("modal-hidden");
}

function closeMealReviewModal() {
  const modal = document.getElementById("mealReviewModal");
  if (modal) modal.classList.add("modal-hidden");
  currentEditingMealId = null;
  currentReviewItems = [];
}

/**
 * Renders the table of editable items inside the review modal.
 */
function renderReviewItemsTable() {
  const tbody = document.getElementById("reviewItemsTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  currentReviewItems.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.className = "border-b border-slate-700/60 hover:bg-slate-800/40 text-sm";

    tr.innerHTML = `
      <td class="py-2 px-3">
        <input type="text" value="${item.name}" data-idx="${index}" data-field="name"
          class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs focus:border-emerald-500 focus:outline-none" />
      </td>
      <td class="py-2 px-3">
        <input type="text" value="${item.portion_description}" data-idx="${index}" data-field="portion_description"
          class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 text-xs focus:border-emerald-500 focus:outline-none" />
      </td>
      <td class="py-2 px-2 w-20">
        <input type="number" step="1" min="0" value="${item.weight_g}" data-idx="${index}" data-field="weight_g"
          class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-slate-200 text-xs focus:border-emerald-500 focus:outline-none" />
      </td>
      <td class="py-2 px-2 w-20">
        <input type="number" step="0.5" min="0" value="${item.calories}" data-idx="${index}" data-field="calories"
          class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-emerald-400 font-semibold text-xs focus:border-emerald-500 focus:outline-none" />
      </td>
      <td class="py-2 px-2 w-16">
        <input type="number" step="0.1" min="0" value="${item.protein_g}" data-idx="${index}" data-field="protein_g"
          class="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-right text-blue-400 text-xs focus:border-emerald-500 focus:outline-none" />
      </td>
      <td class="py-2 px-2 w-16">
        <input type="number" step="0.1" min="0" value="${item.carbs_g}" data-idx="${index}" data-field="carbs_g"
          class="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-right text-cyan-400 text-xs focus:border-emerald-500 focus:outline-none" />
      </td>
      <td class="py-2 px-2 w-16">
        <input type="number" step="0.1" min="0" value="${item.fat_g}" data-idx="${index}" data-field="fat_g"
          class="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-right text-amber-400 text-xs focus:border-emerald-500 focus:outline-none" />
      </td>
      <td class="py-2 px-2 text-center w-12">
        <button type="button" onclick="handleRemoveReviewItem(${index})"
          class="p-1 text-slate-400 hover:text-rose-400 rounded transition" title="Eliminar ítem">
          <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach event listeners for real-time recalculation
  tbody.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const idx = parseInt(e.target.getAttribute("data-idx"), 10);
      const field = e.target.getAttribute("data-field");
      if (idx !== undefined && currentReviewItems[idx]) {
        if (field === "name" || field === "portion_description") {
          currentReviewItems[idx][field] = e.target.value;
        } else {
          currentReviewItems[idx][field] = parseFloat(e.target.value) || 0;
        }
        recalculateModalTotals();
      }
    });
  });

  recalculateModalTotals();
}

/**
 * Appends a new empty item row manually.
 */
function handleAddReviewItem() {
  currentReviewItems.push({
    name: "Nuevo alimento",
    portion_description: "1 porción (100g)",
    weight_g: 100,
    calories: 100,
    protein_g: 5,
    carbs_g: 10,
    fat_g: 2,
  });
  renderReviewItemsTable();
}

/**
 * Removes an item from the review list.
 */
function handleRemoveReviewItem(index) {
  if (currentReviewItems.length <= 1) {
    showToast(t("error_title"), "La comida debe contener al menos 1 alimento.", "error");
    return;
  }
  currentReviewItems.splice(index, 1);
  renderReviewItemsTable();
}

/**
 * Recalculates and updates totals shown at bottom of modal.
 */
function recalculateModalTotals() {
  const sumCal = currentReviewItems.reduce((acc, i) => acc + (parseFloat(i.calories) || 0), 0);
  const sumProt = currentReviewItems.reduce((acc, i) => acc + (parseFloat(i.protein_g) || 0), 0);
  const sumCarbs = currentReviewItems.reduce((acc, i) => acc + (parseFloat(i.carbs_g) || 0), 0);
  const sumFat = currentReviewItems.reduce((acc, i) => acc + (parseFloat(i.fat_g) || 0), 0);

  const calEl = document.getElementById("reviewTotalCalories");
  const protEl = document.getElementById("reviewTotalProtein");
  const carbsEl = document.getElementById("reviewTotalCarbs");
  const fatEl = document.getElementById("reviewTotalFat");

  if (calEl) calEl.textContent = `${Math.round(sumCal)} kcal`;
  if (protEl) protEl.textContent = `${sumProt.toFixed(1)}g`;
  if (carbsEl) carbsEl.textContent = `${sumCarbs.toFixed(1)}g`;
  if (fatEl) fatEl.textContent = `${sumFat.toFixed(1)}g`;
}

/**
 * Saves reviewed meal (POST for create, PUT for update).
 */
async function handleSaveReviewedMeal() {
  const mealName = document.getElementById("reviewMealName").value.trim() || "Comida";
  const mealType = document.getElementById("reviewMealType").value || "lunch";

  if (!currentReviewItems.length) {
    showToast(t("error_title"), "Agrega al menos un alimento.", "error");
    return;
  }

  const saveBtn = document.getElementById("saveReviewedMealBtn");
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

    let url = "/api/meals";
    let method = "POST";

    const payload = {
      meal_type: mealType,
      meal_name: mealName,
      items: currentReviewItems,
    };

    if (currentEditingMealId) {
      url = `/api/meals/${currentEditingMealId}`;
      method = "PUT";
    } else {
      payload.date = currentDate;
      payload.raw_input = document.getElementById("aiMealInput")?.value || "";
    }

    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error al guardar comida");
    }

    closeMealReviewModal();

    // Clear AI input if created
    const inputEl = document.getElementById("aiMealInput");
    if (inputEl && !currentEditingMealId) inputEl.value = "";

    showToast(t("success_title"), "Comida guardada exitosamente.", "success");

    // Refresh everything in real time!
    await loadMealsForDate();
    await loadStepsAndBudget();
    loadAnalytics(currentAnalyticsDays);

  } catch (err) {
    console.error("Error saving meal:", err);
    showToast(t("error_title"), err.message, "error");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = currentEditingMealId ? t("update_meal_btn") : t("save_meal_btn");
    }
  }
}

/**
 * Loads all logged meals for the selected date.
 */
async function loadMealsForDate() {
  const container = document.getElementById("dailyMealsContainer");
  const emptyState = document.getElementById("noMealsEmptyState");
  if (!container) return;

  try {
    const res = await fetch(`/api/meals?date=${currentDate}`);
    if (!res.ok) throw new Error("Error loading meals");
    const meals = await res.json();

    window.currentDayMeals = meals;

    if (!meals.length) {
      container.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    container.innerHTML = "";

    meals.forEach((meal) => {
      const card = document.createElement("div");
      card.className = "bg-slate-800/80 border border-slate-700/70 rounded-xl p-5 shadow-lg transition hover:border-slate-600";

      const mealTypeBadgeColors = {
        breakfast: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        lunch: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        dinner: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
        snack: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      };
      const badgeClass = mealTypeBadgeColors[meal.meal_type] || "bg-slate-700 text-slate-300 border-slate-600";
      const mealTypeLabel = t(`meal_type_${meal.meal_type}`, meal.meal_type);

      const itemsHtml = (meal.items || [])
        .map(
          (i) => `
          <div class="flex items-center justify-between text-xs py-1 border-b border-slate-700/40 last:border-0">
            <div class="flex items-center space-x-2">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span class="text-slate-200 font-medium">${i.name}</span>
              <span class="text-slate-400">(${i.portion_description || `${i.weight_g}g`})</span>
            </div>
            <div class="flex items-center space-x-3 font-mono text-slate-300">
              <span class="text-emerald-400 font-semibold">${Math.round(i.calories)} kcal</span>
              <span class="text-blue-400">${i.protein_g}g P</span>
              <span class="text-cyan-400">${i.carbs_g}g C</span>
              <span class="text-amber-400">${i.fat_g}g F</span>
            </div>
          </div>
        `
        )
        .join("");

      card.innerHTML = `
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeClass}">
              ${mealTypeLabel}
            </span>
            <h4 class="text-base font-bold text-white">${meal.meal_name}</h4>
          </div>
          <div class="flex items-center space-x-2">
            <!-- Edit Button -->
            <button onclick="handleEditMealClick(${meal.id})"
              class="p-1.5 rounded-lg bg-slate-700/60 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-400 transition"
              title="${t("edit_meal_tooltip")}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <!-- Delete Button -->
            <button onclick="handleDeleteMealClick(${meal.id})"
              class="p-1.5 rounded-lg bg-slate-700/60 hover:bg-rose-600/30 text-slate-300 hover:text-rose-400 transition"
              title="${t("delete_meal_tooltip")}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Items Breakdown -->
        <div class="bg-slate-900/60 rounded-lg p-3 mb-3 border border-slate-700/50">
          ${itemsHtml}
        </div>

        <!-- Meal Summary Totals -->
        <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-700/60 font-mono">
          <span class="text-slate-400 font-sans">Total comida:</span>
          <div class="flex items-center space-x-4">
            <span class="text-emerald-400 font-bold text-sm">${Math.round(meal.total_calories)} kcal</span>
            <span class="text-blue-400 font-medium">${meal.total_protein}g P</span>
            <span class="text-cyan-400 font-medium">${meal.total_carbs}g C</span>
            <span class="text-amber-400 font-medium">${meal.total_fat}g F</span>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading meals:", err);
  }
}

/**
 * Triggers modal in EDIT mode pre-populated with meal data.
 */
function handleEditMealClick(mealId) {
  const meal = (window.currentDayMeals || []).find((m) => m.id === mealId);
  if (!meal) return;
  openMealReviewModal(meal, true, mealId);
}

/**
 * Triggers confirmation and deletion of a meal.
 */
async function handleDeleteMealClick(mealId) {
  const confirmModal = document.getElementById("deleteConfirmModal");
  if (confirmModal) {
    confirmModal.classList.remove("modal-hidden");
    window.mealIdPendingDelete = mealId;
  } else {
    if (confirm(t("delete_confirm_desc"))) {
      await executeDeleteMeal(mealId);
    }
  }
}

async function executeDeleteMeal(mealId) {
  try {
    const res = await fetch(`/api/meals/${mealId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error deleting meal");

    showToast(t("success_title"), "Comida eliminada.", "success");
    await loadMealsForDate();
    await loadStepsAndBudget();
    loadAnalytics(currentAnalyticsDays);
  } catch (err) {
    console.error("Error deleting meal:", err);
    showToast(t("error_title"), err.message, "error");
  }
}
