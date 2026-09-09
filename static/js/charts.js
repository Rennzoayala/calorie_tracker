// NutriPulse AI - Chart.js Visualizations Module

let calorieDonutChart = null;
let calorieTrendChart = null;
let macroTrendChart = null;
let stepsTrendChart = null;
let currentAnalyticsDays = 7;

/**
 * Initializes or updates the central calorie donut gauge.
 */
function updateCalorieDonut(consumed, budget) {
  const ctx = document.getElementById("calorieDonutCanvas");
  if (!ctx) return;

  const isOver = consumed > budget;
  const remaining = Math.max(0, budget - consumed);
  const overAmount = isOver ? consumed - budget : 0;

  // Center text DOM elements
  const centerStatusEl = document.getElementById("donutCenterStatus");
  const centerValueEl = document.getElementById("donutCenterValue");
  const centerSubtextEl = document.getElementById("donutCenterSubtext");

  if (centerStatusEl && centerValueEl && centerSubtextEl) {
    if (isOver) {
      centerStatusEl.textContent = t("over_budget");
      centerStatusEl.className = "text-xs font-semibold uppercase tracking-wider text-rose-400";
      centerValueEl.textContent = Math.round(overAmount);
      centerValueEl.className = "text-3xl font-extrabold text-rose-400";
      centerSubtextEl.textContent = `kcal / ${Math.round(budget)}`;
    } else {
      centerStatusEl.textContent = t("remaining");
      centerStatusEl.className = "text-xs font-semibold uppercase tracking-wider text-emerald-400";
      centerValueEl.textContent = Math.round(remaining);
      centerValueEl.className = "text-3xl font-extrabold text-white";
      centerSubtextEl.textContent = `kcal / ${Math.round(budget)}`;
    }
  }

  const chartData = isOver
    ? {
        labels: [t("consumed"), t("over_budget")],
        datasets: [
          {
            data: [budget, overAmount],
            backgroundColor: ["#f43f5e", "#fb7185"],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      }
    : {
        labels: [t("consumed"), t("remaining")],
        datasets: [
          {
            data: [consumed, remaining],
            backgroundColor: ["#10b981", "#1e293b"],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      };

  if (calorieDonutChart) {
    calorieDonutChart.data = chartData;
    calorieDonutChart.update();
  } else {
    calorieDonutChart = new Chart(ctx, {
      type: "doughnut",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "78%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                return ` ${context.label}: ${Math.round(context.raw)} kcal`;
              },
            },
          },
        },
        animation: {
          animateScale: true,
          animateRotate: true,
        },
      },
    });
  }
}

/**
 * Loads and renders the historical analytics charts for 7, 14, or 30 days.
 */
async function loadAnalytics(days = currentAnalyticsDays) {
  currentAnalyticsDays = days;
  try {
    const res = await fetch(`/api/analytics?days=${days}&end_date=${currentDate}`);
    if (!res.ok) throw new Error("Failed to fetch analytics");
    const data = await res.json();

    renderAnalyticsCharts(data);
    updateAnalyticsSummaryCards(data);
  } catch (err) {
    console.error("Error loading analytics:", err);
  }
}

function updateAnalyticsSummaryCards(data) {
  const avgCalsEl = document.getElementById("analyticsAvgCals");
  const avgStepsEl = document.getElementById("analyticsAvgSteps");
  const avgProtEl = document.getElementById("analyticsAvgProtein");

  if (avgCalsEl) avgCalsEl.textContent = `${Math.round(data.avg_calories)} kcal`;
  if (avgStepsEl) avgStepsEl.textContent = `${Math.round(data.avg_steps).toLocaleString()}`;
  if (avgProtEl) avgProtEl.textContent = `${Math.round(data.avg_protein)} g`;
}

