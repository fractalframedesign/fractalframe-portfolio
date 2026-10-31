import { type GateDeps, gateRequest,type GateResult } from './gate';

/** 'unknown' when the database couldn't be asked: the page keeps showing */
export type AccessStatus = 'public' | 'open' | 'locked' | 'unknown';

/** What an open page needs to know: stop checking, keep checking, or lock */
export function accessStatus(result: GateResult): AccessStatus {
  if (result.kind === 'next') return 'public';
  if (result.kind === 'allow') return 'open';
  return 'locked';
}

/**
 * Whether the visitor can still open this project. The gate fails closed on
 * database errors, which is right for serving a page but would lock out every
 * open page during a short outage, so any error here answers 'unknown'.
 */
export async function checkAccess(
  slug: string,
  cookies: { get(name: string): string | undefined },
  deps: GateDeps,
): Promise<AccessStatus> {
  let failed = false;
  const watch =
    <A extends unknown[], R>(call: (...args: A) => Promise<R>) =>
    async (...args: A) => {
      try {
        return await call(...args);
      } catch (error) {
        failed = true;
        throw error;
      }
    };

  const result = await gateRequest({
    pathname: `/projects/${slug}`,
    cookies,
    deps: {
      ...deps,
      getLevels: watch(deps.getLevels),
      getGuestPass: watch(deps.getGuestPass),
      isAdminSessionCurrent: watch(deps.isAdminSessionCurrent),
    },
  });
  return failed ? 'unknown' : accessStatus(result);
}
