/**
 * RaidSummaryCard Component
 * Displays raid summary stats and includes DevToolsPanel (25% width)
 */

import { createCard } from "../utils/cardBuilder.js";

import * as DevToolsPanel from "./DevToolsPanel.js";

/**
 * Render raid summary card
 * @param {any} stats - Statistics object
 * @returns {HTMLElement} Card element
 */
export function render(stats) {
  const card = createCard({ span: 1 });

  // Header
  const header = document.createElement("div");
  header.className = "text-xs text-muted-foreground mb-1";
  header.textContent = "Raid Summary";

  // Stats
  const total = createStatLine("Total:", stats.totalRaids);
  const survived = createStatLine("Survived:", stats.totalSurvived, "text-green-500");
  const kia = createStatLine("KIA:", stats.totalKIA, "text-red-500");

  // Dev tools panel
  const devTools = DevToolsPanel.render(stats);

  // Assemble card
  card.appendChild(header);
  card.appendChild(total);
  card.appendChild(survived);
  card.appendChild(kia);
  card.appendChild(devTools);

  return card;
}

/**
 * Create a stat line element
 * @param {string} label - Label text
 * @param {number} value - Stat value
 * @param {string} [colorClass] - Optional color class
 * @returns {HTMLElement} Stat line element
 */
function createStatLine(label, value, colorClass = "") {
  const div = document.createElement("div");
  div.className = `text-sm ${colorClass}`;
  div.innerHTML = `${label} <b>${value}</b>`;
  return div;
}
