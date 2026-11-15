'use client';

import { REGEXP_ONLY_DIGITS } from 'input-otp';
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';

import RequestAccessForm from '@/components/access/request-access-form';
import UnlockForm from '@/components/access/unlock-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { startSignIn, verifySignIn } from '@/lib/access/actions/sign-in';
import type { SignInState } from '@/lib/access/actions/sign-in-messages';

const CODE_LENGTH = 6;

type Intent = 'send-code' | 'verify' | 'change-email';

type SignInCardProps = {
  project: { slug: string; name: string };
  /** Where to go once signed in; the server keeps it inside the project */
  next: string;
  /** From the link in the code email: the code is already on its way */
  initialEmail?: string;
  /** Off where the card sits below content the visitor should read first */
  autoFocus?: boolean;
};

/**
 * Sign-in for a locked project: email, then the 6-digit code sent to it.
 * An email that isn't a guest's gets the access request form instead.
 */
export default function SignInCard({
  project,
  next,
  initialEmail,
  autoFocus = true,
}: SignInCardProps) {
  const [usePassword, setUsePassword] = useState(false);
  const [code, setCode] = useState('');
  const [resendIn, setResendIn] = useState(0);
  // After the first answer the card has the visitor's attention, so each new
  // step takes focus; before that it follows `autoFocus`
  const [started, setStarted] = useState(false);
  const codeForm = useRef<HTMLFormElement>(null);
  const [, startTransition] = useTransition();

  const [state, dispatch, pending] = useActionState<SignInState, FormData>(
    async (previous, formData) => {
      const intent = formData.get('intent') as Intent;
      setStarted(true);
      if (intent === 'change-email') {
        return { step: 'email', email: previous.email };
      }

      // A successful sign-in redirects, so there is no answer to show
      const result =
        (intent === 'verify'
          ? await verifySignIn(previous, formData)
          : await startSignIn(previous, formData)) ?? previous;
      setCode('');
      if (result.retryAfterSeconds !== undefined) {
        setResendIn(result.retryAfterSeconds);
      }
      return result;
    },
    initialEmail ? { step: 'code', email: initialEmail } : { step: 'email' },
  );

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((left) => left - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  /** For the link-style buttons, which sit outside a form */
  function send(intent: Intent) {
    const formData = new FormData();
    formData.set('intent', intent);
    formData.set('project', project.slug);
    formData.set('next', next);
    formData.set('email', state.email ?? '');
    startTransition(() => dispatch(formData));
  }

  const focus = autoFocus || started;
  const differentEmail = (
    <Button
      type="button"
      variant="link"
      className="h-auto p-0"
      disabled={pending}
      onClick={() => send('change-email')}
    >
      Use a different email
    </Button>
  );

  if (usePassword) {
    return (
      <div className="space-y-4">
        <UnlockForm project={project.slug} next={next} />
        <Button
          type="button"
          variant="link"
          className="h-auto p-0"
          onClick={() => setUsePassword(false)}
        >
          Back
        </Button>
      </div>
    );
  }

  if (state.step === 'request') {
    return (
      <div className="space-y-4">
        <p className="text-sm">
          <strong className="break-all">{state.email}</strong> isn&apos;t on my
          guest list yet. Tell me who you are and I&apos;ll get back to you.
        </p>
        <RequestAccessForm project={project} defaultEmail={state.email} />
        {differentEmail}
      </div>
    );
  }

  if (state.step === 'code') {
    return (
      <div className="space-y-4">
        <form ref={codeForm} action={dispatch} className="space-y-4">
          <input type="hidden" name="intent" value="verify" />
          <input type="hidden" name="project" value={project.slug} />
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="email" value={state.email ?? ''} />

          <p role="status" className="text-sm">
            We sent a 6-digit code to{' '}
            <strong className="break-all">{state.email}</strong>. It works for
            10 minutes.
          </p>

          <InputOTP
            name="code"
            aria-label="6-digit code"
            aria-invalid={Boolean(state.error)}
            aria-describedby={state.error ? 'sign-in-error' : undefined}
            maxLength={CODE_LENGTH}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern={REGEXP_ONLY_DIGITS}
            autoFocus={focus}
            required
            value={code}
            onChange={setCode}
            onComplete={() => codeForm.current?.requestSubmit()}
            containerClassName="w-full"
          >
            <InputOTPGroup className="w-full">
              {Array.from({ length: CODE_LENGTH }, (_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  aria-invalid={Boolean(state.error)}
                  className="h-11 w-auto flex-1 text-lg tabular-nums"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {state.error && (
            <p
              id="sign-in-error"
              role="alert"
              className="text-destructive text-sm"
            >
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Checking…' : 'Sign in'}
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 tabular-nums"
            disabled={pending || resendIn > 0}
            onClick={() => send('send-code')}
          >
            {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
          </Button>
          {differentEmail}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form action={dispatch} className="space-y-4">
        <input type="hidden" name="intent" value="send-code" />
        <input type="hidden" name="project" value={project.slug} />
        <input type="hidden" name="next" value={next} />

        <div className="space-y-2">
          <Label htmlFor="sign-in-email">Email</Label>
          <Input
            id="sign-in-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email}
            autoFocus={focus}
            required
            aria-invalid={Boolean(state.error)}
            aria-describedby={state.error ? 'sign-in-error' : undefined}
          />
          {state.error && (
            <p
              id="sign-in-error"
              role="alert"
              className="text-destructive text-sm"
            >
              {state.error}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Checking…' : 'Continue'}
        </Button>
      </form>

      <Button
        type="button"
        variant="link"
        className="h-auto p-0"
        onClick={() => setUsePassword(true)}
      >
        Use a password instead
      </Button>
    </div>
  );
}
