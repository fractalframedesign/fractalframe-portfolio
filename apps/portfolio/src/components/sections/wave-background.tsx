'use client';

import { useReducedMotion } from 'motion/react';
import dynamic from 'next/dynamic';
import { useSyncExternalStore } from 'react';

const WaveField = dynamic(() => import('./wave-field'), { ssr: false });

/** Below this width the reading column fills the screen, so the wave is skipped */
const WIDE_SCREEN = '(min-width: 768px)';

const subscribeToWidth = (onChange: () => void) => {
  const query = window.matchMedia(WIDE_SCREEN);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

/**
 * The home page background: a calm sea of dots that swells slowly and lifts
 * under the cursor. It stays fixed while the page scrolls over it. Decorative.
 */
export default function WaveBackground() {
  const still = useReducedMotion() ?? false;
  const wide = useSyncExternalStore(
    subscribeToWidth,
    () => window.matchMedia(WIDE_SCREEN).matches,
    () => false,
  );

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 opacity-30">
        {wide && <WaveField still={still} paused={false} />}
      </div>
      {/* A soft dark panel behind the reading column, so text stays easy to read over the dots */}
      <div className="bigger-container bg-background/85 relative h-full mask-x-from-75%" />
    </div>
  );
}
