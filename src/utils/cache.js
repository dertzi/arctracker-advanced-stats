/**
 * LocalStorage caching for raid data
 * Reduces API calls by caching fetched raid data
 */

const CACHE_KEY = "arcstats_raid_cache";
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Get cached raid data if valid
 * @param {string} apiUrl - The API URL used as cache key
 * @returns {any[] | null} - Cached raids or null if invalid/missing
 */
export function getCachedRaids(apiUrl) {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { timestamp, filters, data } = JSON.parse(cached);
    const age = Date.now() - new Date(timestamp).getTime();

    // Check if cache is still valid
    if (age < CACHE_TTL && filters === apiUrl) {
      console.log(`[ArcStats] Using cached data (${Math.round(age / 60000)}m old)`);
      return data;
    }

    console.log("[ArcStats] Cache expired or filters changed");
    return null;
  } catch (error) {
    console.error("[ArcStats] Cache read error:", error);
    return null;
  }
}

/**
 * Save raid data to cache
 * @param {string} apiUrl - The API URL used as cache key
 * @param {any[]} raids - The raid data to cache
 */
export function setCachedRaids(apiUrl, raids) {
  const cache = {
    timestamp: new Date().toISOString(),
    filters: apiUrl,
    raids
  };

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log(`[ArcStats] Cached ${raids.length} raids`);
  } catch (error) {
    console.error("[ArcStats] Cache write error:", error);
    // If storage is full, try to clear and retry once
    if (error instanceof Error && error.name === "QuotaExceededError") {
      clearCache();
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch (retryError) {
        console.error("[ArcStats] Cache write failed even after clearing:", retryError);
      }
    }
  }
}

/**
 * Clear the raid data cache
 */
export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
  console.log("[ArcStats] Cache cleared");
}

/**
 * Get cache status information
 * @returns {{exists: boolean, age: number | null, raidCount: number | null}}
 */
export function getCacheStatus() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return { exists: false, age: null, raidCount: null };
    }

    const { timestamp, data } = JSON.parse(cached);
    const age = Date.now() - new Date(timestamp).getTime();

    return {
      exists: true,
      age: age,
      raidCount: data?.length || 0
    };
  } catch (error) {
    console.error("[ArcStats] Cache status check error:", error);
    return { exists: false, age: null, raidCount: null };
  }
}
