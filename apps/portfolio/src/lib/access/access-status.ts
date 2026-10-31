import type { GateResult } from './gate';

export type AccessStatus = 'public' | 'open' | 'locked';

/** What an open page needs to know: stop checking, keep checking, or lock */
export function accessStatus(result: GateResult): AccessStatus {
  if (result.kind === 'next') return 'public';
  if (result.kind === 'allow') return 'open';
  return 'locked';
}
