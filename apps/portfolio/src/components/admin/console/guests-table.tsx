'use client';

import { MoreHorizontal, Users } from 'lucide-react';
import Link from 'next/link';
import { unstable_rethrow } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  type ActionResult,
  deleteGuest,
  newPassword,
  setGuestAccessStatus,
} from '@/app/(admin)/admin/actions';
import ConfirmDialog from '@/components/admin/confirm-dialog';
import GrantStatusBadge from '@/components/admin/grant-status-badge';
import PasswordReveal from '@/components/admin/password-reveal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { lastVisitLabel } from '@/lib/access/admin-format';
import { timeLeftLabel } from '@/lib/access/expiry';
import type { GuestAccess } from '@/lib/access/repo/guest-access';

import EditGuestDialog from './edit-guest-dialog';
import ExpiryDialog from './expiry-dialog';
import SectionCard from './section-card';

type GuestsTableProps = {
  rows: GuestAccess[];
  /** True when a status filter is set */
  filtered: boolean;
  /** Server time, so labels match between server and browser */
  now: Date;
};

const FAILED = 'Something went wrong. Try again.';

type Pending =
  | { kind: 'expiry' | 'edit' | 'delete'; guest: GuestAccess }
  | { kind: 'password'; name: string; password: string; reply: string };

export default function GuestsTable({ rows, filtered, now }: GuestsTableProps) {
  // Dialogs live here, not in rows, so they survive the refresh after a change
  const [dialog, setDialog] = useState<Pending>();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();

  function show(next: Pending) {
    setDialog(next);
    setOpen(true);
  }

  return (
    <SectionCard title="Guests" icon={Users}>
      <div className="space-y-3">
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}

        {rows.length === 0 ? (
          <EmptyState filtered={filtered} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time left</TableHead>
                <TableHead>Last visit</TableHead>
                <TableHead className="text-right">Visits</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((guest) => (
                <GuestRow
                  key={guest.guestId}
                  guest={guest}
                  now={now}
                  onError={setError}
                  onShow={show}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {dialog?.kind === 'expiry' && (
        <ExpiryDialog guest={dialog.guest} open={open} onOpenChange={setOpen} />
      )}

      {dialog?.kind === 'edit' && (
        <EditGuestDialog
          key={dialog.guest.guestId}
          guest={dialog.guest}
          open={open}
          onOpenChange={setOpen}
        />
      )}

      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title={`Remove ${dialog.guest.name}?`}
          description="Their password stops working straight away and they’re taken off your guest list. This can’t be undone."
          confirmLabel="Remove guest"
          onConfirm={() => deleteGuest(dialog.guest.guestId)}
        />
      )}

      {dialog?.kind === 'password' && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New password for {dialog.name}</DialogTitle>
              <DialogDescription>
                Their old password no longer works. Nothing has been sent.
              </DialogDescription>
            </DialogHeader>
            <PasswordReveal
              name={dialog.name}
              password={dialog.password}
              reply={dialog.reply}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Done</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </SectionCard>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  if (!filtered) {
    return (
      <p className="text-muted-foreground text-sm">
        No one has access yet. Invite someone, or approve a request.
      </p>
    );
  }
  return (
    <p className="text-muted-foreground text-sm">
      No guests match this filter.{' '}
      <Button variant="link" asChild className="h-auto p-0">
        <Link href="/admin/guests">Clear filter</Link>
      </Button>
    </p>
  );
}

function GuestRow({
  guest,
  now,
  onError,
  onShow,
}: {
  guest: GuestAccess;
  now: Date;
  onError: (error: string | undefined) => void;
  onShow: (dialog: Pending) => void;
}) {
  const [pending, startTransition] = useTransition();
  const paused = guest.status === 'paused';

  // Inside a transition so a thrown redirect (session expired) reaches
  // Next's RedirectBoundary instead of being shown as a failure
  function run<T extends ActionResult>(
    action: () => Promise<T>,
    onDone?: (result: T & { ok: true }) => void,
  ) {
    onError(undefined);
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.ok) return onError(result.error ?? FAILED);
        onDone?.(result as T & { ok: true });
      } catch (caught) {
        unstable_rethrow(caught);
        onError(FAILED);
      }
    });
  }

  function issuePassword() {
    run(
      () => newPassword(guest.guestId),
      (result) =>
        onShow({
          kind: 'password',
          name: guest.name,
          password: result.password,
          reply: result.reply,
        }),
    );
  }

  return (
    // The id is the target of guest links in the command menu
    <TableRow
      id={`guest-${guest.guestId}`}
      aria-busy={pending}
      className="scroll-mt-20"
    >
      <TableCell>
        <p className="font-medium">{guest.name}</p>
        {guest.email && (
          <p className="text-muted-foreground text-sm">{guest.email}</p>
        )}
      </TableCell>
      <TableCell>
        <GrantStatusBadge grant={guest} now={now} />
      </TableCell>
      <TableCell className="tabular-nums">
        {timeLeftLabel(guest.expiresAt, now)}
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {lastVisitLabel(guest.lastVisitAt, now)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {guest.visitCount}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${guest.name}`}
              disabled={pending}
            >
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() =>
                run(() =>
                  setGuestAccessStatus(
                    guest.guestId,
                    paused ? 'active' : 'paused',
                  ),
                )
              }
            >
              {paused ? 'Resume' : 'Pause'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onShow({ kind: 'expiry', guest })}
            >
              Change expiry
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={issuePassword}>
              New password
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onShow({ kind: 'edit', guest })}>
              Edit name &amp; note
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onShow({ kind: 'delete', guest })}
            >
              Remove guest
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
