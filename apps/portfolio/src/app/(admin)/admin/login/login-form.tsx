"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/(admin)/admin/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "password-error" : undefined}
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
        {pending ? "Checking…" : "Log in"}
      </Button>
    </form>
  );
}