function renderAnalyticsCharts(data) {
  const labels = data.points.map((p) => {
    const d = new Date(p.date + "T00:00:00");
    return d.toLocaleDateString(currentLang === "es" ? "es-ES" : "en-US", {
      month: "short",
      day: "numeric",
    });
  });

  const consumedCals = data.points.map((p) => p.consumed_calories);
  const adjustedBudgets = data.points.map((p) => p.adjusted_budget);
  const proteins = data.points.map((p) => p.protein);
  const carbs = data.points.map((p) => p.carbs);
  const fats = data.points.map((p) => p.fat);
  const steps = data.points.map((p) => p.steps);
  const stepBurns = data.points.map((p) => p.step_calories);

  // Common dark theme grid options
  const darkGrid = {
    color: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(255, 255, 255, 0.1)",
  };

  // 1. Calories vs Budget Chart
  const calCtx = document.getElementById("calorieTrendCanvas");
  if (calCtx) {
    if (calorieTrendChart) calorieTrendChart.destroy();
    calorieTrendChart = new Chart(calCtx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: t("consumed"),
            data: consumedCals,
            backgroundColor: "rgba(16, 185, 129, 0.75)",
            borderColor: "#10b981",
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            type: "line",
            label: t("budget"),
            data: adjustedBudgets,
            borderColor: "#06b6d4",
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 3,
            pointBackgroundColor: "#06b6d4",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: darkGrid, ticks: { color: "#94a3b8" } },
          y: { grid: darkGrid, ticks: { color: "#94a3b8" } },
        },
        plugins: {
          legend: { labels: { color: "#e2e8f0" } },
        },
      },
    });
  }

  // 2. Macronutrient Breakdown Chart (Stacked Bars)
  const macroCtx = document.getElementById("macroTrendCanvas");
  if (macroCtx) {
    if (macroTrendChart) macroTrendChart.destroy();
    macroTrendChart = new Chart(macroCtx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: t("protein") + " (g)",
            data: proteins,
            backgroundColor: "#3b82f6",
            borderRadius: 2,
          },
          {
            label: t("carbs") + " (g)",
            data: carbs,
            backgroundColor: "#06b6d4",
            borderRadius: 2,
          },
          {
            label: t("fat") + " (g)",
            data: fats,
            backgroundColor: "#f59e0b",
            borderRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, grid: darkGrid, ticks: { color: "#94a3b8" } },
          y: { stacked: true, grid: darkGrid, ticks: { color: "#94a3b8" } },
        },
        plugins: {
          legend: { labels: { color: "#e2e8f0" } },
        },
      },
    });
  }

  // 3. Steps & Burn Trend Chart
  const stepsCtx = document.getElementById("stepsTrendCanvas");
  if (stepsCtx) {
    if (stepsTrendChart) stepsTrendChart.destroy();
    stepsTrendChart = new Chart(stepsCtx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            type: "bar",
            label: t("steps_card_title"),
            data: steps,
            backgroundColor: "rgba(139, 92, 246, 0.65)",
            borderColor: "#8b5cf6",
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: "ySteps",
          },
          {
            type: "line",
            label: t("steps_burned") + " (kcal)",
            data: stepBurns,
            borderColor: "#f43f5e",
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: "#f43f5e",
            fill: false,
            yAxisID: "yBurn",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: darkGrid, ticks: { color: "#94a3b8" } },
          ySteps: {
            position: "left",
            grid: darkGrid,
            ticks: { color: "#c4b5fd" },
          },
          yBurn: {
            position: "right",
            grid: { drawOnChartArea: false },
            ticks: { color: "#fda4af" },
          },
        },
        plugins: {
          legend: { labels: { color: "#e2e8f0" } },
        },
      },
    });
  }
}

// React to language change
window.addEventListener("languageChanged", () => {
  if (window.latestBudgetData) {
    updateCalorieDonut(window.latestBudgetData.food_calories, window.latestBudgetData.adjusted_budget);
  }
  loadAnalytics(currentAnalyticsDays);
});
