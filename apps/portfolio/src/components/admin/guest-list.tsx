'use client';

import { MoreHorizontal } from 'lucide-react';
import { type FormEvent, useId, useState, useTransition } from 'react';

import { deleteGuest, updateGuest } from '@/app/(admin)/admin/actions';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { formatAdminDate, lastVisitLabel } from '@/lib/access/admin-format';
import { timeLeftLabel } from '@/lib/access/expiry';
import type { GrantView } from '@/lib/access/repo/guests';

import ConfirmDialog from './confirm-dialog';
import GrantStatusBadge from './grant-status-badge';

export type GuestEntry = {
  guestId: string;
  name: string;
  email: string | null;
  note: string;
  createdAt: Date;
  grants: GrantView[];
};

type GuestListProps = {
  guests: GuestEntry[];
  projectNames: Record<string, string>;
  now: Date;
};

type Pending = { kind: 'edit' | 'delete'; guest: GuestEntry };

export default function GuestList({
  guests,
  projectNames,
  now,
}: GuestListProps) {
  const [dialog, setDialog] = useState<Pending>();
  const [open, setOpen] = useState(false);

  function show(next: Pending) {
    setDialog(next);
    setOpen(true);
  }

  if (guests.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border p-4 text-sm">
        No guests yet. Add them from a project on the dashboard.
      </p>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.map((guest) => (
              <TableRow key={guest.guestId} className="align-top">
                <TableCell>
                  <div className="font-medium">{guest.name}</div>
                  {guest.email && (
                    <div className="text-muted-foreground text-xs">
                      {guest.email}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-56 whitespace-normal">
                  {guest.note || '—'}
                </TableCell>
                <TableCell>
                  <GrantSummary
                    grants={guest.grants}
                    projectNames={projectNames}
                    now={now}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatAdminDate(guest.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${guest.name}`}
                      >
                        <MoreHorizontal aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => show({ kind: 'edit', guest })}
                      >
                        Edit name and note
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => show({ kind: 'delete', guest })}
                      >
                        Delete guest
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
          title={`Delete ${dialog.guest.name}?`}
          description="Their password stops working on every project and they’re removed from every list. This can’t be undone."
          confirmLabel="Delete guest"
          onConfirm={() => deleteGuest(dialog.guest.guestId)}
        />
      )}
    </>
  );
}

function GrantSummary({
  grants,
  projectNames,
  now,
}: {
  grants: GrantView[];
  projectNames: Record<string, string>;
  now: Date;
}) {
  if (grants.length === 0) {
    return <span className="text-muted-foreground">No projects</span>;
  }
  return (
    <ul className="space-y-2">
      {grants.map((grant) => (
        <li key={grant.grantId} className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span>{projectNames[grant.productSlug] ?? grant.productSlug}</span>
            <GrantStatusBadge grant={grant} now={now} />
          </div>
          <div className="text-muted-foreground text-xs">
            {timeLeftLabel(grant.expiresAt, now)} · Last visit{' '}
            {lastVisitLabel(grant.lastVisitAt, now).toLowerCase()}
          </div>
        </li>
      ))}
    </ul>
  );
}

function EditGuestDialog({
  guest,
  open,
  onOpenChange,
}: {
  guest: GuestEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const id = useId();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [formError, setFormError] = useState<string>();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateGuest(guest.guestId, {
        name: String(data.get('name') ?? ''),
        note: String(data.get('note') ?? ''),
      });
      if (result.ok) return onOpenChange(false);
      setErrors(result.fieldErrors ?? {});
      setFormError(result.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {guest.name}</DialogTitle>
          <DialogDescription>
            Only you see these. Their password doesn&apos;t change.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>Name</Label>
            <Input
              id={`${id}-name`}
              name="name"
              defaultValue={guest.name}
              maxLength={100}
              required
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && (
              <p role="alert" className="text-destructive text-sm">
                {errors.name[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-note`}>Note</Label>
            <Textarea
              id={`${id}-note`}
              name="note"
              defaultValue={guest.note}
              maxLength={500}
              rows={3}
              aria-invalid={Boolean(errors.note)}
            />
            {errors.note && (
              <p role="alert" className="text-destructive text-sm">
                {errors.note[0]}
              </p>
            )}
          </div>
          {formError && (
            <p role="alert" className="text-destructive text-sm">
              {formError}
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
