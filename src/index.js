import { initAPIWatcher, setOnFiltersChanged, getLatestRaidAPI } from "./api/watcher.js";
import { onFiltersChanged } from "./main.js";
(function () {
  "use strict";
  console.log("[ArcStats] Initializing...");
  initAPIWatcher();
  setOnFiltersChanged(onFiltersChanged);
  const latestAPI = getLatestRaidAPI();
  if (latestAPI) {
    onFiltersChanged(latestAPI);
  }
  console.log("[ArcStats] Ready!");
})();
