import { useCallback, useEffect, useState } from 'react';

// Tailwind default breakpoints in pixels
const SCREEN_SIZES = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type ScreenSize = keyof typeof SCREEN_SIZES;

// Debounce utility function
const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const useMediaQuery = (debounceMs = 100) => {
  // Calculate initial screen size during component initialization
  const getScreenSize = (): ScreenSize => {
    // Check if window is defined (for SSR compatibility)
    if (typeof window === 'undefined') return 'xs';

    const effectiveWidth =
      document.documentElement.clientWidth || window.innerWidth;

    if (effectiveWidth >= SCREEN_SIZES['2xl']) {
      return '2xl';
    } else if (effectiveWidth >= SCREEN_SIZES.xl) {
      return 'xl';
    } else if (effectiveWidth >= SCREEN_SIZES.lg) {
      return 'lg';
    } else if (effectiveWidth >= SCREEN_SIZES.md) {
      return 'md';
    } else {
      return 'sm';
    }
  };

  const [screenSize, setScreenSize] = useState<ScreenSize>(getScreenSize);

  const updateScreenSize = useCallback(() => {
    setScreenSize(getScreenSize());
  }, []);

  useEffect(() => {
    // Create debounced handler
    const debouncedHandler = debounce(updateScreenSize, debounceMs);

    // Add event listener with debounced handler
    window.addEventListener('resize', debouncedHandler);

    // Cleanup
    return () => window.removeEventListener('resize', debouncedHandler);
  }, [debounceMs, updateScreenSize]);

  return {
    screenSize,
    isXs: screenSize === 'xs',
    isSm: screenSize === 'sm',
    isMd: screenSize === 'md',
    isLg: screenSize === 'lg',
    isXl: screenSize === 'xl',
    is2Xl: screenSize === '2xl',
    // Helper methods for comparisons
    isAtLeast: (size: ScreenSize) => {
      const breakpoints: ScreenSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      const currentIndex = breakpoints.indexOf(screenSize);
      const targetIndex = breakpoints.indexOf(size);
      return currentIndex >= targetIndex;
    },
    isAtMost: (size: ScreenSize) => {
      const breakpoints: ScreenSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      const currentIndex = breakpoints.indexOf(screenSize);
      const targetIndex = breakpoints.indexOf(size);
      return currentIndex <= targetIndex;
    },
  };
};
