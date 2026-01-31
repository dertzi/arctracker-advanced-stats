/**
 * UI Event Handlers
 * Pure functions for handling UI events
 */

import { clearCache } from "../../utils/cache.js";

/**
 * Export raid data as JSON for development/testing
 * @param {any} stats - Statistics object with raid data
 */
export function handleExport(stats) {
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
 * Clear cache and refresh the page
 */
export function handleRefresh() {
  clearCache();
  globalThis.location.reload();
}
