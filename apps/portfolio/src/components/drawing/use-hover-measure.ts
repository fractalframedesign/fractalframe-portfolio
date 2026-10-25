'use client';

import { useEffect, useRef, useState } from 'react';

import { type Measure, measure } from '@/components/drawing/measure';

type HoverMeasureOptions = {
  enabled: boolean;
  /** Which hovered elements may be measured */
  accept: (el: Element) => boolean;
};

/**
 * Measures the element under the mouse. Re-measures every frame while the
 * pointer is inside, so the drawing follows elements that animate, scroll or
 * resize under it, and updates state only when a value changes. Esc clears.
 */
export function useHoverMeasure({ enabled, accept }: HoverMeasureOptions) {
  const [m, setM] = useState<Measure | null>(null);
  const acceptRef = useRef(accept);
  useEffect(() => {
    acceptRef.current = accept;
  });

  useEffect(() => {
    if (!enabled) return;

    let pointer: { x: number; y: number } | null = null;
    let frame = 0;
    let last = '';

    const commit = (next: Measure | null) => {
      const key = JSON.stringify(next);
      if (key === last) return;
      last = key;
      setM(next);
    };
    const update = () => {
      frame = 0;
      if (!pointer) return;
      const el = document.elementFromPoint(pointer.x, pointer.y);
      commit(el && acceptRef.current(el) ? measure(el) : null);
      frame = requestAnimationFrame(update);
    };
    const onMove = (event: Event) => {
      const e = event as PointerEvent;
      if (e.pointerType !== 'mouse') return;
      pointer = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(update);
    };
    const clear = () => {
      pointer = null;
      cancelAnimationFrame(frame);
      frame = 0;
      commit(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clear();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', clear);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', clear);
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(frame);
      setM(null);
    };
  }, [enabled]);

  return m;
}
