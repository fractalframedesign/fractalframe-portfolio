'use client';

import { unstable_rethrow } from 'next/navigation';
import { type MouseEvent, useState, useTransition } from 'react';

import type { ActionResult } from '@/app/(admin)/admin/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<ActionResult>;
};

const FAILED = 'Something went wrong. Try again.';

/** Asks before a destructive action; stays open with the error if it fails */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: ConfirmDialogProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function handleOpenChange(next: boolean) {
    if (pending) return;
    if (!next) setError(undefined);
    onOpenChange(next);
  }

  function confirm(event: MouseEvent) {
    // Stay open until the action answers, so a failure can be shown here
    event.preventDefault();
    setError(undefined);
    // Inside a transition so a thrown redirect (session expired) reaches
    // Next's RedirectBoundary instead of being shown as a failure
    startTransition(async () => {
      try {
        const result = await onConfirm();
        if (result.ok) onOpenChange(false);
        else setError(result.error ?? FAILED);
      } catch (caught) {
        unstable_rethrow(caught);
        setError(FAILED);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={confirm}
            disabled={pending}
          >
            {pending ? 'Working…' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
