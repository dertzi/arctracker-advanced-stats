/**
 * DevToolsPanel Component
 * Development tools section with export and refresh functionality
 */

import { createButton } from "../utils/cardBuilder.js";
import { handleExport, handleRefresh } from "../utils/eventHandlers.js";
import { getCacheStatus } from "../../utils/cache.js";

/**
 * Render development tools panel
 * @param {any} stats - Statistics object
 * @returns {HTMLElement} Panel element
 */
export function render(stats) {
  const panel = document.createElement("div");
  panel.className = "mt-3 pt-3 border-t border-muted/20";

  // Header
  const header = document.createElement("div");
  header.className = "text-xs text-muted-foreground mb-2";
  header.textContent = "Dev Tools";

  // Buttons container
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "flex gap-1";

  // Export button
  const exportBtn = createButton("💾 Export", () => handleExport(stats));
  exportBtn.className += " flex-1";
  exportBtn.title = "Export data for development";

  // Refresh button
  const refreshBtn = createButton("🔄 Refresh", handleRefresh);
  refreshBtn.className += " flex-1";
  refreshBtn.title = "Clear cache & refresh";

  buttonContainer.appendChild(exportBtn);
  buttonContainer.appendChild(refreshBtn);

  // Cache status
  const statusEl = document.createElement("div");
  statusEl.className = "text-[10px] text-muted-foreground mt-1";
  updateCacheStatus(statusEl);

  // Assemble panel
  panel.appendChild(header);
  panel.appendChild(buttonContainer);
  panel.appendChild(statusEl);

  return panel;
}

/**
 * Update cache status display
 * @param {HTMLElement} element - Status display element
 */
function updateCacheStatus(element) {
  const status = getCacheStatus();
  if (status.exists && status.age !== null) {
    const ageMinutes = Math.round(status.age / 60000);
    element.textContent = `⚡ Cached (${ageMinutes}m ago)`;
    element.className = "text-[10px] text-green-500 mt-1";
  } else {
    element.textContent = "📡 No cache";
    element.className = "text-[10px] text-muted-foreground mt-1";
  }
}
