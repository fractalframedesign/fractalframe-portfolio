'use client';

import { useSyncExternalStore } from 'react';

const COOKIE_NAME = 'banner-dismissed';
const BANNER_EVENT = 'banner-dismissed';

const checkBannerDismissed = () => {
  if (typeof document === 'undefined') return false;
  return document.cookie
    .split('; ')
    .some((row) => row.startsWith(`${COOKIE_NAME}=`));
};

export const useBannerVisibility = (initialVisible = true) => {
  // Subscribe function: called when external state might change
  const subscribe = (callback: () => void) => {
    window.addEventListener(BANNER_EVENT, callback);
    return () => {
      window.removeEventListener(BANNER_EVENT, callback);
    };
  };

  // Get client snapshot: reads the current cookie state
  const getSnapshot = () => {
    return checkBannerDismissed() ? false : initialVisible;
  };

  // Get server snapshot: uses the server-provided initialVisible value
  // This ensures server and client render the same on initial load
  const getServerSnapshot = () => {
    return initialVisible;
  };

  const isBannerVisible = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const dismissBanner = () => {
    // Set cookie with SameSite attribute for better security
    document.cookie = `${COOKIE_NAME}=true; path=/; max-age=31536000; SameSite=Lax`;

    // Dispatch event to notify other components
    window.dispatchEvent(new Event(BANNER_EVENT));
  };

  return { isBannerVisible, dismissBanner };
};
