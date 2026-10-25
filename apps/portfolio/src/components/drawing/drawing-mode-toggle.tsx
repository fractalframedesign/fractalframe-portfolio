'use client';

import { DraftingCompass } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

import {
  drawingThemeFor,
  isDrawingTheme,
  readThemeBeforeDrawing,
  saveThemeBeforeDrawing,
} from '@/components/drawing/drawing-theme';
import { Button } from '@/components/ui/button';

const subscribeNever = () => () => {};

/** Entering remembers the current theme and keeps its tone; leaving returns to it */
function themeAfterToggle(
  active: boolean,
  current: string | undefined,
  dark: boolean,
) {
  if (active) return readThemeBeforeDrawing();
  saveThemeBeforeDrawing(current ?? 'system');
  return drawingThemeFor(dark);
}

/** Applies a theme with the site's view transition, unless motion is reduced */
async function applyTheme(apply: () => void) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduced) {
    apply();
    return;
  }
  document.documentElement.classList.add('theme-transition');
  try {
    await document.startViewTransition(apply).finished;
  } finally {
    document.documentElement.classList.remove('theme-transition');
  }
}

/** Switches the site into drawing mode (reversed in dark mode) and back to the theme it came from */
export default function DrawingModeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  // Theme is only known on the client; avoid a hydration mismatch
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const active = mounted && isDrawingTheme(theme);

  const toggle = () => {
    const next = themeAfterToggle(active, theme, resolvedTheme === 'dark');
    return applyTheme(() => setTheme(next));
  };

  return (
    // Labelled on wider screens; icon only on phones, where the header is tight
    <Button
      variant={active ? 'secondary' : 'ghost'}
      className="h-10 rounded-full px-3 max-sm:w-10 max-sm:px-0"
      tooltip={active ? 'Exit drawing mode' : undefined}
      onClick={toggle}
      aria-pressed={active}
      aria-label="Drawing mode"
    >
      <DraftingCompass />
      <span className="max-sm:sr-only">Drawing mode</span>
    </Button>
  );
}
