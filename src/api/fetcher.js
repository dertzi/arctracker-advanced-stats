import { sleep } from "../utils/dom.js";
import { getCachedRaids, setCachedRaids } from "../utils/cache.js";

// Mock mode - enabled for development builds
const USE_MOCK_DATA = false; // Will be replaced by build config

/**
 * Load mock raid data from local file
 * @returns {Promise<any[]>}
 */
async function loadMockData() {
  try {
    console.log("[ArcStats] Loading mock raid data...");
    const response = await fetch("/test-data/mock-raids.json");
    if (!response.ok) {
      throw new Error("Mock data file not found");
    }
    const data = await response.json();
    console.log(`[ArcStats] Loaded ${data.raids.length} mock raids`);
    console.log(`[ArcStats] Mock data captured: ${data.metadata.capturedAt}`);
    return data.raids;
  } catch (error) {
    console.error("[ArcStats] Failed to load mock ", error);
    console.error("[ArcStats] Run 'npm run capture-data' to create mock data file");
    return [];
  }
}

/**
 * Build API URL with pagination offset
 * @param {string} baseURL
 * @param {number} newOffset
 * @returns {string}
 */
function buildPageURL(baseURL, newOffset) {
  const url = new URL(baseURL, location.origin);
  url.searchParams.set("offset", String(newOffset));
  return url.toString();
}

/**
 * Fetch a single page of raid data
 * @param {string} url
 * @returns {Promise<{raids: any[], pagination: {hasMore: boolean}}>}
 */
async function fetchRaidPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "X-ArcStats": "1"
      }
    });
    if (!res.ok) throw new Error("Bad API response");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("[ArcStats] Error fetching page:", err);
    return { raids: [], pagination: { hasMore: false } };
  }
}

/**
 * Fetch all raid pages with pagination (with caching)
 * @param {string} baseURL
 * @param {boolean} forceRefresh - Skip cache and fetch fresh data
 * @returns {Promise<any[]>}
 */
export async function fetchAllRaids(baseURL, forceRefresh = false) {
  // Use mock data if enabled
  if (USE_MOCK_DATA) {
    return await loadMockData();
  }

  // Try cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = getCachedRaids(baseURL);
    if (cached) {
      return cached;
    }
  }

  // Fetch from API
  console.log("[ArcStats] Fetching full raid history with filters:", baseURL);

  /** @type {any[]} */
  let all = [];
  let offset = 0;
  const limit = 20;

  while (true) {
    const pageURL = buildPageURL(baseURL, offset);
    const data = await fetchRaidPage(pageURL);

    if (!data.raids || data.raids.length === 0) break;

    all = all.concat(data.raids);

    if (!data.pagination?.hasMore) break;

    offset += limit;
    await sleep(120);
  }

  console.log(`[ArcStats] Loaded ${all.length} total raids.`);

  // Cache the results
  setCachedRaids(baseURL, all);

  return all;
}
