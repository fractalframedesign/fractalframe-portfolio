'use client';

import { useEffect, useState } from 'react';

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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), SAVED_FOR_MS);
    return () => clearTimeout(timer);
  }, [saved]);

  async function save(next: AccessLevel) {
    setSaving(true);
    setSaved(false);
    setError(undefined);
    try {
      const result = await onSave(slug, next);
      if (result.ok) {
        setValue(next);
        setSaved(true);
      } else {
        setError(result.error ?? FALLBACK_ERROR);
      }
    } catch {
      setError(FALLBACK_ERROR);
    } finally {
      setSaving(false);
    }
  }

  function change(next: string) {
    const target = next as AccessLevel;
    if (target === value) return;
    // Publishing private work is the one change that needs a second look
    if (value === 'unlocked' && target === 'public') {
      setConfirming(true);
      return;
    }
    void save(target);
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

      {saved && (
        <p role="status" className="text-muted-foreground text-sm">
          Saved
        </p>
      )}
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
            <AlertDialogAction onClick={() => void save('public')}>
              Make public
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
