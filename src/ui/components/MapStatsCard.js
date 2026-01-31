/**
 * MapStatsCard Component
 * Displays map statistics table with sorting (50% width)
 */

import { createCard } from "../utils/cardBuilder.js";
import { sortMapStats } from "../../stats/engine.js";
import { fmtRaw } from "../../utils/dom.js";

/**
 * Render map statistics card
 * @param {any} stats - Statistics object
 * @returns {HTMLElement} Card element
 */
export function render(stats) {
  const card = createCard({ span: 1 });

  // Header
  const header = document.createElement("div");
  header.className = "text-xs text-muted-foreground mb-3";
  header.textContent = "Map Stats";

  // Table header
  const tableHeader = document.createElement("div");
  tableHeader.className = "text-[11px] font-semibold text-muted-foreground mb-2";
  tableHeader.style.cssText =
    "display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 0.5rem;";
  tableHeader.innerHTML = `
    <div>MAP</div>
    <div class="text-right">PROFIT</div>
    <div class="text-right">SURVIVAL</div>
    <div class="text-right">RAIDS</div>
    <div class="text-right">SURVIVED</div>
  `;

  // Table rows container
  const rowsContainer = document.createElement("div");
  rowsContainer.className = "space-y-1";

  const sorted = sortMapStats(stats.mapStatsArray);
  sorted.forEach((/** @type {any} */ map) => {
    rowsContainer.appendChild(createMapRow(map));
  });

  // Assemble card
  card.appendChild(header);
  card.appendChild(tableHeader);
  card.appendChild(rowsContainer);

  return card;
}

/**
 * Create a map statistics row
 * @param {any} map - Map stats object
 * @returns {HTMLElement} Row element
 */
function createMapRow(map) {
  const row = document.createElement("div");
  row.className = "items-center py-1 border-b border-muted/20";
  row.style.cssText = "display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 0.5rem;";

  const profitColor = map.profit >= 0 ? "text-green-500" : "text-red-500";
  let survivalColor = "text-red-500";
  if (map.survivalRate > 0.7) survivalColor = "text-green-500";
  else if (map.survivalRate > 0.5) survivalColor = "text-yellow-400";

  const srPct = Math.round(map.survivalRate * 100);

  row.innerHTML = `
    <div class="text-sm">${map.name}</div>
    <div class="text-sm font-bold text-right ${profitColor}">
      ${map.profit >= 0 ? "+" : ""}${fmtRaw(map.profit)}
    </div>
    <div class="text-sm text-right font-semibold ${survivalColor}">
      ${srPct}%
    </div>
    <div class="text-sm text-right">${map.raids}</div>
    <div class="text-sm text-right">${map.survived}</div>
  `;

  return row;
}
