'use client';

import { useActionState } from 'react';

import { login, type LoginState } from '@/app/(admin)/admin/login/actions';
import PasswordInput from '@/components/admin/console/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
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

      <div className="flex items-center gap-2">
        <Checkbox id="rememberMe" name="rememberMe" />
        <Label htmlFor="rememberMe" className="cursor-pointer font-normal">
          Remember me for 30 days
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Checking…' : 'Log in'}
      </Button>
    </form>
  );
}
