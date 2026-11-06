'use client';

import { useState } from 'react';

import AddGuestDialog from '@/components/admin/add-guest-dialog';
import ReturningGuestDialog, {
  type ExistingGuest,
} from '@/components/admin/returning-guest-dialog';
import { Badge } from '@/components/ui/badge';

export type ReplyRequest = {
  id: string;
  name: string;
  email: string;
  productSlug: string;
  /** Set when the email already belongs to a guest */
  existingGuest: ExistingGuest | null;
};

type Mode = 'approve' | 'resume' | 'remind' | 'new-password';

/** One clear action per situation: new person, paused or expired guest, guest with access */
function modeFor(request: ReplyRequest): Exclude<Mode, 'new-password'> {
  const state = request.existingGuest?.state;
  if (!state) return 'approve';
  return state === 'active' ? 'remind' : 'resume';
}

const LABELS = {
  approve: 'Approve',
  resume: 'Resume access',
  remind: 'Send links again',
};

const STATE_BADGES = {
  active: {
    label: 'Has access',
    className: 'bg-success-subtle text-success-subtle-foreground',
  },
  paused: {
    label: 'Paused',
    className: 'bg-warning-subtle text-warning-subtle-foreground',
  },
  expired: {
    label: 'Expired',
    className: 'bg-destructive-subtle text-destructive-subtle-foreground',
  },
};

export function replyLabel(request: ReplyRequest) {
  return LABELS[modeFor(request)];
}

/** Where a returning guest stands, shown next to their name */
export function GuestStateBadge({ request }: { request: ReplyRequest }) {
  const state = request.existingGuest?.state;
  if (!state) return null;
  const badge = STATE_BADGES[state];
  return (
    <Badge className={`border-transparent ${badge.className}`}>
      {badge.label}
    </Badge>
  );
}

/**
 * Opens the right dialog for a request. The dialogs live in the caller, not in
 * a row, so the message stays on screen after the answered request leaves the list.
 */
export function useRequestReply() {
  const [target, setTarget] = useState<{ request: ReplyRequest; mode: Mode }>();
  const [open, setOpen] = useState(false);

  function start(request: ReplyRequest) {
    setTarget({ request, mode: modeFor(request) });
    setOpen(true);
  }

  const request = target?.request;
  const existing = request?.existingGuest;

  const dialogs =
    !target || !request ? null : target.mode === 'resume' ||
      target.mode === 'remind' ? (
      <ReturningGuestDialog
        key={`${request.id}-${target.mode}`}
        open={open}
        onOpenChange={setOpen}
        mode={target.mode}
        request={{ ...request, existingGuest: existing! }}
        onNewPassword={() => setTarget({ request, mode: 'new-password' })}
      />
    ) : (
      <AddGuestDialog
        key={`${request.id}-${target.mode}`}
        open={open}
        onOpenChange={setOpen}
        defaults={{
          name: request.name,
          email: request.email,
          requestId: request.id,
          projectSlug: request.productSlug,
          existingGuest:
            target.mode === 'new-password' && existing
              ? { expiresAt: existing.expiresAt }
              : undefined,
        }}
      />
    );

  return { start, dialogs };
}
