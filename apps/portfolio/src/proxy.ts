import { type NextRequest, NextResponse } from 'next/server';

import {
  accessCookieName,
  getProtectedSlug,
  hasAccess,
} from '@/lib/showcase-access';

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const slug = getProtectedSlug(pathname);
  if (!slug) return NextResponse.next();

  const token = request.cookies.get(accessCookieName(slug))?.value;
  if (await hasAccess(slug, token)) {
    const response = NextResponse.next();
    // Keep the page out of shared caches
    response.headers.set('Cache-Control', 'private, no-store, max-age=0');
    return response;
  }

  const unlockUrl = new URL('/showcase/unlock', request.url);
  unlockUrl.searchParams.set('project', slug);
  unlockUrl.searchParams.set('next', pathname + search);

  return NextResponse.redirect(unlockUrl);
}

export const config = {
  matcher: '/showcase/:path*',
};
