/**
 * HistogramCard Component
 * Wrapper for profit distribution histogram (50% width)
 */

import { createCard } from "../utils/cardBuilder.js";
import { renderHistogram } from "../../charts/histogram/index.js";

/**
 * Render histogram card
 * @param {any} stats - Statistics object
 * @returns {HTMLElement} Card element
 */
export function render(stats) {
  const card = createCard({ span: 1 });

  // Header
  const header = document.createElement("div");
  header.className = "flex justify-between items-center mb-2";

  const title = document.createElement("div");
  title.className = "text-xs text-muted-foreground";
  title.textContent = "Profit Distribution";

  header.appendChild(title);

  // Canvas container
  const canvasContainer = document.createElement("div");
  canvasContainer.style.position = "relative";

  const canvas = document.createElement("canvas");
  canvas.id = "arcHistogram";
  canvas.style.width = "100%";
  canvas.style.height = "180px";

  const tooltip = document.createElement("div");
  tooltip.id = "arcHistTooltip";
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
  setTimeout(() => renderHistogram(stats), 0);

  return card;
}
