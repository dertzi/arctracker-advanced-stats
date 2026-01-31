/**
 * UI State Management
 * Centralized state for UI components
 */

/** @type {boolean} */
let gridEnabled = true;

/**
 * Check if grid is enabled
 * @returns {boolean}
 */
export function isGridEnabled() {
  return gridEnabled;
}

/**
 * Set grid enabled state
 * @param {boolean} value
 */
export function setGridEnabled(value) {
  gridEnabled = value;
}
