// NutriPulse AI - Main Application Controller

let currentDate = new Date().toISOString().split("T")[0];
let currentUserProfile = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize language
  setLanguage(currentLang);

  // Initialize date picker to today
  initDateNavigation();

  // Load user profile & API key status
  await loadUserProfile();
  await checkApiKeyStatus();

  // Load day data
  await loadMealsForDate();
  await loadStepsAndBudget();
  await loadAnalytics(7);

  // Bind all interactive events
  bindGlobalEvents();
});

/**
 * Initializes Date Controls (Yesterday, Today, Native date picker)
 */
function initDateNavigation() {
  const datePicker = document.getElementById("datePicker");
  if (datePicker) {
    datePicker.value = currentDate;
    datePicker.addEventListener("change", (e) => {
      if (e.target.value) {
        changeActiveDate(e.target.value);
      }
    });
  }

  const todayBtn = document.getElementById("todayBtn");
  const yesterdayBtn = document.getElementById("yesterdayBtn");

  if (todayBtn) {
    todayBtn.addEventListener("click", () => {
      const today = new Date().toISOString().split("T")[0];
      changeActiveDate(today);
    });
  }

  if (yesterdayBtn) {
    yesterdayBtn.addEventListener("click", () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const yesterday = d.toISOString().split("T")[0];
      changeActiveDate(yesterday);
    });
  }
}

async function changeActiveDate(newDate) {
  currentDate = newDate;

  const datePicker = document.getElementById("datePicker");
  if (datePicker) datePicker.value = currentDate;

  updateDateButtonStyles();

  // Reload day's data
  await loadMealsForDate();
  await loadStepsAndBudget();
  loadAnalytics(currentAnalyticsDays);
}

function updateDateButtonStyles() {
  const today = new Date().toISOString().split("T")[0];
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterday = d.toISOString().split("T")[0];

  const todayBtn = document.getElementById("todayBtn");
  const yesterdayBtn = document.getElementById("yesterdayBtn");

  if (todayBtn) {
    if (currentDate === today) {
      todayBtn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition";
    } else {
      todayBtn.className = "px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition";
    }
  }

  if (yesterdayBtn) {
    if (currentDate === yesterday) {
      yesterdayBtn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition";
    } else {
      yesterdayBtn.className = "px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition";
    }
  }
}

/**
 * Loads User Profile & Active Goals
 */
async function loadUserProfile() {
  try {
    const res = await fetch("/api/profile");
    if (!res.ok) throw new Error("Error fetching profile");
    currentUserProfile = await res.json();
    window.currentUserProfile = currentUserProfile;
  } catch (err) {
    console.error("Error loading user profile:", err);
  }
}

/**
 * Check and manage Gemini API Key configuration
 */
async function checkApiKeyStatus() {
  try {
    const res = await fetch("/api/profile/config/api-key");
    if (!res.ok) return;
    const data = await res.json();

    const banner = document.getElementById("apiKeyWarningBanner");
    const statusText = document.getElementById("apiKeyConfigStatus");

    if (data.has_key) {
      if (banner) banner.classList.add("hidden");
      if (statusText) statusText.textContent = `${t("api_key_status_active")} ${data.masked_key}`;
    } else {
      if (banner) banner.classList.remove("hidden");
      if (statusText) statusText.textContent = t("api_key_status_none");
    }
  } catch (err) {
    console.error("Error checking API key:", err);
  }
}

function openApiKeyModal() {
  const modal = document.getElementById("apiKeyModal");
  if (modal) modal.classList.remove("modal-hidden");
}

function closeApiKeyModal() {
  const modal = document.getElementById("apiKeyModal");
  if (modal) modal.classList.add("modal-hidden");
}

async function handleSaveApiKey() {
  const input = document.getElementById("apiKeyInput");
  if (!input) return;

  const key = input.value.trim();
  if (!key || key.length < 10) {
    showToast(t("error_title"), "Por favor ingresa una clave válida.", "error");
    return;
  }

  try {
    const res = await fetch("/api/profile/config/api-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: key }),
    });

    if (!res.ok) throw new Error("Error saving API key");

    input.value = "";
    closeApiKeyModal();
    await checkApiKeyStatus();
    showToast(t("success_title"), t("key_saved_success"), "success");
  } catch (err) {
    console.error("Error saving API key:", err);
    showToast(t("error_title"), err.message, "error");
  }
}

/**
 * Global Event Bindings
 */
