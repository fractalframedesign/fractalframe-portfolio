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
import { Checkbox } from '@/components/ui/checkbox';
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

import ExpiryField from './expiry-field';
import PasswordReveal from './password-reveal';

export type ProjectOption = { slug: string; name: string };

export type GuestDefaults = {
  name?: string;
  email?: string;
  products?: string[];
  /** Set when approving a request: the request is marked approved */
  requestId?: string;
};

type AddGuestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Unlocked projects only */
  projects: ProjectOption[];
  defaults?: GuestDefaults;
};

type Created = {
  name: string;
  password: string;
  reply: string;
  rotated: boolean;
};

export default function AddGuestDialog({
  open,
  onOpenChange,
  projects,
  defaults = {},
}: AddGuestDialogProps) {
  const [created, setCreated] = useState<Created | null>(null);

  function handleOpenChange(next: boolean) {
    if (!next) setCreated(null);
    onOpenChange(next);
  }

  const approving = Boolean(defaults.requestId);

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
                {approving ? 'Approve request' : 'Invite someone'}
              </DialogTitle>
              <DialogDescription>
                Choose who it’s for, which projects and for how long. You’ll get
                one password to send them.
              </DialogDescription>
            </DialogHeader>
            {open && (
              <GuestForm
                projects={projects}
                defaults={defaults}
                onCreated={setCreated}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GuestForm({
  projects,
  defaults,
  onCreated,
}: {
  projects: ProjectOption[];
  defaults: GuestDefaults;
  onCreated: (created: Created) => void;
}) {
  const id = useId();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<PasswordResult | null>(null);
  const [picked, setPicked] = useState<string[]>(
    (defaults.products ?? []).filter((slug) =>
      projects.some((project) => project.slug === slug),
    ),
  );

  const errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  const formError = result && !result.ok ? result.error : undefined;

  function toggle(slug: string, checked: boolean) {
    setPicked((current) =>
      checked ? [...current, slug] : current.filter((item) => item !== slug),
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    for (const slug of picked) data.append('products', slug);
    startTransition(async () => {
      const response = await addGuest(data);
      setResult(response);
      if (response.ok) {
        onCreated({
          name: String(data.get('name')).trim(),
          password: response.password,
          reply: response.reply,
          rotated: response.rotated,
        });
      }
    });
  }

  if (projects.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No project is password protected yet. Set a project to Password
        protected first, then add guests to it.
      </p>
    );
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
          hint="Inviting the same email again gives them a new password instead of a second invite."
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

        <fieldset className="space-y-3">
          <legend className="mb-3 text-sm font-medium">Projects</legend>
          <ul className="space-y-2">
            {projects.map((project) => (
              <li key={project.slug} className="flex items-center gap-2">
                <Checkbox
                  id={`${id}-${project.slug}`}
                  checked={picked.includes(project.slug)}
                  onCheckedChange={(checked) =>
                    toggle(project.slug, checked === true)
                  }
                />
                <Label
                  htmlFor={`${id}-${project.slug}`}
                  className="font-normal"
                >
                  {project.name}
                </Label>
              </li>
            ))}
          </ul>
          {errors.products && (
            <p role="alert" className="text-destructive text-sm">
              {errors.products[0]}
            </p>
          )}
        </fieldset>

        <ExpiryField error={errors.expiryCustom?.[0]} />
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
          {pending ? 'Creating…' : 'Create invite'}
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
