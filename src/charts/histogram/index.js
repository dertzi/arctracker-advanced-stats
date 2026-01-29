import { fmtRaw } from "../../utils/dom.js";

import { buildHistogramData } from "./data.js";

function drawHistogram(stats) {
  const raids = stats._rawRaidList;
  if (!raids || raids.length === 0) return;

  const canvas = document.getElementById("arcHistogram");
  const tooltip = document.getElementById("arcHistTooltip");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  canvas.width = width;
  canvas.height = height;

  // Get buckets
  const buckets = buildHistogramData(raids);
  if (!buckets || buckets.length === 0) return;

  canvas._histBuckets = buckets;
  canvas._histBucketsRaw = raids;

  const maxCount = Math.max(...buckets.map((b) => b.count), 1);
  const barWidth = width / buckets.length;
  const padding = Math.max(2, barWidth * 0.18);

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Draw axis line
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ctx.moveTo(0, height - 1);
  ctx.lineTo(width, height - 1);
  ctx.stroke();

  // Draw each bar
  buckets.forEach((b, i) => {
    const x = i * barWidth + padding / 2;
    const pct = b.count / maxCount;
    const barH = pct * (height * 0.75);
    const y = height - barH;

    // Color
    let fill;
    if (b.type === "loss") {
      fill = "rgba(248, 113, 113, 0.55)"; // red
    } else if (b.type === "gain") {
      fill = "rgba(74, 222, 128, 0.55)"; // green
    } else {
      fill = "rgba(148, 163, 184, 0.45)"; // grey for zero-only bucket
    }

    // Draw bar
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, barWidth - padding, barH);

    // Draw labels below bars
    ctx.fillStyle = "#ccc";
    ctx.font = "10px sans-serif";

    if (barWidth > 55 || i % 2 === 0) {
      ctx.fillText(`${fmtRaw(b.min)} → ${fmtRaw(b.max)}`, x, height - 4);
    }
  });
}

function enableHistogramHover(canvas, tooltip) {
  const buckets = canvas._histBuckets;
  if (!buckets || buckets.length === 0) return;

  const width = canvas.width;
  const height = canvas.height;
  const barWidth = width / buckets.length;

  canvas.onmousemove = (ev) => {
    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left;

    const i = Math.floor(x / barWidth);
    if (i < 0 || i >= buckets.length) {
      tooltip.style.display = "none";
      drawHistogram({ _rawRaidList: canvas._histBucketsRaw });
      return;
    }

    const b = buckets[i];

    // Tooltip text
    let labelRange;
    if (b.type === "zero") {
      labelRange = `0 → 0`;
    } else {
      labelRange = `${fmtRaw(b.min)} → ${fmtRaw(b.max)}`;
    }

    const typeLabel = b.type === "loss" ? "Loss" : b.type === "gain" ? "Gain" : "Zero";

    tooltip.innerHTML = `
                Range: ${labelRange}<br>
                Raids: ${b.count}<br>
                Median: ${fmtRaw(b.median)}<br>
                Type: ${typeLabel}
            `;

    // Position
    let tipX = x + 12;
    let tipY = 16;

    if (tipX + tooltip.offsetWidth > width) {
      tipX = x - tooltip.offsetWidth - 12;
    }

    tooltip.style.left = tipX + "px";
    tooltip.style.top = tipY + "px";
    tooltip.style.display = "block";

    // Redraw with highlight
    drawHistogram({ _rawRaidList: canvas._histBucketsRaw });

    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;

    ctx.strokeRect(i * barWidth + 1, 1, barWidth - 2, height - 2);

    ctx.restore();
  };

  canvas.onmouseleave = () => {
    tooltip.style.display = "none";
    drawHistogram({ _rawRaidList: canvas._histBucketsRaw });
  };
}

export function renderHistogram(stats) {
  const canvas = document.getElementById("arcHistogram");
  if (!canvas) return;

  drawHistogram(stats);

  const tooltip = document.getElementById("arcHistTooltip");
  enableHistogramHover(canvas, tooltip);
}
