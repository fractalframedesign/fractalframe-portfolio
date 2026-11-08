import { vi } from 'vitest';

process.env.ADMIN_SESSION_SECRET = 'test-session-secret';
process.env.ADMIN_PASSWORD = 'test-admin-password';

// motion's whileInView needs IntersectionObserver, which jsdom lacks
if (
  typeof window !== 'undefined' &&
  typeof window.IntersectionObserver === 'undefined'
) {
  window.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}

// next/font only works inside the Next.js build; give tests a stand-in
vi.mock('next/font/google', () => {
  const font = () => ({ className: '', variable: '', style: {} });
  return { Rubik: font, Noto_Sans: font, Caveat: font, Source_Serif_4: font };
});
