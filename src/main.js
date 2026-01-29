import { fetchAllRaids } from "./api/fetcher.js";
import { computeStats } from "./stats/engine.js";
import { renderStatsUI } from "./ui/renderer.js";
import { renderHistogram } from "./charts/histogram/index.js";
let filterTimer = null;
export function onFiltersChanged(apiURL) {
  clearTimeout(filterTimer);
  filterTimer = setTimeout(async () => {
    console.log("[ArcStats] Filters changed, refreshing...");
    const raids = await fetchAllRaids(apiURL);
    const stats = computeStats(raids);
    stats._rawRaidList = raids;
    renderStatsUI(stats);
    renderHistogram(stats);
  }, 300);
}
