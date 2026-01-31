import { fmtRaw } from "../../utils/dom.js";
import { isGridEnabled } from "../../ui/state.js";

import { mapX, mapY } from "./data.js";

/**
 * Draw chart base (grid, axes, labels)
 * @param {CanvasRenderingContext2D} ctx
 * @param {any} canvas
 * @param {any[]} data
 * @param {{min: number, max: number, range: number}} ranges
 * @param {number} width
 * @param {number} height
 */
export function drawChartBase(ctx, canvas, data, ranges, width, height) {
  ctx.clearRect(0, 0, width, height);

  const font = "10px sans-serif";
  ctx.font = font;
  ctx.fillStyle = "#888";

  const { min, max } = ranges;
  const gridCount = 4;

  if (isGridEnabled()) {
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridCount; i++) {
      const y = (height / gridCount) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  if (min < 0 && max > 0) {
    const zeroY = mapY(0, ranges, height);
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(width, zeroY);
    ctx.stroke();
    ctx.fillText("0", 4, zeroY - 2);
  }

  ctx.fillText(fmtRaw(max), 4, 10);
  ctx.fillText(fmtRaw(min), 4, height - 4);
}

/**
 * Draw chart lines and fill area
 * @param {CanvasRenderingContext2D} ctx
 * @param {any} canvas
 * @param {any[]} data
 * @param {{min: number, max: number, range: number}} ranges
 * @param {number} width
 * @param {number} height
 */
export function drawChartLines(ctx, canvas, data, ranges, width, height) {
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let i = 0; i < data.length; i++) {
    const x = mapX(i, data.length, width);
    const y = mapY(data[i].cumulative, ranges, height);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  const allPositive = ranges.min >= 0;
  const allNegative = ranges.max <= 0;

  let fillColor;
  if (allPositive) fillColor = "rgba(74, 222, 128, 0.25)";
  else if (allNegative) fillColor = "rgba(248, 113, 113, 0.25)";
  else fillColor = "rgba(255, 255, 255, 0.15)";

  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();

  for (let i = 0; i < data.length - 1; i++) {
    const x1 = mapX(i, data.length, width);
    const y1 = mapY(data[i].cumulative, ranges, height);
    const x2 = mapX(i + 1, data.length, width);
    const y2 = mapY(data[i + 1].cumulative, ranges, height);
    const isPositive = data[i].cumulative >= 0;

    ctx.strokeStyle = isPositive ? "#4ade80" : "#f87171";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

/**
 * Draw highlight markers for biggest gain/loss
 * @param {CanvasRenderingContext2D} ctx
 * @param {any} canvas
 * @param {any[]} data
 * @param {{min: number, max: number, range: number}} ranges
 * @param {number} width
 * @param {number} height
 */
export function drawChartHighlights(ctx, canvas, data, ranges, width, height) {
  const numericGains = data
    .map((d, i) => ({ gain: d.gain, index: i, cumulative: d.cumulative }))
    .filter((d) => typeof d.gain === "number");

  if (numericGains.length === 0) return;

  const maxGain = numericGains.reduce((a, b) => (b.gain > a.gain ? b : a), numericGains[0]);
  const maxLoss = numericGains.reduce((a, b) => (b.gain < a.gain ? b : a), numericGains[0]);

  /**
   * Draw a marker at a specific point
   * @param {any} pt
   * @param {string} color
   */
  function drawMarker(pt, color) {
    const x = mapX(pt.index, data.length, width);
    const y = mapY(pt.cumulative, ranges, height);

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  if (maxGain.gain > 0) drawMarker(maxGain, "#4ade80");
  if (maxLoss.gain < 0) drawMarker(maxLoss, "#f87171");
}
