import { fetchAllRaids } from "./api/fetcher.js";
import { computeStats } from "./stats/engine.js";
import { renderStatsUI } from "./ui/renderer.js";
import { renderHistogram } from "./charts/histogram/index.js";

/** @type {number | null} */
let filterTimer = null;

/**
 * Handle filter changes with debouncing
 * @param {string} apiURL
 */
export function onFiltersChanged(apiURL) {
  if (filterTimer !== null) {
    clearTimeout(filterTimer);
  }
  filterTimer = setTimeout(async () => {
    console.log("[ArcStats] Filters changed, refreshing...");
    const raids = await fetchAllRaids(apiURL);
    const stats = computeStats(raids);
    // @ts-ignore - Adding custom property to stats object
    stats._rawRaidList = raids;
    renderStatsUI(stats);
    renderHistogram(stats);
  }, 300);
}
