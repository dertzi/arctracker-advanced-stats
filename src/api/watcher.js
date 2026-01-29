// This stores the latest filters detected from ArcTracker UI
let latestRaidAPI = null;

// Callback defined by main logic
let onFiltersChanged = null;

// Getter functions
export function getLatestRaidAPI() {
  return latestRaidAPI;
}

export function getOnFiltersChanged() {
  return onFiltersChanged;
}

export function setOnFiltersChanged(callback) {
  onFiltersChanged = callback;
}

// Hook into the browser's fetch function to listen for ArcTracker API calls
export function initAPIWatcher() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async function (resource, config) {
    try {
      if (
        typeof resource === "string" &&
        resource.includes("/api/raids?") &&
        !config?.headers?.["X-ArcStats"]
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
