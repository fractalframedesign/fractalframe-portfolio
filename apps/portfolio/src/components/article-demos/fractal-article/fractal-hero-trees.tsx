'use client';

import { useEffect, useRef } from 'react';

import { drawTree } from './draw-tree';

export function FractalHeroTrees() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      const maxDepth = 8;
      const depth = Math.max(2, Math.round(maxDepth * state.grow));
      const spread = 0.48 + state.sway * 0.1;
      ctx.lineCap = 'round';
      drawTree(
        ctx,
        rect.width * 0.82,
        rect.height + 10,
        Math.min(rect.height * 0.24, 185),
        -Math.PI / 2 + state.sway * 0.15,
        depth,
        maxDepth,
        spread,
        0.69,
        state.sway * 0.04,
      );
      drawTree(
        ctx,
        rect.width * 0.08,
        rect.height + 10,
        Math.min(rect.height * 0.14, 110),
        -Math.PI / 2 - state.sway * 0.1,
        Math.max(2, depth - 2),
        maxDepth,
        spread,
        0.67,
        -state.sway * 0.03,
      );
    }

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
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', render);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-128 overflow-hidden opacity-30 md:h-144 dark:opacity-50"
    >
      <canvas ref={canvasRef} className="block size-full" />
      <div className="to-background absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent" />
    </div>
  );
}
