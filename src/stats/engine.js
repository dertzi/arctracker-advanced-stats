import { toDate } from "../utils/dom.js";
import { MAP_NAMES } from "../utils/constants.js";

export function computeStats(raids) {
  if (!raids || raids.length === 0) {
    return {
      totalProfit: 0,
      totalRaids: 0,
      totalSurvived: 0,
      totalKIA: 0,
      avgPerRaid: 0,
      avgPerSurvive: 0,
      profitPerDay: 0,
      days: 1,
      cumulative: [],
      mapStatsArray: [],
      biggestGains: [],
      biggestLosses: []
    };
  }

  let totalProfit = 0;
  let totalSurvived = 0;
  let totalKIA = 0;
  let earliest = null;
  let latest = null;

  const mapStats = {};
  for (const id in MAP_NAMES) {
    mapStats[id] = {
      name: MAP_NAMES[id],
      raids: 0,
      survived: 0,
      profit: 0
    };
  }

  const profits = [];

  raids.forEach((r) => {
    const profit = r.effectiveValue ?? r.totalValueOverride ?? r.totalValue ?? 0;
    const date = toDate(r.raidDate);

    profits.push(profit);
    totalProfit += profit;

    if (r.status === "survived") totalSurvived++;
    else totalKIA++;

    if (date) {
      if (!earliest || date < earliest) earliest = date;
      if (!latest || date > latest) latest = date;
    }

    if (MAP_NAMES[r.mapId]) {
      if (!mapStats[r.mapId]) {
        mapStats[r.mapId] = {
          name: MAP_NAMES[r.mapId],
          raids: 0,
          survived: 0,
          profit: 0
        };
      }
      mapStats[r.mapId].raids++;
      mapStats[r.mapId].profit += profit;
      if (r.status === "survived") {
        mapStats[r.mapId].survived++;
      }
    }
  });

  const cumulative = [];
  let run = 0;
  profits.forEach((p) => {
    run += p;
    cumulative.push(run);
  });

  let days = 1;
  if (earliest && latest) {
    const diff = (latest - earliest) / (1000 * 60 * 60 * 24);
    days = Math.max(1, diff);
  }

  const totalRaids = raids.length;
  const gains = profits
    .filter((v) => v > 0)
    .sort((a, b) => b - a)
    .slice(0, 5);
  const losses = profits
    .filter((v) => v < 0)
    .sort((a, b) => a - b)
    .slice(0, 5);

  const mapStatsArray = Object.entries(mapStats).map(([mapId, m]) => {
    const sr = m.raids > 0 ? m.survived / m.raids : 0;
    return {
      id: mapId,
      name: m.name,
      profit: m.profit,
      raids: m.raids,
      survived: m.survived,
      survivalRate: sr
    };
  });

  return {
    totalProfit,
    totalRaids,
    totalSurvived,
    totalKIA,
    avgPerRaid: totalRaids ? totalProfit / totalRaids : 0,
    avgPerSurvive: totalSurvived ? totalProfit / totalSurvived : 0,
    profitPerDay: totalProfit / days,
    days,
    cumulative,
    mapStatsArray,
    biggestGains: gains,
    biggestLosses: losses
  };
}

export function sortMapStats(list) {
  return list.slice().sort((a, b) => {
    if (b.profit !== a.profit) return b.profit - a.profit;
    if (b.survivalRate !== a.survivalRate) return b.survivalRate - a.survivalRate;
    return b.raids - a.raids;
  });
}
