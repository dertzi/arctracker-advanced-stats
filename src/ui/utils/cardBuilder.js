/**
 * UI Card Builder Utilities
 * Provides reusable functions for creating standardized UI elements
 */

/**
 * Create a standardized card element
 * @param {Object} [options] - Configuration options
 * @param {number} [options.span] - Column span (1-4) for arc-span-* class
 * @returns {HTMLElement} Card element
 */
export function createCard(options = {}) {
  const card = document.createElement("div");
  card.className = "rounded-lg border bg-card p-3";

  if (options.span) {
    card.classList.add(`arc-span-${options.span}`);
  }

  return card;
}

/**
 * Create a grid row container
 * @param {string} layoutClass - Layout class (arc-row-4cols, arc-row-2cols, arc-row-1col)
 * @returns {HTMLElement} Row container element
 */
export function createRow(layoutClass) {
  const row = document.createElement("div");
  row.className = layoutClass;
  return row;
}

/**
 * Create a styled button
 * @param {string} label - Button text/label
 * @param {(event: PointerEvent) => void} handler - Click event handler
 * @returns {HTMLElement} Button element
 */
export function createButton(label, handler) {
  const btn = document.createElement("button");
  btn.className = "text-[10px] px-2 py-1 border rounded hover:bg-accent";
  btn.textContent = label;
  btn.onclick = handler;
  return btn;
}

/**
 * Create a card header element
 * @param {string} title - Header title text
 * @returns {HTMLElement} Header element
 */
export function createCardHeader(title) {
  const header = document.createElement("div");
  header.className = "text-xs text-muted-foreground mb-2";
  header.textContent = title;
  return header;
}
