'use client';

import { unstable_rethrow } from 'next/navigation';
import { type FormEvent, useState, useTransition } from 'react';

import { changeGuestExpiry } from '@/app/(admin)/admin/actions';
import ExpiryField from '@/components/admin/expiry-field';
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

type ExpiryDialogProps = {
  guest: { guestId: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const FAILED = 'Something went wrong. Try again.';

export default function ExpiryDialog({
  guest,
  open,
  onOpenChange,
}: ExpiryDialogProps) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{ form?: string; custom?: string }>({});

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setErrors({});
    // Inside a transition so a thrown redirect (session expired) reaches
    // Next's RedirectBoundary instead of being shown as a failure
    startTransition(async () => {
      try {
        const result = await changeGuestExpiry(
          guest.guestId,
          String(data.get('expiry')),
          String(data.get('expiryCustom') ?? ''),
        );
        if (result.ok) return onOpenChange(false);
        setErrors({
          form: result.error,
          custom: result.fieldErrors?.expiryCustom?.[0],
        });
      } catch (caught) {
        unstable_rethrow(caught);
        setErrors({ form: FAILED });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change expiry for {guest.name}</DialogTitle>
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
