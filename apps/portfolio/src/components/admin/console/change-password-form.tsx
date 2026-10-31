"use client";

import { CircleCheck } from "lucide-react";
import { useActionState } from "react";

import {
  changePassword,
  type PasswordState,
} from "@/app/(admin)/admin/(console)/settings/actions";
import PasswordInput from "@/components/admin/console/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Field = NonNullable<PasswordState["field"]>;

const FIELDS: {
  name: Field;
  label: string;
  autoComplete: string;
  hint?: string;
}[] = [
  {
    name: "currentPassword",
    label: "Current password",
    autoComplete: "current-password",
  },
  {
    name: "newPassword",
    label: "New password",
    autoComplete: "new-password",
    hint: "At least 12 characters. A short sentence is easy to remember.",
  },
  {
    name: "confirmPassword",
    label: "Type the new password again",
    autoComplete: "new-password",
  },
];

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(
    changePassword,
    {},
  );

  return (
    <form action={action} className="max-w-sm space-y-4">
      {FIELDS.map((field) => {
        const error = state.field === field.name ? state.error : undefined;
        const describedBy = [
          field.hint && `${field.name}-hint`,
          error && `${field.name}-error`,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <PasswordInput
              id={field.name}
              name={field.name}
              autoComplete={field.autoComplete}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy || undefined}
            />
            {field.hint && (
              <p
                id={`${field.name}-hint`}
                className="text-muted-foreground text-sm"
              >
                {field.hint}
              </p>
            )}
            {error && (
              <p
                id={`${field.name}-error`}
                role="alert"
                className="text-destructive text-sm"
              >
                {error}
              </p>
            )}
          </div>
        );
      })}

      {state.error && !state.field && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Change password"}
        </Button>
        <p role="status" className="text-sm">
          {state.saved && !pending && (
            <span className="text-success-subtle-foreground inline-flex items-center gap-1.5">
              <CircleCheck className="size-4" aria-hidden />
              Password changed. Other devices are logged out.
            </span>
          )}
        </p>
      </div>
    </form>
  );
}
