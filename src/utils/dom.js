/**
 * Format large numbers (20.5K, 1.4M, etc.)
 * @param {number} num
 * @returns {string}
 */
export function fmt(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(2) + "K";
  return num.toLocaleString();
}

/**
 * Format raw integers with commas (no K/M)
 * @param {number} num
 * @returns {string}
 */
export function fmtRaw(num) {
  return num.toLocaleString();
}

/**
 * Convert date string to JS date
 * @param {string} str
 * @returns {Date}
 */
export function toDate(str) {
  return new Date(str);
}

/**
 * Sleep helper for safe API pacing
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Detect main ArcTracker content container
 * @returns {Element | null}
 */
export function getMainCardContainer() {
  const cards = document.querySelectorAll("div[data-slot='card-content']");
  return cards[0] || null;
}
