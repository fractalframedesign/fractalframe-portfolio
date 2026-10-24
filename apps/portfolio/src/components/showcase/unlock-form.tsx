'use client';

import { useActionState } from 'react';

import {
  unlock,
  type UnlockState,
} from '@/app/(showcase)/showcase/unlock/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type UnlockFormProps = {
  project: string;
  next: string;
};

export default function UnlockForm({ project, next }: UnlockFormProps) {
  const [state, action, pending] = useActionState<UnlockState, FormData>(
    unlock,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="project" value={project} />
      <input type="hidden" name="next" value={next} />

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="off"
          autoFocus
          required
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? 'password-error' : undefined}
        />
        {state.error && (
          <p
            id="password-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {state.error}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Checking…' : 'Unlock'}
      </Button>
    </form>
  );
}
