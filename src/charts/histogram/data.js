/**
 * Extract gain/loss value from raid
 * @param {any} raid
 * @returns {number}
 */
function extractGainValue(raid) {
  if (typeof raid.totalValueOverride === "number") return raid.totalValueOverride;
  if (typeof raid.effectiveValue === "number") return raid.effectiveValue;
  return 0;
}

/**
 * Round value to nice step
 * @param {number} value
 * @param {number} step
 * @returns {number}
 */
function niceRound(value, step) {
  return Math.round(value / step) * step;
}

/**
 * Calculate rounding step based on range
 * @param {number} range
 * @returns {number}
 */
function roundingStep(range) {
  if (range < 20000) return 500;
  if (range < 80000) return 1000;
  if (range < 200000) return 2500;
  return 5000;
}

/**
 * Calculate optimal number of bins using Sturges' formula
 * @param {number} n
 * @returns {number}
 */
function sturgesBins(n) {
  return Math.max(4, Math.min(15, Math.ceil(Math.log2(n) + 1)));
}

/**
 * Adjust bin distribution to match target total
 * @param {number} binNeg
 * @param {number} binPos
 * @param {number} binZero
 * @param {number} totalBins
 * @returns {{binNeg: number, binPos: number}}
 */
function adjustBinDistribution(binNeg, binPos, binZero, totalBins) {
  const diff = binNeg + binPos + binZero - totalBins;

  if (diff > 0) {
    if (binPos > binNeg) return { binNeg, binPos: binPos - diff };
    return { binNeg: binNeg - diff, binPos };
  }

  if (diff < 0) {
    if (binPos > binNeg) return { binNeg, binPos: binPos + -diff };
    return { binNeg: binNeg + -diff, binPos };
  }

  return { binNeg, binPos };
}

/**
 * Create histogram buckets
 * @param {number[]} negatives
 * @param {number[]} positives
 * @param {number} binNeg
 * @param {number} binPos
 * @param {number} stepNeg
 * @param {number} stepPos
 * @returns {Array<{min: number, max: number, values: number[], type: string}>}
 */
function createBuckets(negatives, positives, binNeg, binPos, stepNeg, stepPos) {
  const buckets = [];

  if (negatives.length > 0) {
    const minNeg = Math.min(...negatives);
    const maxNeg = Math.max(...negatives);
    const negStep = (maxNeg - minNeg) / binNeg;

    for (let i = 0; i < binNeg; i++) {
      buckets.push({
        min: niceRound(minNeg + i * negStep, stepNeg),
        max: niceRound(minNeg + (i + 1) * negStep, stepNeg),
        values: [],
        type: "loss"
      });
    }
  }

  buckets.push({ min: 0, max: 0, values: [], type: "zero" });

  if (positives.length > 0) {
    const minPos = Math.min(...positives);
    const maxPos = Math.max(...positives);
    const posStep = (maxPos - minPos) / binPos;

    for (let i = 0; i < binPos; i++) {
      buckets.push({
        min: niceRound(minPos + i * posStep, stepPos),
        max: niceRound(minPos + (i + 1) * posStep, stepPos),
        values: [],
        type: "gain"
      });
    }
  }

  return buckets;
}

/**
 * Distribute values into buckets
 * @param {number[]} gains
 * @param {Array<{min: number, max: number, values: number[], type: string}>} buckets
 */
function distributeValuesIntoBuckets(gains, buckets) {
  for (const v of gains) {
    for (const b of buckets) {
      if (b.type === "zero" && v === 0) {
        b.values.push(v);
        break;
      }
      if (v >= b.min && v < b.max && b.type !== "zero") {
        b.values.push(v);
        break;
      }
    }
  }
}

/**
 * Calculate median of sorted values
 * @param {number[]} values
 * @returns {number}
 */
function calculateMedian(values) {
  if (values.length === 0) return 0;
  const sorted = values.slice().sort((a, c) => a - c);
  return sorted[Math.floor(values.length / 2)];
}

/**
 * Format bucket output
 * @param {Array<{min: number, max: number, values: number[], type: string}>} buckets
 * @returns {Array<{min: number, max: number, count: number, median: number, type: string}>}
 */
function formatBucketOutput(buckets) {
  return buckets.map((b) => ({
    min: b.min,
    max: b.max,
    count: b.values.length,
    median: calculateMedian(b.values),
    type: b.type
  }));
}

/**
 * Build histogram bucket data from raids
 * @param {any[]} raids
 * @returns {Array<{min: number, max: number, count: number, median: number, type: string}>}
 */
export function buildHistogramData(raids) {
  if (!raids || raids.length === 0) return [];

  const gains = raids.map(extractGainValue);
  const negatives = gains.filter((g) => g < 0);
  const positives = gains.filter((g) => g > 0);

  const total = gains.length;
  const totalBins = sturgesBins(total);

  let binNeg = Math.max(1, Math.round((negatives.length / total) * (totalBins - 1)));
  let binPos = Math.max(1, Math.round((positives.length / total) * (totalBins - 1)));
  const binZero = 1;

  const adjusted = adjustBinDistribution(binNeg, binPos, binZero, totalBins);
  binNeg = adjusted.binNeg;
  binPos = adjusted.binPos;

  const minNeg = Math.min(...negatives, 0);
  const maxNeg = Math.max(...negatives, 0);
  const minPos = Math.min(...positives, 0);
  const maxPos = Math.max(...positives, 0);

  const stepNeg = roundingStep(Math.abs(minNeg - maxNeg));
  const stepPos = roundingStep(Math.abs(maxPos - minPos));

  const buckets = createBuckets(negatives, positives, binNeg, binPos, stepNeg, stepPos);
  distributeValuesIntoBuckets(gains, buckets);

  return formatBucketOutput(buckets);
}
