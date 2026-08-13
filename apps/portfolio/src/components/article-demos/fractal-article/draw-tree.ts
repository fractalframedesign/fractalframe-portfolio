export function drawTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  angle: number,
  depth: number,
  maxDepth: number,
  spread: number,
  ratio: number,
  lean: number,
) {
  if (depth === 0 || len < 1.5) return;
  const x2 = x + Math.cos(angle) * len;
  const y2 = y + Math.sin(angle) * len;
  const t = 1 - depth / maxDepth;
  const hue = 252 + t * 60;
  ctx.strokeStyle = `hsla(${hue}, 85%, ${58 + t * 14}%, ${0.3 + t * 0.32})`;
  ctx.lineWidth = Math.max(0.5, depth * 0.55);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  drawTree(ctx, x2, y2, len * ratio, angle - spread + lean, depth - 1, maxDepth, spread, ratio, lean);
  drawTree(ctx, x2, y2, len * ratio, angle + spread + lean, depth - 1, maxDepth, spread, ratio, lean);
}
