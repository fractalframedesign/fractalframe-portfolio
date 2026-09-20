'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** True only in dark mode, and only after hydration, so server and client markup match. */
export function useIsDark() {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return mounted && resolvedTheme === 'dark';
}
