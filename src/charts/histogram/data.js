function extractGainValue(raid) {
  if (typeof raid.totalValueOverride === "number") return raid.totalValueOverride;
  if (typeof raid.effectiveValue === "number") return raid.effectiveValue;
  return 0;
}

function niceRound(value, step) {
  return Math.round(value / step) * step;
}

function roundingStep(range) {
  if (range < 20000) return 500;
  if (range < 80000) return 1000;
  if (range < 200000) return 2500;
  return 5000;
}

function sturgesBins(n) {
  return Math.max(4, Math.min(15, Math.ceil(Math.log2(n) + 1)));
}

export function buildHistogramData(raids) {
  if (!raids || raids.length === 0) return [];

  const gains = raids.map(extractGainValue);
  const negatives = gains.filter((g) => g < 0);
  const zeros = gains.filter((g) => g === 0);
  const positives = gains.filter((g) => g > 0);

  const total = gains.length;
  const totalBins = sturgesBins(total);

  let binNeg = Math.max(1, Math.round((negatives.length / total) * (totalBins - 1)));
  let binPos = Math.max(1, Math.round((positives.length / total) * (totalBins - 1)));
  const binZero = 1;

  let diff = binNeg + binPos + binZero - totalBins;
  if (diff > 0) {
    if (binPos > binNeg) binPos -= diff;
    else binNeg -= diff;
  } else if (diff < 0) {
    if (binPos > binNeg) binPos += -diff;
    else binNeg += -diff;
  }

  const minNeg = Math.min(...negatives, 0);
  const maxNeg = Math.max(...negatives, 0);
  const minPos = Math.min(...positives, 0);
  const maxPos = Math.max(...positives, 0);

  const stepNeg = roundingStep(Math.abs(minNeg - maxNeg));
  const stepPos = roundingStep(Math.abs(maxPos - minPos));

  const buckets = [];
  if (negatives.length > 0) {
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

  return buckets.map((b) => ({
    min: b.min,
    max: b.max,
    count: b.values.length,
    median: b.values.length
      ? b.values.slice().sort((a, c) => a - c)[Math.floor(b.values.length / 2)]
      : 0,
    type: b.type
  }));
}
