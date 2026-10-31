'use client';

import { MoreHorizontal, Plus } from 'lucide-react';
import { type FormEvent, useState, useTransition } from 'react';

import {
  type ActionResult,
  changeExpiry,
  newPassword,
  removeGrant,
  setGrantStatus,
} from '@/app/(admin)/admin/actions';
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

import AddGuestDialog, { type ProjectOption } from './add-guest-dialog';
import ConfirmDialog from './confirm-dialog';
import ExpiryField from './expiry-field';
import GrantStatusBadge from './grant-status-badge';
import PasswordReveal from './password-reveal';

type GuestTableProps = {
  project: ProjectOption;
  grants: GrantView[];
  /** Unlocked projects, for the add dialog */
  projects: ProjectOption[];
  /** Server time, so labels match between server and browser */
  now: Date;
};

const FAILED = 'Something went wrong. Try again.';

type Pending =
  | { kind: 'expiry'; grant: GrantView }
  | { kind: 'remove'; grant: GrantView }
  | { kind: 'password'; name: string; password: string; reply: string };

export default function GuestTable({
  project,
  grants,
  projects,
  now,
}: GuestTableProps) {
  const [adding, setAdding] = useState(false);
  // Dialogs live here, not in rows, so they survive the refresh after a change
  const [dialog, setDialog] = useState<Pending>();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();

  function show(next: Pending) {
    setDialog(next);
    setOpen(true);
  }

  return (
    <section aria-labelledby={`guests-${project.slug}`} className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 id={`guests-${project.slug}`} className="font-medium">
          {project.name}
        </h3>
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
          <Plus aria-hidden />
          Invite
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      {grants.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border p-4 text-sm">
          No guests yet. Add one, or approve a request.
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Note</TableHead>
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
              {grants.map((grant) => (
                <GrantRow
                  key={grant.grantId}
                  grant={grant}
                  now={now}
                  onError={setError}
                  onShow={show}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddGuestDialog
        open={adding}
        onOpenChange={setAdding}
        projects={projects}
        defaults={{ products: [project.slug] }}
      />

      {dialog?.kind === 'expiry' && (
        <ExpiryDialog grant={dialog.grant} open={open} onOpenChange={setOpen} />
      )}

      {dialog?.kind === 'remove' && (
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title={`Remove ${dialog.grant.name} from ${project.name}?`}
          description="Their password stops working for this project straight away. Other projects they can open aren’t affected."
          confirmLabel="Remove"
          onConfirm={() => removeGrant(dialog.grant.grantId)}
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
    </section>
  );
}

function GrantRow({
  grant,
  now,
  onError,
  onShow,
}: {
  grant: GrantView;
  now: Date;
  onError: (error: string | undefined) => void;
  onShow: (dialog: Pending) => void;
}) {
  const [pending, startTransition] = useTransition();
  const paused = grant.status === 'paused';

  function run(action: () => Promise<ActionResult>) {
    onError(undefined);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) onError(result.error ?? FAILED);
    });
  }

  function issuePassword() {
    onError(undefined);
    startTransition(async () => {
      const result = await newPassword(grant.guestId);
      if (!result.ok) return onError(result.error ?? FAILED);
      onShow({
        kind: 'password',
        name: grant.name,
        password: result.password,
        reply: result.reply,
      });
    });
  }

  return (
    <TableRow aria-busy={pending}>
      <TableCell>
        <div className="font-medium">{grant.name}</div>
        {grant.email && (
          <div className="text-muted-foreground text-xs">{grant.email}</div>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground max-w-48 truncate">
        {grant.note || '—'}
      </TableCell>
      <TableCell>
        <GrantStatusBadge grant={grant} now={now} />
      </TableCell>
      <TableCell>{timeLeftLabel(grant.expiresAt, now)}</TableCell>
      <TableCell>{lastVisitLabel(grant.lastVisitAt, now)}</TableCell>
      <TableCell className="text-right tabular-nums">
        {grant.visitCount}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${grant.name}`}
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
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onShow({ kind: 'remove', grant })}
            >
              Remove from project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function ExpiryDialog({
  grant,
  open,
  onOpenChange,
}: {
  grant: GrantView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{ form?: string; custom?: string }>({});

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await changeExpiry(
        grant.grantId,
        String(data.get('expiry')),
        String(data.get('expiryCustom') ?? ''),
      );
      if (result.ok) onOpenChange(false);
      else
        setErrors({
          form: result.error,
          custom: result.fieldErrors?.expiryCustom?.[0],
        });
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change expiry for {grant.name}</DialogTitle>
          <DialogDescription>
            The new time counts from now. Their password stays the same.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5" noValidate>
          <ExpiryField error={errors.custom} />
          {errors.form && (
            <p role="alert" className="text-destructive text-sm">
              {errors.form}
            </p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
