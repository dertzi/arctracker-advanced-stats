import { fmtRaw } from "../../utils/dom.js";

import { mapX } from "./data.js";

export function findNearestPoint(mouseX, data, width) {
  const total = data.length;
  if (total <= 1) return 0;
  const guess = Math.round((mouseX / width) * (total - 1));
  return Math.max(0, Math.min(total - 1, guess));
}

export function enableChartHover(canvas, tooltip, stats, drawFunction) {
  const data = canvas._chartData;
  const ranges = canvas._chartRanges;

  if (!data || !ranges) return;

  canvas.onmousemove = (ev) => {
    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const width = canvas.width;
    const height = canvas.height;

    const idx = findNearestPoint(x, data, width);
    const point = data[idx];
    const raidNum = idx + 1;
    const cumulative = point.cumulative;
    let gain = point.gain;
    if (gain === "N/A") gain = "N/A";
    else gain = fmtRaw(gain);

    tooltip.innerHTML = `Raid #${raidNum}<br>Cumulative: ${fmtRaw(cumulative)}<br>Gain/Loss: ${gain}`;

    let tipX = x + 10;
    let tipY = y + 10;

    if (tipX + tooltip.offsetWidth > width) tipX = x - tooltip.offsetWidth - 10;
    if (tipY + tooltip.offsetHeight > height) tipY = y - tooltip.offsetHeight - 10;

    tooltip.style.left = tipX + "px";
    tooltip.style.top = tipY + "px";
    tooltip.style.display = "block";

    const ctx = canvas.getContext("2d");
    drawFunction(stats);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  canvas.onmouseleave = () => {
    tooltip.style.display = "none";
    drawFunction(stats);
  };
}
