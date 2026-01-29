import { sleep } from "../utils/dom.js";

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
 * Fetch all raid pages with pagination
 * @param {string} baseURL
 * @returns {Promise<any[]>}
 */
export async function fetchAllRaids(baseURL) {
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
  return all;
}
