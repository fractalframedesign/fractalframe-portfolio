'use client';

import { Ruler } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { isDrawingTheme } from '@/components/drawing/drawing-theme';
import MeasureOverlay from '@/components/drawing/measure-overlay';
import { useHoverMeasure } from '@/components/drawing/use-hover-measure';

const subscribeNever = () => () => {};

/** Anything on the page except the root elements and this overlay */
const isMeasurable = (el: Element) =>
  el !== document.body &&
  el !== document.documentElement &&
  !el.closest('[data-drawing-overlay]');

/**
 * Drawing mode's measuring inspector: hover any element to see its box,
 * hatched padding, width and height, gaps to its parent and type specs.
 * Only active in the drawing themes; nothing renders otherwise.
 */
export default function DrawingInspector() {
  const { resolvedTheme } = useTheme();
  const active = isDrawingTheme(resolvedTheme);
  const m = useHoverMeasure({ enabled: active, accept: isMeasurable });
  // True only on the client, so the portal never renders during SSR
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  if (!mounted || !active) return null;

  return createPortal(
    <div
      data-drawing-overlay
      aria-hidden
      className="pointer-events-none fixed inset-0 z-100"
    >
      {m && (
        <MeasureOverlay
          m={m}
          bounds={{ w: window.innerWidth, h: window.innerHeight }}
        />
      )}

      <p className="bg-background text-foreground border-foreground absolute bottom-4 left-4 flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase">
        <Ruler className="size-3.5" />
        Drawing mode · hover to measure · Esc to clear
      </p>
    </div>,
    document.body,
  );
}
