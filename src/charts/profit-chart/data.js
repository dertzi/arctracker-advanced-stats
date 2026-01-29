/**
 * Extract raid value with fallback to N/A
 * @param {any} raid
 * @returns {number | string}
 */
export function getRaidValue(raid) {
  if (typeof raid.totalValueOverride === "number") return raid.totalValueOverride;
  if (typeof raid.effectiveValue === "number") return raid.effectiveValue;
  return "N/A";
}

/**
 * Prepare chart data from raids (oldest to newest)
 * @param {any[]} raids
 * @returns {Array<{cumulative: number, gain: number | string, index: number}>}
 */
export function prepareChartData(raids) {
  /** @type {Array<{cumulative: number, gain: number | string, index: number}>} */
  const data = [];
  let cumulative = 0;

  // Reverse the raids array so oldest raids appear first (left side of chart)
  const reversedRaids = raids.slice().reverse();

  for (let i = 0; i < reversedRaids.length; i++) {
    const r = reversedRaids[i];
    const gain = getRaidValue(r);

    if (typeof gain === "number") {
      cumulative += gain;
    }

    data.push({
      cumulative,
      gain,
      index: i
    });
  }

  return data;
}

/**
 * Compute min/max ranges for chart
 * @param {any[]} data
 * @returns {{min: number, max: number, range: number}}
 */
export function computeChartRanges(data) {
  let minV = Infinity;
  let maxV = -Infinity;

  for (const d of data) {
    if (d.cumulative < minV) minV = d.cumulative;
    if (d.cumulative > maxV) maxV = d.cumulative;
  }

  if (minV === maxV) {
    minV -= 1;
    maxV += 1;
  }

  return {
    min: minV,
    max: maxV,
    range: maxV - minV
  };
}

/**
 * Map data value to Y coordinate
 * @param {number} value
 * @param {{min: number, range: number}} ranges
 * @param {number} height
 * @returns {number}
 */
export function mapY(value, ranges, height) {
  const { min, range } = ranges;
  return height - ((value - min) / range) * height;
}

/**
 * Map data index to X coordinate
 * @param {number} index
 * @param {number} total
 * @param {number} width
 * @returns {number}
 */
export function mapX(index, total, width) {
  if (total <= 1) return 0;
  return (index / (total - 1)) * width;
}
