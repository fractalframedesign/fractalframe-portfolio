'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useActionState, useState } from 'react';

import { login, type LoginState } from '@/app/(admin)/admin/login/actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            autoFocus
            required
            className="pr-12"
            aria-invalid={Boolean(state.error)}
            aria-describedby={state.error ? 'password-error' : undefined}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute inset-y-0 right-1 my-auto text-muted-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? (
              <EyeOff aria-hidden />
            ) : (
              <Eye aria-hidden />
            )}
          </Button>
        </div>
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
