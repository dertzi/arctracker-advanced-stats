/**
 * ProfitChartCard Component
 * Wrapper for profit chart with grid toggle (full width)
 */

import { createCard, createButton } from "../utils/cardBuilder.js";
import { drawProfitChart } from "../../charts/profit-chart/index.js";
import { isGridEnabled, setGridEnabled } from "../state.js";

/**
 * Render profit chart card
 * @param {any} stats - Statistics object
 * @returns {HTMLElement} Card element
 */
export function render(stats) {
  const card = createCard(); // Full width, no span

  // Header with grid toggle
  const header = document.createElement("div");
  header.className = "flex justify-between items-center mb-2";

  const title = document.createElement("div");
  title.className = "text-xs text-muted-foreground";
  title.textContent = "Profit Chart";

  const toggleBtn = createButton(`Grids: ${isGridEnabled() ? "ON" : "OFF"}`, () => {
    setGridEnabled(!isGridEnabled());
    toggleBtn.textContent = `Grids: ${isGridEnabled() ? "ON" : "OFF"}`;
    drawProfitChart(stats);
  });

  header.appendChild(title);
  header.appendChild(toggleBtn);

  // Canvas container
  const canvasContainer = document.createElement("div");
  canvasContainer.style.position = "relative";

  const canvas = document.createElement("canvas");
  canvas.id = "arcChart";
  canvas.style.width = "100%";
  canvas.style.height = "200px";

  const tooltip = document.createElement("div");
  tooltip.id = "arcTooltip";
  tooltip.style.cssText = `
    position: absolute;
    padding: 4px 6px;
    background: #0009;
    color: white;
    font-size: 11px;
    pointer-events: none;
    border-radius: 4px;
    display: none;
  `;

  canvasContainer.appendChild(canvas);
  canvasContainer.appendChild(tooltip);

  card.appendChild(header);
  card.appendChild(canvasContainer);

  // Initial render (after DOM insertion)
  setTimeout(() => drawProfitChart(stats), 0);

  return card;
}
