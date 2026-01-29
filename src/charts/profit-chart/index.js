import { prepareChartData, computeChartRanges } from "./data.js";
import { drawChartBase, drawChartLines, drawChartHighlights } from "./drawing.js";
import { enableChartHover } from "./interactivity.js";

export function drawProfitChart(stats) {
  const raids = stats._rawRaidList;
  if (!raids || raids.length === 0) return;

  const canvas = document.getElementById("arcChart");
  const tip = document.getElementById("arcTooltip");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width;
  canvas.height = height;

  const data = prepareChartData(raids);
  const ranges = computeChartRanges(data);

  canvas._chartData = data;
  canvas._chartRanges = ranges;
  canvas._stats = stats;

  drawChartBase(ctx, canvas, data, ranges, width, height);
  drawChartLines(ctx, canvas, data, ranges, width, height);
  drawChartHighlights(ctx, canvas, data, ranges, width, height);
  enableChartHover(canvas, tip, stats, drawProfitChart);
}
