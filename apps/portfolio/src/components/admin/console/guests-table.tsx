'use client';

import { MoreHorizontal, Users } from 'lucide-react';
import Link from 'next/link';
import { unstable_rethrow } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  type ActionResult,
  deleteGuest,
  newPassword,
  removeGrant,
  setGrantStatus,
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
import type { GrantView } from '@/lib/access/repo/guests';

import EditGuestDialog from './edit-guest-dialog';
import ExpiryDialog from './expiry-dialog';
import SectionCard from './section-card';

type GuestsTableProps = {
  rows: GrantView[];
  projectNames: Record<string, string>;
  /** True when a project or status filter is set */
  filtered: boolean;
  /** Server time, so labels match between server and browser */
  now: Date;
};

const FAILED = 'Something went wrong. Try again.';

type Pending =
  | { kind: 'expiry' | 'edit' | 'remove' | 'delete'; grant: GrantView }
  | { kind: 'password'; name: string; password: string; reply: string };

export default function GuestsTable({
  rows,
  projectNames,
  filtered,
  now,
}: GuestsTableProps) {
  // Dialogs live here, not in rows, so they survive the refresh after a change
  const [dialog, setDialog] = useState<Pending>();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();

  function show(next: Pending) {
    setDialog(next);
    setOpen(true);
  }

  const projectName = (slug: string) => projectNames[slug] ?? slug;
  // The command menu links to a guest's first row
  const seen = new Set<string>();

  return (
    <SectionCard title="Guest access" icon={Users}>
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
                <TableHead>Project</TableHead>
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
              {rows.map((grant) => {
                const first = !seen.has(grant.guestId);
                seen.add(grant.guestId);
                return (
                  <GuestRow
                    key={grant.grantId}
                    grant={grant}
                    anchor={first ? `guest-${grant.guestId}` : undefined}
                    projectName={projectName(grant.productSlug)}
                    now={now}
                    onError={setError}
                    onShow={show}
                  />
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {dialog?.kind === 'expiry' && (
        <ExpiryDialog grant={dialog.grant} open={open} onOpenChange={setOpen} />
      )}

      {dialog?.kind === 'edit' && (
        <EditGuestDialog
          key={dialog.grant.guestId}
          guest={dialog.grant}
          open={open}
          onOpenChange={setOpen}
        />
      )}

      {dialog?.kind === 'remove' && (
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title={`Remove ${dialog.grant.name} from ${projectName(dialog.grant.productSlug)}?`}
          description="Their password stops working for this project straight away. Other projects they can open aren’t affected."
          confirmLabel="Remove"
          onConfirm={() => removeGrant(dialog.grant.grantId)}
        />
      )}

      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title={`Delete ${dialog.grant.name}?`}
          description="Their password stops working on every project and they’re removed from every list. This can’t be undone."
          confirmLabel="Delete guest"
          onConfirm={() => deleteGuest(dialog.grant.guestId)}
        />
      )}

      {dialog?.kind === 'password' && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New password for {dialog.name}</DialogTitle>
              <DialogDescription>
                Their old password no longer works, on every project. Nothing
                has been sent.
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
      No guests match these filters.{' '}
      <Button variant="link" asChild className="h-auto p-0">
        <Link href="/admin/guests">Clear filters</Link>
      </Button>
    </p>
  );
}

function GuestRow({
  grant,
  anchor,
  projectName,
  now,
  onError,
  onShow,
}: {
  grant: GrantView;
  /** Set on a guest's first row, for links from the command menu */
  anchor?: string;
  projectName: string;
  now: Date;
  onError: (error: string | undefined) => void;
  onShow: (dialog: Pending) => void;
}) {
  const [pending, startTransition] = useTransition();
  const paused = grant.status === 'paused';

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
      () => newPassword(grant.guestId),
      (result) =>
        onShow({
          kind: 'password',
          name: grant.name,
          password: result.password,
          reply: result.reply,
        }),
    );
  }

  return (
    <TableRow id={anchor} aria-busy={pending} className="scroll-mt-20">
      <TableCell>
        <p className="font-medium">{grant.name}</p>
        {grant.email && (
          <p className="text-muted-foreground text-sm">{grant.email}</p>
        )}
      </TableCell>
      <TableCell>{projectName}</TableCell>
      <TableCell>
        <GrantStatusBadge grant={grant} now={now} />
      </TableCell>
      <TableCell className="tabular-nums">
        {timeLeftLabel(grant.expiresAt, now)}
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {lastVisitLabel(grant.lastVisitAt, now)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {grant.visitCount}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${grant.name} on ${projectName}`}
              disabled={pending}
            >
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() =>
                run(() =>
                  setGrantStatus(grant.grantId, paused ? 'active' : 'paused'),
                )
              }
            >
              {paused ? 'Resume' : 'Pause'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onShow({ kind: 'expiry', grant })}
            >
              Change expiry
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={issuePassword}>
              New password
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onShow({ kind: 'edit', grant })}>
              Edit name &amp; note
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onShow({ kind: 'remove', grant })}
            >
              Remove from project
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onShow({ kind: 'delete', grant })}
            >
              Delete guest
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
