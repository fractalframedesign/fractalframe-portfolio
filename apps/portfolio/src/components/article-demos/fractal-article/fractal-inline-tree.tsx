'use client';

import { useEffect, useRef, useState } from 'react';

import { drawTree } from './draw-tree';

export function FractalInlineTree() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [depth, setDepth] = useState(8);
  const depthRef = useRef(depth);
  const renderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const state = { grow: reduceMotion ? 1 : 0, sway: 0, targetSway: 0 };
    let rafId = 0;

    function render() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      const maxDepth = depthRef.current;
      const grownDepth = Math.max(2, Math.round(maxDepth * state.grow));
      const spread = 0.48 + state.sway * 0.1;
      ctx.lineCap = 'round';
      drawTree(
        ctx,
        rect.width / 2,
        rect.height + 6,
        rect.height * 0.3,
        -Math.PI / 2 + state.sway * 0.12,
        grownDepth,
        maxDepth,
        spread,
        0.68,
        state.sway * 0.035,
      );
    }

    renderRef.current = render;

    function loop() {
      let dirty = false;
      if (state.grow < 1) {
        state.grow = Math.min(1, state.grow + 0.012);
        dirty = true;
      }
      const d = state.targetSway - state.sway;
      if (Math.abs(d) > 0.001) {
        state.sway += d * 0.06;
        dirty = true;
      }
      if (dirty) render();
      rafId = requestAnimationFrame(loop);
    }

    function handlePointerMove(e: PointerEvent) {
      state.targetSway = (e.clientX / window.innerWidth - 0.5) * 2;
    }

    render();
    if (!reduceMotion) {
      rafId = requestAnimationFrame(loop);
      window.addEventListener('pointermove', handlePointerMove, {
        passive: true,
      });
    }
    window.addEventListener('resize', render);

    return () => {
      renderRef.current = null;
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', render);
    };
  }, []);

  return (
    <div className="not-prose container space-y-4 py-6">
      <canvas ref={canvasRef} className="block h-84 w-full md:h-96" aria-hidden />
      <div className="mx-auto w-full max-w-xs">
        <label
          htmlFor="inline-tree-depth"
          className="text-muted-foreground mb-2 flex justify-between font-mono text-[11px] tracking-[0.12em] uppercase"
        >
          Recursion depth
          <output className="text-foreground">{depth}</output>
        </label>
        <input
          id="inline-tree-depth"
          type="range"
          min={3}
          max={10}
          value={depth}
          onChange={(e) => {
            const value = Number(e.target.value);
            depthRef.current = value;
            setDepth(value);
            renderRef.current?.();
          }}
          className="accent-primary w-full"
        />
      </div>
    </div>
  );
}
