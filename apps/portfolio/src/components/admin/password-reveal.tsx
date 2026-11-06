'use client';

import { TriangleAlert } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';

import CopyButton from './copy-button';

type PasswordRevealProps = {
  name: string;
  password: string;
  reply: string;
  /** An existing guest got a new password, so their old one stopped working */
  renewed?: boolean;
};

/** The new password, shown once, with buttons to copy it or a ready reply */
export default function PasswordReveal({
  name,
  password,
  reply,
  renewed = false,
}: PasswordRevealProps) {
  return (
    <div className="space-y-4">
      {renewed && (
        <Alert>
          <TriangleAlert aria-hidden />
          <AlertDescription>
            {name}&apos;s old password no longer works. Send them this one.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          Password for {name}. It&apos;s shown only this once, so copy it before
          you close.
        </p>
        <p className="bg-muted rounded-md px-4 py-3 font-mono text-lg tracking-wide select-all">
          {password}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton text={password} label="Copy" />
        <CopyButton text={reply} label="Copy reply" variant="default" />
      </div>
    </div>
  );
}
