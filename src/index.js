import { initAPIWatcher, setOnFiltersChanged, getLatestRaidAPI } from "./api/watcher.js";
import { onFiltersChanged } from "./main.js";
import { injectStyles } from "./ui/styles.js";

(function () {
  "use strict";
  console.log("[ArcStats] Initializing...");

  // Inject custom styles first to override ArcTracker's grid rules
  injectStyles();

  initAPIWatcher();
  setOnFiltersChanged(onFiltersChanged);
  const latestAPI = getLatestRaidAPI();
  if (latestAPI) {
    onFiltersChanged(latestAPI);
  }
  console.log("[ArcStats] Ready!");
})();
