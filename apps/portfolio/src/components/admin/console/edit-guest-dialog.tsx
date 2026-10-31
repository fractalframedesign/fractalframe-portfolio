'use client';

import { unstable_rethrow } from 'next/navigation';
import { type FormEvent, useId, useState, useTransition } from 'react';

import { updateGuest } from '@/app/(admin)/admin/actions';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type EditGuestDialogProps = {
  guest: { guestId: string; name: string; note: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const FAILED = 'Something went wrong. Try again.';

export default function EditGuestDialog({
  guest,
  open,
  onOpenChange,
}: EditGuestDialogProps) {
  const id = useId();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [formError, setFormError] = useState<string>();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setErrors({});
    setFormError(undefined);
    // Inside a transition so a thrown redirect (session expired) reaches
    // Next's RedirectBoundary instead of being shown as a failure
    startTransition(async () => {
      try {
        const result = await updateGuest(guest.guestId, {
          name: String(data.get('name') ?? ''),
          note: String(data.get('note') ?? ''),
        });
        if (result.ok) return onOpenChange(false);
        setErrors(result.fieldErrors ?? {});
        setFormError(result.error);
      } catch (caught) {
        unstable_rethrow(caught);
        setFormError(FAILED);
      }
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
