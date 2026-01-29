import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

const banner = `// ==UserScript==
// @name         ArcTracker Advanced Stats
// @namespace    violentmonkey
// @version      1.0
// @description  Full raid history stats, maps, charts, filter-sync, pagination, gains/losses for ArcTracker.
// @match        https://arctracker.io/raid-history*
// @grant        none
// ==/UserScript==
`;

export default {
  input: "src/index.js",
  output: {
    file: "dist/arctracker-advanced-stats.user.js",
    format: "iife",
    banner,
    compact: false
  },
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false
  },
  onwarn(warning, warn) {
    if (warning.code === "UNUSED_EXTERNAL_IMPORT") {
      console.warn("Unused import:", warning.source);
    }
    warn(warning);
  },
  plugins: [
    nodeResolve(),
    terser({
      format: {
        comments: /UserScript/
      }
    })
  ]
};