function bindGlobalEvents() {
  // Language toggle button in header
  const langToggleBtn = document.getElementById("langToggleBtn");
  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", () => {
      toggleLanguage();
      langToggleBtn.textContent = t("lang_toggle");
    });
  }

  // TDEE modal open button
  const openTdeeBtn = document.getElementById("openTdeeBtn");
  if (openTdeeBtn) {
    openTdeeBtn.addEventListener("click", openCalculatorModal);
  }

  // TDEE modal inputs real-time preview recalculation
  const calcForm = document.getElementById("tdeeCalculatorForm");
  if (calcForm) {
    calcForm.querySelectorAll("select, input").forEach((el) => {
      el.addEventListener("change", runTDEECalculationPreview);
      el.addEventListener("input", runTDEECalculationPreview);
    });
  }

  // Apply goals button
  const applyGoalsBtn = document.getElementById("applyGoalsBtn");
  if (applyGoalsBtn) {
    applyGoalsBtn.addEventListener("click", applyCalculatedGoals);
  }

  // AI Meal Analyze button
  const aiAnalyzeBtn = document.getElementById("aiAnalyzeBtn");
  if (aiAnalyzeBtn) {
    aiAnalyzeBtn.addEventListener("click", handleAnalyzeMeal);
  }

  // Sample meals click-to-fill
  document.querySelectorAll(".sample-meal-chip").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const sampleKey = e.currentTarget.getAttribute("data-sample");
      const textarea = document.getElementById("aiMealInput");
      if (textarea && sampleKey) {
        textarea.value = t(sampleKey);
        textarea.focus();
      }
    });
  });

  // Save Steps button
  const saveStepsBtn = document.getElementById("saveStepsBtn");
  if (saveStepsBtn) {
    saveStepsBtn.addEventListener("click", handleSaveSteps);
  }

  // Save Reviewed / Edited Meal button in modal
  const saveMealBtn = document.getElementById("saveReviewedMealBtn");
  if (saveMealBtn) {
    saveMealBtn.addEventListener("click", handleSaveReviewedMeal);
  }

  // Add item in review modal
  const addItemBtn = document.getElementById("addReviewItemBtn");
  if (addItemBtn) {
    addItemBtn.addEventListener("click", handleAddReviewItem);
  }

  // Delete confirm modal action
  const confirmDeleteBtn = document.getElementById("confirmDeleteMealBtn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
      if (window.mealIdPendingDelete) {
        await executeDeleteMeal(window.mealIdPendingDelete);
        window.mealIdPendingDelete = null;
        closeDeleteConfirmModal();
      }
    });
  }

  // Analytics days tabs
  document.querySelectorAll(".analytics-tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const days = parseInt(e.currentTarget.getAttribute("data-days"), 10);
      document.querySelectorAll(".analytics-tab-btn").forEach((b) => {
        b.className = "analytics-tab-btn px-3 py-1 text-xs font-semibold rounded-md text-slate-400 hover:text-white transition";
      });
      e.currentTarget.className = "analytics-tab-btn px-3 py-1 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition";
      loadAnalytics(days);
    });
  });

  // API Key settings button
  const openApiKeyBtn = document.getElementById("openApiKeyBtn");
  if (openApiKeyBtn) {
    openApiKeyBtn.addEventListener("click", openApiKeyModal);
  }

  const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
  if (saveApiKeyBtn) {
    saveApiKeyBtn.addEventListener("click", handleSaveApiKey);
  }
}

function closeDeleteConfirmModal() {
  const modal = document.getElementById("deleteConfirmModal");
  if (modal) modal.classList.add("modal-hidden");
  window.mealIdPendingDelete = null;
}

/**
 * Toast Notification Helper
 */
function showToast(title, message, type = "info") {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  const bgColors = {
    success: "bg-emerald-900/90 border-emerald-500 text-emerald-100",
    error: "bg-rose-900/90 border-rose-500 text-rose-100",
    info: "bg-slate-800/90 border-cyan-500 text-cyan-100",
  };
  const colorClass = bgColors[type] || bgColors.info;

  toast.className = `flex items-start p-4 mb-3 rounded-lg border shadow-xl backdrop-blur-sm transition-all duration-300 transform translate-y-2 opacity-0 ${colorClass}`;
  toast.innerHTML = `
    <div class="flex-1">
      <h5 class="text-sm font-bold">${title}</h5>
      <p class="text-xs mt-0.5 opacity-90">${message}</p>
    </div>
    <button class="ml-3 text-slate-400 hover:text-white text-lg font-bold leading-none">&times;</button>
  `;

  toastContainer.appendChild(toast);

  // Trigger enter animation
  setTimeout(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  }, 10);

  const closeToast = () => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector("button").addEventListener("click", closeToast);
  setTimeout(closeToast, 4000);
}
