'use client';

import { unstable_rethrow } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

import { setProjectLevel } from '@/app/(admin)/admin/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AccessLevel } from '@/lib/access/levels';

type SaveResult = { ok: true } | { ok: false; error?: string };

type AccessSwitchProps = {
  slug: string;
  name: string;
  level: AccessLevel;
  /** Only projects with a demo can be password protected */
  hasDemo: boolean;
  /** Injectable for tests; defaults to the server action */
  onSave?: (slug: string, level: AccessLevel) => Promise<SaveResult>;
};

const LABELS: Record<AccessLevel, string> = {
  public: 'Public',
  unlocked: 'Password protected',
  admin: 'Hidden',
};

const SAVED_FOR_MS = 2000;
const FALLBACK_ERROR = 'Couldn’t save. Try again.';

export default function AccessSwitch({
  slug,
  name,
  level,
  hasDemo,
  onSave = setProjectLevel,
}: AccessSwitchProps) {
  const [value, setValue] = useState(level);
  const [saving, startSaving] = useTransition();
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string>();
  const [confirming, setConfirming] = useState(false);
  // Blocks a second save (e.g. a double click on Make public) while one runs
  const inFlight = useRef(false);

  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(''), SAVED_FOR_MS);
    return () => clearTimeout(timer);
  }, [status]);

  function save(next: AccessLevel) {
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus('');
    setError(undefined);
    // Inside a transition so a thrown redirect (session expired) reaches
    // Next's RedirectBoundary instead of being shown as a failed save
    startSaving(async () => {
      try {
        const result = await onSave(slug, next);
        if (result.ok) {
          setValue(next);
          setStatus('Saved');
        } else {
          setError(result.error ?? FALLBACK_ERROR);
        }
      } catch (caught) {
        unstable_rethrow(caught);
        setError(FALLBACK_ERROR);
      } finally {
        inFlight.current = false;
      }
    });
  }

  function change(next: string) {
    const target = next as AccessLevel;
    if (target === value) return;
    // Making private or hidden work public always needs a second look
    if (target === 'public') {
      setConfirming(true);
      return;
    }
    save(target);
  }

  return (
    <div className="space-y-1">
      <Select value={value} onValueChange={change} disabled={saving}>
        <SelectTrigger className="w-48" aria-label={`Access for ${name}`}>
          <SelectValue>{saving ? 'Saving…' : LABELS[value]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="public">{LABELS.public}</SelectItem>
          {hasDemo && (
            <SelectItem value="unlocked">{LABELS.unlocked}</SelectItem>
          )}
          {/* Only for a project still hidden from an older setup */}
          {value === 'admin' && (
            <SelectItem value="admin">{LABELS.admin}</SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Always rendered so screen readers announce the text change */}
      <p role="status" className="text-muted-foreground text-sm">
        {status}
      </p>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Make {name} public?</AlertDialogTitle>
            <AlertDialogDescription>
              Anyone will be able to open it. People you invited keep their
              passwords for later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => save('public')}>
              Make public
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
