'use client';

import { unstable_rethrow } from 'next/navigation';
import { type FormEvent, useEffect, useState, useTransition } from 'react';

import { guestMessage, resumeGuest } from '@/app/(admin)/admin/actions';
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
import { expiryDefaults } from '@/lib/access/expiry';

import ExpiryField from './expiry-field';
import InviteMessage from './invite-message';

export type ExistingGuest = {
  guestId: string;
  expiresAt: Date | null;
  state: 'active' | 'paused' | 'expired';
};

type ReturningGuestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 'resume' for a paused or expired guest, 'remind' for one with access */
  mode: 'resume' | 'remind';
  request: {
    id: string;
    name: string;
    productSlug: string;
    existingGuest: ExistingGuest;
  };
};

type Written = { guestId: string; name: string; email: string; reply: string };

const FAILED = 'Something went wrong. Try again.';

/** A guest asks again: resume them, or send the links again; they sign in as before */
export default function ReturningGuestDialog({
  open,
  onOpenChange,
  mode,
  request,
}: ReturningGuestDialogProps) {
  const [written, setWritten] = useState<Written>();
  const [error, setError] = useState<string>();
  const [customError, setCustomError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const { guestId, expiresAt } = request.existingGuest;
  const resuming = mode === 'resume';

  // Send links again: write the message as soon as the dialog opens
  useEffect(() => {
    if (!open || resuming) return;
    startTransition(async () => {
      try {
        const result = await guestMessage(guestId, request.productSlug);
        if (result.ok) setWritten(result);
        else setError(result.error ?? FAILED);
      } catch (caught) {
        unstable_rethrow(caught);
        setError(FAILED);
      }
    });
  }, [open, resuming, guestId, request.productSlug]);

  function resume(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.set('requestId', request.id);
    data.set('project', request.productSlug);
    setError(undefined);
    setCustomError(undefined);
    startTransition(async () => {
      try {
        const result = await resumeGuest(guestId, data);
        if (result.ok) return setWritten(result);
        setError(result.error);
        setCustomError(result.fieldErrors?.expiryCustom?.[0]);
      } catch (caught) {
        unstable_rethrow(caught);
        setError(FAILED);
      }
    });
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setWritten(undefined);
      setError(undefined);
    }
    onOpenChange(next);
  }

  const expiry = expiryDefaults(expiresAt, new Date());

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {written
              ? `Send ${written.name} their links`
              : resuming
                ? `Resume access for ${request.name}`
                : `Send ${request.name} their links again`}
          </DialogTitle>
          <DialogDescription>
            {written
              ? 'Check the message, then send it. Nothing is sent until you press Send invitation.'
              : 'They sign in with their email, as before.'}
          </DialogDescription>
        </DialogHeader>

        {written ? (
          <InviteMessage {...written} requestId={request.id} />
        ) : resuming ? (
          <form onSubmit={resume} className="space-y-6" noValidate>
            <ExpiryField
              defaultValue={expiry.choice}
              defaultCustom={expiry.custom}
              error={customError}
            />
            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={pending}>
                {pending ? 'Saving…' : 'Resume access'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            {error ? (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            ) : (
              <p role="status" className="text-muted-foreground text-sm">
                Writing the message…
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
