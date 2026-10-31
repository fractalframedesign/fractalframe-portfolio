'use client';

import {
  type FormEvent,
  type ReactNode,
  useId,
  useState,
  useTransition,
} from 'react';

import { addGuest, type PasswordResult } from '@/app/(admin)/admin/actions';
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
import { expiryDefaults } from '@/lib/access/expiry';

import ExpiryField from './expiry-field';
import PasswordReveal from './password-reveal';

export type GuestDefaults = {
  name?: string;
  email?: string;
  /** Set when approving a request: the request is marked approved */
  requestId?: string;
  /** Set when the email is already a guest: saving resends access */
  existingGuest?: { expiresAt: Date | null };
};

type AddGuestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults?: GuestDefaults;
};

type Created = {
  name: string;
  password: string;
  reply: string;
  renewed: boolean;
};

/** Invite someone, approve a request, or resend access to an existing guest */
export default function AddGuestDialog({
  open,
  onOpenChange,
  defaults = {},
}: AddGuestDialogProps) {
  const [created, setCreated] = useState<Created | null>(null);

  function handleOpenChange(next: boolean) {
    if (!next) setCreated(null);
    onOpenChange(next);
  }

  const approving = Boolean(defaults.requestId);
  const resending = Boolean(defaults.existingGuest);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>{created.name} can now unlock</DialogTitle>
              <DialogDescription>
                Nothing has been sent. Copy the reply and paste it into your
                email to them.
              </DialogDescription>
            </DialogHeader>
            <PasswordReveal {...created} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Done</Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {resending
                  ? `Resend access to ${defaults.name ?? 'this guest'}`
                  : approving
                    ? 'Approve request'
                    : 'Invite someone'}
              </DialogTitle>
              <DialogDescription>
                {resending
                  ? 'This makes a new password. Their old one stops working.'
                  : 'You’ll get one password to send them. It opens every password-protected project.'}
              </DialogDescription>
            </DialogHeader>
            {open && <GuestForm defaults={defaults} onCreated={setCreated} />}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GuestForm({
  defaults,
  onCreated,
}: {
  defaults: GuestDefaults;
  onCreated: (created: Created) => void;
}) {
  const id = useId();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<PasswordResult | null>(null);
  // Read once on mount: the form remounts each time the dialog opens
  const [expiry] = useState(() =>
    defaults.existingGuest
      ? expiryDefaults(defaults.existingGuest.expiresAt, new Date())
      : undefined,
  );

  const errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  const formError = result && !result.ok ? result.error : undefined;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const response = await addGuest(data);
      setResult(response);
      if (response.ok) {
        onCreated({
          name: String(data.get('name')).trim(),
          password: response.password,
          reply: response.reply,
          renewed: response.renewed,
        });
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-8" noValidate>
      {defaults.requestId && (
        <input type="hidden" name="requestId" value={defaults.requestId} />
      )}

      <fieldset className="space-y-4">
        <legend className="mb-4 text-sm font-semibold">Who</legend>
        <Field id={`${id}-name`} label="Name" error={errors.name?.[0]}>
          <Input
            id={`${id}-name`}
            name="name"
            defaultValue={defaults.name}
            maxLength={100}
            required
            autoComplete="off"
            aria-invalid={Boolean(errors.name)}
          />
        </Field>

        <Field
          id={`${id}-email`}
          label="Email (optional)"
          hint="An email that’s already a guest gets a new password instead of a second invite."
          error={errors.email?.[0]}
        >
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            defaultValue={defaults.email}
            autoComplete="off"
            aria-invalid={Boolean(errors.email)}
          />
        </Field>

        <Field
          id={`${id}-note`}
          label="Note (optional)"
          hint="Only you see this."
          error={errors.note?.[0]}
        >
          <Textarea
            id={`${id}-note`}
            name="note"
            maxLength={500}
            rows={2}
            aria-invalid={Boolean(errors.note)}
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-4 text-sm font-semibold">Access</legend>

        <ExpiryField
          defaultValue={expiry?.choice}
          defaultCustom={expiry?.custom}
          error={errors.expiryCustom?.[0]}
        />
      </fieldset>

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
          {pending
            ? 'Creating…'
            : defaults.existingGuest
              ? 'Make new password'
              : 'Create invite'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && (
        <p className="text-muted-foreground text-xs">{hint}</p>
      )}
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
