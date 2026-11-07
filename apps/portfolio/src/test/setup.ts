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
