'use client';

import { CircleCheck } from 'lucide-react';
import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  requestAccess,
  type RequestAccessState,
} from '@/lib/access/actions/request-access';

type RequestAccessFormProps = {
  project: { slug: string; name: string };
  /** The email they already typed on the sign-in step; still editable */
  defaultEmail?: string;
};

export default function RequestAccessForm({
  project,
  defaultEmail,
}: RequestAccessFormProps) {
  const [state, action, pending] = useActionState<RequestAccessState, FormData>(
    requestAccess,
    {},
  );
  const errors = state.fieldErrors ?? {};

  if (state.sent) {
    return (
      <p role="status" className="flex items-start gap-2 text-sm">
        <CircleCheck
          className="text-muted-foreground mt-0.5 size-4 shrink-0"
          aria-hidden
        />
        <span>
          Request sent. Thanks. I&apos;ll review it and email you when
          you&apos;re in.
        </span>
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="project" value={project.slug} />
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <Field id="request-name" label="Name" error={errors.name?.[0]}>
        <Input
          id="request-name"
          name="name"
          defaultValue={state.values?.name}
          autoComplete="name"
          autoFocus
          required
          maxLength={100}
          {...errorProps('request-name', errors.name?.[0])}
        />
      </Field>
      <Field id="request-email" label="Email" error={errors.email?.[0]}>
        <Input
          id="request-email"
          name="email"
          defaultValue={state.values?.email ?? defaultEmail}
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

      {state.error && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Sending…' : 'Send request'}
      </Button>
    </form>
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
