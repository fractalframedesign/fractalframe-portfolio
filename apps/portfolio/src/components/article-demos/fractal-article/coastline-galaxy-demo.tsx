'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

function midpointDisplace(
  points: Array<{ x: number; y: number }>,
  roughness: number,
  depth: number,
): Array<{ x: number; y: number }> {
  if (depth === 0) return points;
  const next: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    next.push(a);
    next.push({
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2 + (Math.random() - 0.5) * roughness,
    });
  }
  next.push(points[points.length - 1]);
  return midpointDisplace(next, roughness / 2, depth - 1);
}

export function CoastlineGalaxyDemo() {
  const coastRef = useRef<HTMLCanvasElement>(null);
  const galaxyRef = useRef<HTMLCanvasElement>(null);
  const [coastDepth, setCoastDepth] = useState(8);
  const [galaxyDepth, setGalaxyDepth] = useState(8);

  const sizeCanvas = (canvas: HTMLCanvasElement) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: rect.width, h: rect.height };
  };

  const renderCoast = useCallback(() => {
    const canvas = coastRef.current;
    if (!canvas) return;
    const sized = sizeCanvas(canvas);
    if (!sized) return;
    const { ctx, w, h } = sized;
    ctx.clearRect(0, 0, w, h);
    // three self-similar shorelines, each a coarser zoom of the same rule
    const layers = [
      { depth: coastDepth, base: 0.42, rough: h * 0.5, alpha: 0.9 },
      { depth: Math.max(1, coastDepth - 2), base: 0.6, rough: h * 0.36, alpha: 0.45 },
      { depth: Math.max(1, coastDepth - 4), base: 0.76, rough: h * 0.24, alpha: 0.22 },
    ];
    layers.forEach(({ depth, base, rough, alpha }, i) => {
      const line = midpointDisplace(
        [
          { x: -4, y: h * base },
          { x: w + 4, y: h * base },
        ],
        rough,
        depth,
      );
      const hue = 252 + i * 26;
      ctx.strokeStyle = `hsla(${hue}, 85%, 66%, ${alpha})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      line.forEach((p, j) => (j === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
    });
  }, [coastDepth]);

  const renderGalaxy = useCallback(() => {
    const canvas = galaxyRef.current;
    if (!canvas) return;
    const sized = sizeCanvas(canvas);
    if (!sized) return;
    const { ctx, w, h } = sized;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const arms = 3;
    const maxR = Math.min(w, h) * 0.46;
    // star detail doubles with every recursion level
    const stars = 2 ** galaxyDepth;
    for (let arm = 0; arm < arms; arm++) {
      const offset = (arm * Math.PI * 2) / arms;
      for (let i = 0; i < stars; i++) {
        const t = i / stars;
        const theta = t * Math.PI * 3.2 + offset;
        const r = maxR * Math.pow(t, 0.72);
        const jitter = (Math.random() - 0.5) * r * 0.22;
        const x = cx + Math.cos(theta) * (r + jitter);
        const y = cy + Math.sin(theta) * (r + jitter);
        const hue = 252 + t * 60;
        ctx.fillStyle = `hsla(${hue}, 85%, ${66 + t * 10}%, ${0.75 - t * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.6, 1.8 - t * 1.2), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // bright core
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.2);
    core.addColorStop(0, 'hsla(260, 90%, 80%, 0.9)');
    core.addColorStop(1, 'hsla(260, 90%, 80%, 0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }, [galaxyDepth]);

  useEffect(() => {
    const renderAll = () => {
      renderCoast();
      renderGalaxy();
    };
    renderAll();
    window.addEventListener('resize', renderAll);
    return () => window.removeEventListener('resize', renderAll);
  }, [renderCoast, renderGalaxy]);

  return (
    <div className="not-prose container py-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <figure className="space-y-3">
          <button
            type="button"
            onClick={renderCoast}
            aria-label="Redraw coastline"
            className="block w-full cursor-pointer"
            title="Click to redraw"
          >
            <canvas ref={coastRef} className="block h-44 w-full" aria-hidden />
          </button>
          <div className="mx-auto w-full max-w-60">
            <label
              htmlFor="coast-depth"
              className="text-muted-foreground mb-2 flex justify-between font-mono text-[11px] tracking-[0.12em] uppercase"
            >
              Recursion depth
              <output className="text-foreground">{coastDepth}</output>
            </label>
            <input
              id="coast-depth"
              type="range"
              min={1}
              max={10}
              value={coastDepth}
              onChange={(e) => setCoastDepth(Number(e.target.value))}
              className="accent-primary w-full"
            />
          </div>
          <figcaption className="text-muted-foreground text-center font-mono text-[11px] tracking-[0.12em] uppercase">
            Coastline · same rule at three zooms — tap to redraw
          </figcaption>
        </figure>
        <figure className="space-y-3">
          <canvas ref={galaxyRef} className="block h-44 w-full" aria-hidden />
          <div className="mx-auto w-full max-w-60">
            <label
              htmlFor="galaxy-depth"
              className="text-muted-foreground mb-2 flex justify-between font-mono text-[11px] tracking-[0.12em] uppercase"
            >
              Recursion depth
              <output className="text-foreground">{galaxyDepth}</output>
            </label>
            <input
              id="galaxy-depth"
              type="range"
              min={4}
              max={10}
              value={galaxyDepth}
              onChange={(e) => setGalaxyDepth(Number(e.target.value))}
              className="accent-primary w-full"
            />
          </div>
          <figcaption className="text-muted-foreground text-center font-mono text-[11px] tracking-[0.12em] uppercase">
            Galaxy · one spiral, every scale
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
