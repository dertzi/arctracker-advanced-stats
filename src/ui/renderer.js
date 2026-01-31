import { fmtRaw, getMainCardContainer } from "../utils/dom.js";
import { sortMapStats } from "../stats/engine.js";
import { drawProfitChart } from "../charts/profit-chart/index.js";
import { getCacheStatus, clearCache } from "../utils/cache.js";

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
    statsBlock.className = "space-y-3 mb-4";
    container.insertBefore(statsBlock, container.children[1]);
  }

  const topGains = stats.biggestGains
    .map((/** @type {number} */ v) => `<div class="text-sm text-green-500">+${fmtRaw(v)}</div>`)
    .join("");
  const topLosses = stats.biggestLosses
    .map((/** @type {number} */ v) => `<div class="text-sm text-red-500">${fmtRaw(v)}</div>`)
    .join("");

  statsBlock.innerHTML = `
            <!-- ROW 1: Combined Stats (75%) + Raid Summary (25%) -->
            <div class="arc-row-4cols">
                <!-- COMBINED STATS CARD (75% width = 3/4 columns) -->
                <div class="arc-span-3 rounded-lg border bg-card p-3">
                    <div class="flex flex-col md:flex-row gap-4">
                        <!-- Total Profit Section -->
                        <div class="flex-1">
                            <div class="text-xs text-muted-foreground mb-1">Total Profit</div>
                            <div class="text-xl font-bold ${stats.totalProfit >= 0 ? "text-green-500" : "text-red-500"}">
                                ${fmtRaw(stats.totalProfit)}
                            </div>
                        </div>
                        
                        <!-- Averages Section -->
                        <div class="flex-1">
                            <div class="text-xs text-muted-foreground mb-1">Averages</div>
                            <div class="text-sm">Per Raid: <b>${fmtRaw(stats.avgPerRaid)}</b></div>
                            <div class="text-sm">Per Survive: <b>${fmtRaw(stats.avgPerSurvive)}</b></div>
                            <div class="text-sm">Per Day: <b>${fmtRaw(stats.profitPerDay)}</b></div>
                        </div>
                        
                        <!-- Top Gains & Losses Section -->
                        <div class="flex-1">
                            <div class="flex flex-row gap-4">
                                <div class="flex-1">
                                    <div class="text-xs text-muted-foreground mb-1">Top 5 Gains</div>
                                    ${topGains}
                                </div>
                                <div class="flex-1">
                                    <div class="text-xs text-muted-foreground mb-1">Top 5 Losses</div>
                                    ${topLosses}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- RAID SUMMARY CARD (25% width = 1/4 columns) -->
                <div class="arc-span-1 rounded-lg border bg-card p-3">
                    <div class="text-xs text-muted-foreground mb-1">Raid Summary</div>
                    <div class="text-sm">Total: <b>${stats.totalRaids}</b></div>
                    <div class="text-sm text-green-500">Survived: <b>${stats.totalSurvived}</b></div>
                    <div class="text-sm text-red-500">KIA: <b>${stats.totalKIA}</b></div>
                    
                    <!-- Dev Tools Section -->
                    <div class="mt-3 pt-3 border-t border-muted/20">
                        <div class="text-xs text-muted-foreground mb-2">Dev Tools</div>
                        <div class="flex gap-1">
                            <button id="arcExportBtn" class="text-[10px] px-2 py-1 border rounded hover:bg-accent flex-1" title="Export data for development">
                                💾 Export
                            </button>
                            <button id="arcRefreshBtn" class="text-[10px] px-2 py-1 border rounded hover:bg-accent flex-1" title="Clear cache & refresh">
                                🔄 Refresh
                            </button>
                        </div>
                        <div id="arcCacheStatus" class="text-[10px] text-muted-foreground mt-1"></div>
                    </div>
                </div>
            </div>
            
            <!-- ROW 2: PROFIT CHART (Full width) -->
            <div class="rounded-lg border bg-card p-3">
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
            
            <!-- ROW 3: Histogram (50%) + Map Stats (50%) -->
            <div class="arc-row-2cols">
                <!-- HISTOGRAM (50% width = 1/2 columns) -->
                <div class="arc-span-1 rounded-lg border bg-card p-3">
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
                
                <!-- MAP STATS (50% width = 1/2 columns) -->
                <div class="arc-span-1 rounded-lg border bg-card p-3">
                    <div class="text-xs text-muted-foreground mb-3">Map Stats</div>
                    <div class="text-[11px] font-semibold text-muted-foreground mb-2" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 0.5rem;">
                        <div>MAP</div>
                        <div class="text-right">PROFIT</div>
                        <div class="text-right">SURVIVAL</div>
                        <div class="text-right">RAIDS</div>
                        <div class="text-right">SURVIVED</div>
                    </div>
                    <div id="arcMapStatsRows" class="space-y-1"></div>
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

  // Setup export button
  const exportBtn = document.getElementById("arcExportBtn");
  if (exportBtn) {
    exportBtn.onclick = () => exportMockData(stats);
  }

  // Setup refresh button
  const refreshBtn = document.getElementById("arcRefreshBtn");
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      clearCache();
      updateCacheStatus();
      globalThis.location.reload();
    };
  }

  // Update cache status display
  updateCacheStatus();

  drawProfitChart(stats);
  renderMapStatsRows(stats);
}

/**
 * Export raid data as JSON for development/testing
 * @param {any} stats
 */
function exportMockData(stats) {
  const mockData = {
    metadata: {
      capturedAt: new Date().toISOString(),
      totalRaids: stats.totalRaids,
      dateRange: stats.days
        ? {
            earliest: new Date(Date.now() - stats.days * 86400000).toISOString(),
            latest: new Date().toISOString()
          }
        : null,
      note: "Exported raid data for development/testing. Save to test-data/mock-raids.json"
    },
    raids: stats._rawRaidList || []
  };

  // Create and trigger download
  const blob = new Blob([JSON.stringify(mockData, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mock-raids.json";
  a.click();
  URL.revokeObjectURL(url);

  console.log("[ArcStats] Exported", mockData.raids.length, "raids");
}

/**
 * Update cache status display
 */
function updateCacheStatus() {
  const statusEl = document.getElementById("arcCacheStatus");
  if (!statusEl) return;

  const cacheStatus = getCacheStatus();
  if (cacheStatus.exists && cacheStatus.age !== null) {
    const ageMinutes = Math.round(cacheStatus.age / 60000);
    statusEl.textContent = `⚡ Cached (${ageMinutes}m ago)`;
    statusEl.className = "text-[10px] text-green-500 mt-1";
  } else {
    statusEl.textContent = "📡 No cache";
    statusEl.className = "text-[10px] text-muted-foreground mt-1";
  }
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
      let survivalColor = "text-red-500";
      if (m.survivalRate > 0.7) survivalColor = "text-green-500";
      else if (m.survivalRate > 0.5) survivalColor = "text-yellow-400";
      const srPct = Math.round(m.survivalRate * 100);

      return `
            <div class="items-center py-1 border-b border-muted/20" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 0.5rem;">

                <!-- MAP NAME -->
                <div class="text-sm">${m.name}</div>

                <!-- PROFIT -->
                <div class="text-sm font-bold text-right ${profitColor}">
                    ${m.profit >= 0 ? "+" : ""}${fmtRaw(m.profit)}
                </div>

                <!-- SURVIVAL PERCENTAGE -->
                <div class="text-sm text-right font-semibold ${survivalColor}">
                    ${srPct}%
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
