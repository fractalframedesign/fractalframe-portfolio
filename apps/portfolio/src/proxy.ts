import { type NextRequest, NextResponse } from 'next/server';

import {
  ACCESS_PARAM,
  getProtectedSlug,
  verifyAccessPass,
} from '@/lib/showcase-access';

export async function proxy(request: NextRequest) {
  const slug = getProtectedSlug(request.nextUrl.pathname);
  if (!slug) return NextResponse.next();

  const url = request.nextUrl.clone();
  const pass = url.searchParams.get(ACCESS_PARAM);
  url.searchParams.delete(ACCESS_PARAM);

  if (await verifyAccessPass(slug, pass)) {
    const response = NextResponse.next();
    // Keep the page out of every cache, including the back button
    response.headers.set('Cache-Control', 'private, no-store, max-age=0');
    return response;
  }

  const unlockUrl = new URL('/showcase/unlock', request.url);
  unlockUrl.searchParams.set('project', slug);
  unlockUrl.searchParams.set('next', url.pathname + url.search);

  return NextResponse.redirect(unlockUrl);
}

export const config = {
  matcher: '/showcase/:path*',
};
