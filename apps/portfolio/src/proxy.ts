import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from 'next/server';

import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/access/admin-session';
import { gateRequest, getProxyLevels } from '@/lib/access/gate';
import { getGuestPass, recordGuestVisit } from '@/lib/access/repo/guest-access';
import { getDb } from '@/lib/db/client';

const NO_STORE = 'private, no-store, max-age=0';

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname, search } = request.nextUrl;

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return gateAdmin(request);
  }

  const result = await gateRequest({
    pathname,
    cookies: { get: (name) => request.cookies.get(name)?.value },
    deps: {
      getLevels: () => getProxyLevels(getDb),
      getGuestPass: (guestId, now) => getGuestPass(getDb(), guestId, now),
      now: () => new Date(),
    },
  });

  switch (result.kind) {
    case 'next':
      return NextResponse.next();
    case 'allow': {
      const guestId = result.recordVisit;
      if (guestId) {
        event.waitUntil(
          recordGuestVisit(getDb(), guestId, new Date()).catch((error) =>
            console.error('Recording a guest visit failed', error),
          ),
        );
      }
      // Access depended on a cookie: keep the page out of shared caches
      return noStore(NextResponse.next());
    }
    case 'unlock': {
      // Case studies show a teaser in place, so the full page is never sent
      if (result.section === 'projects') {
        return noStore(
          NextResponse.rewrite(new URL(`/locked/${result.slug}`, request.url)),
        );
      }
      const unlockUrl = new URL('/showcase/unlock', request.url);
      unlockUrl.searchParams.set('project', result.slug);
      unlockUrl.searchParams.set('next', pathname + search);
      return NextResponse.redirect(unlockUrl);
    }
    case 'not-found':
      return notFound(request);
  }
}

/** Everything under /admin except the login page needs an admin session */
async function gateAdmin(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') {
    return noStore(NextResponse.next());
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!(await verifyAdminSession(token, new Date()))) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  return noStore(NextResponse.next());
}

/** Renders global-not-found with a real 404, same as a page that doesn't exist */
function notFound(request: NextRequest) {
  return noStore(
    NextResponse.rewrite(new URL('/__not-found', request.url), { status: 404 }),
  );
}

function noStore(response: NextResponse) {
  response.headers.set('Cache-Control', NO_STORE);
  return response;
}

export const config = {
  matcher: ['/showcase/:path*', '/projects/:path*', '/admin/:path*'],
};
