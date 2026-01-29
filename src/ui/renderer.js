import { fmtRaw, getMainCardContainer } from "../utils/dom.js";
import { sortMapStats } from "../stats/engine.js";
import { drawProfitChart } from "../charts/profit-chart/index.js";

/** @type {HTMLElement | null} */
let statsBlock = null;

let gridEnabled = true;

/**
 * Check if grid is enabled
 * @returns {boolean}
 */
export function isGridEnabled() {
  return gridEnabled;
}

/**
 * Set grid enabled state
 * @param {boolean} value
 */
export function setGridEnabled(value) {
  gridEnabled = value;
}

/**
 * Render the stats UI
 * @param {any} stats
 */
export function renderStatsUI(stats) {
  const container = getMainCardContainer();
  if (!container) return;

  if (!statsBlock) {
    statsBlock = document.createElement("div");
    statsBlock.id = "arcStatsBlock";
    statsBlock.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4";
    container.insertBefore(statsBlock, container.children[1]);
  }

  const topGains = stats.biggestGains
    .map((/** @type {number} */ v) => `<div class="text-sm text-green-500">+${fmtRaw(v)}</div>`)
    .join("");
  const topLosses = stats.biggestLosses
    .map((/** @type {number} */ v) => `<div class="text-sm text-red-500">${fmtRaw(v)}</div>`)
    .join("");

  statsBlock.innerHTML = `
            <div class="rounded-lg border bg-card p-3">
                <div class="text-xs text-muted-foreground mb-1">Total Profit</div>
                <div class="text-xl font-bold ${stats.totalProfit >= 0 ? "text-green-500" : "text-red-500"}">
                    ${fmtRaw(stats.totalProfit)}
                </div>
            </div>
            <div class="rounded-lg border bg-card p-3">
                <div class="text-xs text-muted-foreground mb-1">Raid Summary</div>
                <div class="text-sm">Total: <b>${stats.totalRaids}</b></div>
                <div class="text-sm text-green-500">Survived: <b>${stats.totalSurvived}</b></div>
                <div class="text-sm text-red-500">KIA: <b>${stats.totalKIA}</b></div>
            </div>
            <div class="rounded-lg border bg-card p-3">
                <div class="text-xs text-muted-foreground mb-1">Averages</div>
                <div class="text-sm">Per Raid: <b>${fmtRaw(stats.avgPerRaid)}</b></div>
                <div class="text-sm">Per Survive: <b>${fmtRaw(stats.avgPerSurvive)}</b></div>
                <div class="text-sm">Per Day: <b>${fmtRaw(stats.profitPerDay)}</b></div>
            </div>
            <!-- PROFIT CHART -->
            <div class="rounded-lg border bg-card p-3 md:col-span-2 lg:col-span-3">
                <div class="flex justify-between items-center mb-2">
                    <div class="text-xs text-muted-foreground">Profit Chart</div>
                    <button id="arcGridToggle" class="text-[10px] px-2 py-1 border rounded hover:bg-accent">
                        Grids: ON
                    </button>
                </div>
                <div style="position:relative;">
                    <canvas id="arcChart" style="width:100%; height:200px;"></canvas>
                    <div id="arcTooltip"
                        style="
                            position:absolute;
                            padding:4px 6px;
                            background:#0009;
                            color:white;
                            font-size:11px;
                            pointer-events:none;
                            border-radius:4px;
                            display:none;
                        ">
                    </div>
                </div>
            </div>
            <!-- NEW MAP STATS CARD (FULL WIDTH, AFTER PROFIT CHART) -->
            <div class="rounded-lg border bg-card p-3 md:col-span-2 lg:col-span-3">
                <div class="text-xs text-muted-foreground mb-3">Map Stats</div>
                <div class="grid grid-cols-[2fr,1fr,2fr,1fr,1fr] text-[11px] font-semibold text-muted-foreground mb-2">
                    <div>MAP</div>
                    <div class="text-right">PROFIT</div>
                    <div class="text-center">SURVIVAL</div>
                    <div class="text-right">RAIDS</div>
                    <div class="text-right">SURVIVED</div>
                </div>
                <div id="arcMapStatsRows" class="space-y-1"></div>
            </div>
            <!-- TOP GAINS -->
            <div class="rounded-lg border bg-card p-3">
                <div class="text-xs text-muted-foreground mb-1">Top 5 Gains</div>
                ${topGains}
            </div>
            <!-- TOP LOSSES -->
            <div class="rounded-lg border bg-card p-3">
                <div class="text-xs text-muted-foreground mb-1">Top 5 Losses</div>
                ${topLosses}
            </div>
            <!-- HISTOGRAM -->
            <div class="rounded-lg border bg-card p-3 md:col-span-2 lg:col-span-3">
                <div class="flex justify-between items-center mb-2">
                    <div class="text-xs text-muted-foreground">Profit Distribution</div>
                </div>
                <div style="position:relative;">
                    <canvas id="arcHistogram" style="width:100%; height:180px;"></canvas>
                    <div id="arcHistTooltip"
                        style="
                            position:absolute;
                            padding:4px 6px;
                            background:#0009;
                            color:white;
                            font-size:11px;
                            pointer-events:none;
                            border-radius:4px;
                            display:none;
                        ">
                    </div>
                </div>
            </div>
        `;

  const toggle = document.getElementById("arcGridToggle");
  if (toggle) {
    toggle.onclick = () => {
      setGridEnabled(!isGridEnabled());
      toggle.textContent = "Grids: " + (isGridEnabled() ? "ON" : "OFF");
      drawProfitChart(stats);
    };
  }

  drawProfitChart(stats);
  renderMapStatsRows(stats);
}

/**
 * Render map statistics rows
 * @param {any} stats
 */
function renderMapStatsRows(stats) {
  const container = document.getElementById("arcMapStatsRows");
  if (!container) return;

  const sorted = sortMapStats(stats.mapStatsArray);

  container.innerHTML = sorted
    .map((/** @type {any} */ m) => {
      const profitColor = m.profit >= 0 ? "text-green-500" : "text-red-500";
      let barColor = "bg-red-500";
      if (m.survivalRate > 0.7) barColor = "bg-green-500";
      else if (m.survivalRate > 0.5) barColor = "bg-yellow-400";
      const srPct = Math.round(m.survivalRate * 100);

      return `
            <div class="grid grid-cols-[2fr,1fr,2fr,1fr,1fr] items-center py-1 border-b border-muted/20">

                <!-- MAP NAME -->
                <div class="text-sm">${m.name}</div>

                <!-- PROFIT -->
                <div class="text-sm font-bold text-right ${profitColor}">
                    ${m.profit >= 0 ? "+" : ""}${fmtRaw(m.profit)}
                </div>

                <!-- SURVIVAL BAR + PERCENT -->
                <div class="px-2">
                    <div class="w-full h-2 bg-muted rounded overflow-hidden">
                        <div class="h-full ${barColor}" style="width: ${srPct}%;"></div>
                    </div>
                    <div class="text-[10px] text-center mt-1">${srPct}%</div>
                </div>

                <!-- RAIDS -->
                <div class="text-sm text-right">${m.raids}</div>

                <!-- SURVIVED -->
                <div class="text-sm text-right">${m.survived}</div>

            </div>
        `;
    })
    .join("");
}
