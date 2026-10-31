import type { NextRequest } from 'next/server';

import { checkAccess } from '@/lib/access/access-status';
import { liveGateDeps } from '@/lib/access/gate-deps';

const NO_STORE = { 'Cache-Control': 'private, no-store, max-age=0' };

/**
 * Lets an open case study or demo ask whether the visitor still has access,
 * so pausing or removing a guest locks pages they already have open.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) {
    return Response.json({ status: 'locked' }, { headers: NO_STORE });
  }

  const status = await checkAccess(
    slug,
    { get: (name) => request.cookies.get(name)?.value },
    liveGateDeps(),
  );
  return Response.json({ status }, { headers: NO_STORE });
}
