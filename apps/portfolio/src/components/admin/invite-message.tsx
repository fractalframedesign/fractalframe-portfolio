'use client';

import { CircleCheck, TriangleAlert } from 'lucide-react';
import { unstable_rethrow } from 'next/navigation';
import { useId, useState, useTransition } from 'react';

import { markRequestAnswered, sendInvite } from '@/app/(admin)/admin/actions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { INVITE_SUBJECT } from '@/lib/access/reply';

import CopyButton from './copy-button';

type InviteMessageProps = {
  guestId: string;
  name: string;
  email: string;
  /** Prefilled invitation with the link and password */
  reply: string;
  /** An existing guest got a new password, so their old one stopped working */
  renewed?: boolean;
  /** The request this answers; marked answered once the email is sent */
  requestId?: string;
};

const FAILED = 'The email didn’t send. Try again, or copy the message.';

/** Editable invitation; nothing is sent until Kiran presses Send invitation */
export default function InviteMessage({
  guestId,
  name,
  email,
  reply,
  renewed = false,
  requestId,
}: InviteMessageProps) {
  const id = useId();
  const [subject, setSubject] = useState(INVITE_SUBJECT);
  const [message, setMessage] = useState(reply);
  const [sentTo, setSentTo] = useState<string>();
  // Set when Kiran sent it another way, e.g. copied into Gmail
  const [answered, setAnswered] = useState(false);
  const done = Boolean(sentTo) || answered;
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function send() {
    setError(undefined);
    // Inside a transition so a thrown redirect (session expired) reaches
    // Next's RedirectBoundary instead of being shown as a failed send
    startTransition(async () => {
      try {
        const input = { subject, message };
        const result = requestId
          ? await sendInvite(guestId, input, requestId)
          : await sendInvite(guestId, input);
        if (result.ok) setSentTo(result.sentTo);
        else setError(result.error ?? FAILED);
      } catch (caught) {
        unstable_rethrow(caught);
        setError(FAILED);
      }
    });
  }

  function markAnswered() {
    if (!requestId) return;
    setError(undefined);
    startTransition(async () => {
      try {
        const result = await markRequestAnswered(requestId);
        if (result.ok) setAnswered(true);
        else setError(result.error ?? FAILED);
      } catch (caught) {
        unstable_rethrow(caught);
        setError(FAILED);
      }
    });
  }

  return (
    <div className="space-y-5">
      {renewed && (
        <Alert>
          <TriangleAlert aria-hidden />
          <AlertDescription>
            {name}&apos;s old password no longer works. Send them this one.
          </AlertDescription>
        </Alert>
      )}

      <dl className="flex gap-2 text-sm">
        <dt className="text-muted-foreground">To</dt>
        <dd className="font-medium">{email}</dd>
      </dl>

      <div className="space-y-2">
        <Label htmlFor={`${id}-subject`}>Subject</Label>
        <Input
          id={`${id}-subject`}
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          maxLength={200}
          disabled={done}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${id}-message`}>Message</Label>
        <Textarea
          id={`${id}-message`}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={12}
          maxLength={5000}
          disabled={done}
          className="font-mono text-sm"
        />
      </div>

      {/* Always rendered so the result is announced */}
      <p role="status" className="text-sm">
        {done && (
          <span className="text-success-subtle-foreground inline-flex items-center gap-1.5">
            <CircleCheck className="size-4" aria-hidden />
            {sentTo ? `Sent to ${sentTo}` : 'Marked as answered'}
          </span>
        )}
      </p>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <DialogFooter>
        {requestId && !done && (
          <Button variant="ghost" onClick={markAnswered} disabled={pending}>
            I sent it myself
          </Button>
        )}
        <CopyButton text={message} label="Copy message" />
        {done ? (
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        ) : (
          <Button
            onClick={send}
            disabled={pending || !subject.trim() || !message.trim()}
          >
            {pending ? 'Sending…' : 'Send invitation'}
          </Button>
        )}
      </DialogFooter>
    </div>
  );
}
