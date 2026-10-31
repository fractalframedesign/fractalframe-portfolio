import { getDb } from '@/lib/db/client';

import { type GateDeps, getProxyLevels } from './gate';
import { getGuestPass } from './repo/guest-access';

/** Live dependencies for gateRequest, shared by the proxy and the access check */
export function liveGateDeps(): GateDeps {
  return {
    getLevels: () => getProxyLevels(getDb),
    getGuestPass: (guestId, now) => getGuestPass(getDb(), guestId, now),
    now: () => new Date(),
  };
}
