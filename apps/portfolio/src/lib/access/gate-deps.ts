import { getDb } from '@/lib/db/client';

import { type GateDeps, getProxyLevels } from './gate';
import { getAdminAccount } from './repo/admin-account';
import { getGuestPass } from './repo/guest-access';

/** Live dependencies for gateRequest, shared by the proxy and the access check */
export function liveGateDeps(): GateDeps {
  return {
    getLevels: () => getProxyLevels(getDb),
    getGuestPass: (guestId, now) => getGuestPass(getDb(), guestId, now),
    // Same rule as isSessionCurrent, without loading the scrypt helpers
    isAdminSessionCurrent: async (issuedAt) => {
      const account = await getAdminAccount(getDb());
      return (
        !account || issuedAt.getTime() >= account.passwordChangedAt.getTime()
      );
    },
    now: () => new Date(),
  };
}
