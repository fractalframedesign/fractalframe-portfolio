'use client';

import { CircleCheck } from 'lucide-react';
import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  requestAccess,
  type RequestAccessState,
} from '@/lib/access/actions/request-access';

type RequestAccessDialogProps = {
  project: { slug: string; name: string };
};

export default function RequestAccessDialog({
  project,
}: RequestAccessDialogProps) {
  const [state, action, pending] = useActionState<RequestAccessState, FormData>(
    requestAccess,
    {},
  );
  const errors = state.fieldErrors ?? {};

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="h-auto p-0">
          Request access
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {state.sent ? (
          <>
            <DialogHeader>
              <CircleCheck
                className="text-muted-foreground size-5"
                aria-hidden
              />
              <DialogTitle>Request sent</DialogTitle>
              <DialogDescription>
                Thanks. I&apos;ll review it and email you a password for{' '}
                {project.name}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Done</Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form action={action} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Request access to {project.name}</DialogTitle>
              <DialogDescription>
                Tell me who you are and I&apos;ll email you a password.
              </DialogDescription>
            </DialogHeader>

            <input type="hidden" name="project" value={project.slug} />
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="hidden"
            />

            <div className="space-y-4">
              <Field id="request-name" label="Name" error={errors.name?.[0]}>
                <Input
                  id="request-name"
                  name="name"
                  defaultValue={state.values?.name}
                  autoComplete="name"
                  required
                  maxLength={100}
                  {...errorProps('request-name', errors.name?.[0])}
                />
              </Field>
              <Field id="request-email" label="Email" error={errors.email?.[0]}>
                <Input
                  id="request-email"
                  name="email"
                  defaultValue={state.values?.email}
                  type="email"
                  autoComplete="email"
                  required
                  {...errorProps('request-email', errors.email?.[0])}
                />
              </Field>
              <Field
                id="request-message"
                label="Message (optional)"
                error={errors.message?.[0]}
              >
                <Textarea
                  id="request-message"
                  name="message"
                  defaultValue={state.values?.message}
                  placeholder="Who you are and why you’d like to see it"
                  maxLength={1000}
                  {...errorProps('request-message', errors.message?.[0])}
                />
              </Field>
            </div>

            {state.error && (
              <p role="alert" className="text-destructive text-sm">
                {state.error}
              </p>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={pending}>
                {pending ? 'Sending…' : 'Send request'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

/** Marks a field invalid and links it to its error message */
function errorProps(id: string, error?: string) {
  return error
    ? { 'aria-invalid': true, 'aria-describedby': `${id}-error` }
    : {};
}
