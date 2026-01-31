/**
 * CombinedStatsCard Component
 * Displays total profit, averages, and top gains/losses (75% width)
 */

import { createCard } from "../utils/cardBuilder.js";
import { fmtRaw } from "../../utils/dom.js";

/**
 * Render combined statistics card
 * @param {any} stats - Statistics object
 * @returns {HTMLElement} Card element
 */
export function render(stats) {
  const card = createCard({ span: 3 });

  const container = document.createElement("div");
  container.className = "flex flex-col md:flex-row gap-4";

  // Build main sections
  container.appendChild(buildProfitSection(stats.totalProfit));
  container.appendChild(buildAveragesSection(stats));
  container.appendChild(buildTopGainsLosses(stats));

  card.appendChild(container);
  return card;
}

/**
 * Build total profit section
 * @param {number} totalProfit - Total profit value
 * @returns {HTMLElement} Profit section element
 */
function buildProfitSection(totalProfit) {
  const section = document.createElement("div");
  section.className = "flex-1";

  const label = document.createElement("div");
  label.className = "text-xs text-muted-foreground mb-1";
  label.textContent = "Total Profit";

  const value = document.createElement("div");
  value.className = `text-xl font-bold ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`;
  value.textContent = fmtRaw(totalProfit);

  section.appendChild(label);
  section.appendChild(value);

  return section;
}

/**
 * Build averages section
 * @param {any} stats - Statistics object
 * @returns {HTMLElement} Averages section element
 */
function buildAveragesSection(stats) {
  const section = document.createElement("div");
  section.className = "flex-1";

  const label = document.createElement("div");
  label.className = "text-xs text-muted-foreground mb-1";
  label.textContent = "Averages";

  const perRaid = createStatLine("Per Raid:", fmtRaw(stats.avgPerRaid));
  const perSurvive = createStatLine("Per Survive:", fmtRaw(stats.avgPerSurvive));
  const perDay = createStatLine("Per Day:", fmtRaw(stats.profitPerDay));

  section.appendChild(label);
  section.appendChild(perRaid);
  section.appendChild(perSurvive);
  section.appendChild(perDay);

  return section;
}

/**
 * Build top gains and losses section
 * @param {any} stats - Statistics object
 * @returns {HTMLElement} Top gains/losses section element
 */
function buildTopGainsLosses(stats) {
  const section = document.createElement("div");
  section.className = "flex-1";

  const container = document.createElement("div");
  container.className = "flex flex-row gap-4";

  // Top gains column
  const gainsCol = document.createElement("div");
  gainsCol.className = "flex-1";

  const gainsLabel = document.createElement("div");
  gainsLabel.className = "text-xs text-muted-foreground mb-1";
  gainsLabel.textContent = "Top 5 Gains";
  gainsCol.appendChild(gainsLabel);

  stats.biggestGains.forEach((/** @type {number} */ value) => {
    const div = document.createElement("div");
    div.className = "text-sm text-green-500";
    div.textContent = `+${fmtRaw(value)}`;
    gainsCol.appendChild(div);
  });

  // Top losses column
  const lossesCol = document.createElement("div");
  lossesCol.className = "flex-1";

  const lossesLabel = document.createElement("div");
  lossesLabel.className = "text-xs text-muted-foreground mb-1";
  lossesLabel.textContent = "Top 5 Losses";
  lossesCol.appendChild(lossesLabel);

  stats.biggestLosses.forEach((/** @type {number} */ value) => {
    const div = document.createElement("div");
    div.className = "text-sm text-red-500";
    div.textContent = fmtRaw(value);
    lossesCol.appendChild(div);
  });

  container.appendChild(gainsCol);
  container.appendChild(lossesCol);
  section.appendChild(container);

  return section;
}

/**
 * Create a stat line element
 * @param {string} label - Label text
 * @param {string} value - Value text
 * @returns {HTMLElement} Stat line element
 */
function createStatLine(label, value) {
  const div = document.createElement("div");
  div.className = "text-sm";
  div.innerHTML = `${label} <b>${value}</b>`;
  return div;
}
