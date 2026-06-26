'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ROUTE_ORDER = ['/', '/projects', '/about', '/articles'];

function routeIndex(path: string) {
  const exact = ROUTE_ORDER.indexOf(path);
  if (exact !== -1) return exact;
  // sub-routes (e.g. /projects/slug) rank same as their parent
  return ROUTE_ORDER.findIndex((r) => r !== '/' && path.startsWith(r));
}

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
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('#') ||
        link.target === '_blank' ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) return;

      if (href === window.location.pathname) return;

      e.preventDefault();

      // Determine direction: forward = new route is deeper/later, back = earlier
      const fromIdx = routeIndex(window.location.pathname);
      const toIdx   = routeIndex(href);
      const cls = toIdx >= fromIdx ? 'page-transition-forward' : 'page-transition-back';

      if (!document.startViewTransition) {
        router.push(href, { scroll: false });
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      document.documentElement.classList.add(cls);

      const transition = document.startViewTransition(() => {
        router.push(href, { scroll: false });
        window.scrollTo({ top: 0, behavior: 'instant' });
      });

      transition.finished.finally(() => {
        document.documentElement.classList.remove(cls);
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [router]);

  return <>{children}</>;
}
