'use client';

import { useEffect, useRef } from 'react';

import type { AccessStatus } from '@/lib/access/access-status';

const CHECK_EVERY_MS = 30_000;

function reload() {
  window.location.reload();
}

type AccessWatcherProps = {
  slug: string;
  /** Defaults to a full reload, which the proxy turns into the lock screen */
  onLocked?: () => void;
};

/**
 * On a password-protected page, re-checks access every 30 seconds and when the
 * tab regains focus, so a paused or removed guest is locked out of pages they
 * already have open. On a public page it checks once and stops.
 */
export default function AccessWatcher({
  slug,
  onLocked = reload,
}: AccessWatcherProps) {
  // Kept in a ref so a re-render (a new callback) doesn't restart the checks
  const lockedRef = useRef(onLocked);
  useEffect(() => {
    lockedRef.current = onLocked;
  });

  useEffect(() => {
    let stopped = false;
    const timer = setInterval(check, CHECK_EVERY_MS);
    window.addEventListener('focus', onFocus);

    async function check() {
      let status: AccessStatus;
      try {
        const response = await fetch(`/api/access/${slug}`, {
          cache: 'no-store',
        });
        status = ((await response.json()) as { status: AccessStatus }).status;
      } catch {
        // Offline or a failed check: keep the page; the next request is gated anyway
        return;
      }
      if (stopped) return;
      if (status === 'public') return stop();
      if (status === 'locked') {
        stop();
        lockedRef.current();
      }
    }

    function onFocus() {
      void check();
    }

    function stop() {
      stopped = true;
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    }

    void check();
    return stop;
  }, [slug]);

  return null;
}
