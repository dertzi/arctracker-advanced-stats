/**
 * UI Renderer - Orchestrator Module
 * Composes UI components into the final stats interface
 */

import { getMainCardContainer } from "../utils/dom.js";

import { createRow } from "./utils/cardBuilder.js";
import * as CombinedStatsCard from "./components/CombinedStatsCard.js";
import * as RaidSummaryCard from "./components/RaidSummaryCard.js";
import * as ProfitChartCard from "./components/ProfitChartCard.js";
import * as HistogramCard from "./components/HistogramCard.js";
import * as MapStatsCard from "./components/MapStatsCard.js";

// Re-export state functions for backward compatibility
export { isGridEnabled, setGridEnabled } from "./state.js";

/** @type {HTMLElement | null} */
let statsBlock = null;

/**
 * Render the stats UI by composing all components
 * @param {any} stats - Statistics object
 */
export function renderStatsUI(stats) {
  const container = getMainCardContainer();
  if (!container) return;

  // Create or reuse stats block
  if (!statsBlock) {
    statsBlock = document.createElement("div");
    statsBlock.id = "arcStatsBlock";
    statsBlock.className = "space-y-3 mb-4";
    container.insertBefore(statsBlock, container.children[1]);
  }

  // Clear previous content
  statsBlock.innerHTML = "";

  // Row 1: Combined Stats (75%) + Raid Summary (25%)
  const row1 = createRow("arc-row-4cols");
  row1.appendChild(CombinedStatsCard.render(stats));
  row1.appendChild(RaidSummaryCard.render(stats));
  statsBlock.appendChild(row1);

  // Row 2: Profit Chart (full width)
  statsBlock.appendChild(ProfitChartCard.render(stats));

  // Row 3: Histogram (50%) + Map Stats (50%)
  const row3 = createRow("arc-row-2cols");
  row3.appendChild(HistogramCard.render(stats));
  row3.appendChild(MapStatsCard.render(stats));
  statsBlock.appendChild(row3);
}
