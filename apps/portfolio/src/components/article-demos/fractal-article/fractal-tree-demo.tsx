'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { drawTree } from './draw-tree';

interface TreeParams {
  angle: number;
  depth: number;
  ratio: number;
  lean: number;
}

const SLIDERS: Array<{
  key: keyof TreeParams;
  label: string;
  min: number;
  max: number;
  format: (v: number) => string;
}> = [
  { key: 'angle', label: 'Branch angle', min: 8, max: 72, format: (v) => `${v}°` },
  { key: 'depth', label: 'Recursion depth', min: 3, max: 11, format: (v) => `${v}` },
  { key: 'ratio', label: 'Shrink ratio', min: 55, max: 82, format: (v) => (v / 100).toFixed(2) },
  { key: 'lean', label: 'Asymmetry', min: -20, max: 20, format: (v) => `${v}°` },
];

export function FractalTreeDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState<TreeParams>({
    angle: 28,
    depth: 9,
    ratio: 72,
    lean: 0,
  });

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    drawTree(
      ctx,
      rect.width / 2,
      rect.height - 8,
      rect.height * 0.24,
      -Math.PI / 2,
      params.depth,
      params.depth,
      (params.angle * Math.PI) / 180,
      params.ratio / 100,
      (params.lean * Math.PI) / 180,
    );
  }, [params]);

  useEffect(() => {
    render();
    window.addEventListener('resize', render);
    return () => window.removeEventListener('resize', render);
  }, [render]);

  return (
    <div className="not-prose bigger-container">
      <figure className="bg-card my-8 overflow-hidden rounded-2xl border shadow-xs">
        <div className="border-b px-4 py-2.5">
          <span className="text-muted-foreground font-mono text-[10.5px] tracking-[0.12em] uppercase">
            Playground · One rule, applied recursively
          </span>
        </div>
        <canvas ref={canvasRef} className="bg-muted/60 block h-95 w-full" />
        <div className="grid grid-cols-1 gap-x-7 gap-y-5 border-t px-6 py-5 sm:grid-cols-2">
          {SLIDERS.map(({ key, label, min, max, format }) => (
            <div key={key}>
              <label
                htmlFor={`fractal-${key}`}
                className="text-muted-foreground mb-2 flex justify-between font-mono text-[11px] tracking-[0.12em] uppercase"
              >
                {label}
                <output className="text-foreground">{format(params[key])}</output>
              </label>
              <input
                id={`fractal-${key}`}
                type="range"
                min={min}
                max={max}
                value={params[key]}
                onChange={(e) =>
                  setParams((p) => ({ ...p, [key]: Number(e.target.value) }))
                }
                className="accent-primary w-full"
              />
            </div>
          ))}
          <p className="text-muted-foreground col-span-full text-[13px] italic">
            Four parameters. Thousands of branches. This is what &ldquo;systemic&rdquo; actually means.
          </p>
        </div>
      </figure>
    </div>
  );
}