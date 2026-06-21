'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const TRANSITION_CLASS = 'page-transition';

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a');

      if (!link) return;

      const href = link.getAttribute('href');

      // Skip if no href, external link, or modifier keys pressed
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('#') ||
        link.target === '_blank' ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // Skip if same page
      if (href === window.location.pathname) {
        return;
      }

      e.preventDefault();

      // Check for View Transitions API support
      if (!document.startViewTransition) {
        router.push(href, { scroll: false });
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      // Add transition class before starting
      document.documentElement.classList.add(TRANSITION_CLASS);

      const transition = document.startViewTransition(() => {
        // Navigate inside the transition callback
        router.push(href, { scroll: false });
        window.scrollTo({ top: 0, behavior: 'instant' });
      });

      transition.finished.finally(() => {
        document.documentElement.classList.remove(TRANSITION_CLASS);
      });
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [router]);

  return <>{children}</>;
}
