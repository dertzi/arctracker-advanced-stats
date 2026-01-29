// This stores the latest filters detected from ArcTracker UI
/** @type {string | null} */
let latestRaidAPI = null;

// Callback defined by main logic
/** @type {((apiURL: string) => void) | null} */
let onFiltersChanged = null;

/**
 * Get the latest detected raid API URL
 * @returns {string | null}
 */
export function getLatestRaidAPI() {
  return latestRaidAPI;
}

/**
 * Get the current filters changed callback
 * @returns {((apiURL: string) => void) | null}
 */
export function getOnFiltersChanged() {
  return onFiltersChanged;
}

/**
 * Set the callback for when filters change
 * @param {(apiURL: string) => void} callback
 */
export function setOnFiltersChanged(callback) {
  onFiltersChanged = callback;
}

/**
 * Hook into the browser's fetch function to listen for ArcTracker API calls
 */
export function initAPIWatcher() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async function (resource, config) {
    try {
      if (
        typeof resource === "string" &&
        resource.includes("/api/raids?") &&
        !(config?.headers && "X-ArcStats" in config.headers)
      ) {
        // We captured the exact filtered request ArcTracker uses
        latestRaidAPI = resource;
        console.log("[ArcStats] Detected API:", resource);

        // Trigger full refresh when filters change
        if (onFiltersChanged) {
          onFiltersChanged(resource);
        }
      }
    } catch (err) {
      console.error("[ArcStats] API watch error:", err);
    }
    return originalFetch(resource, config);
  };
}
