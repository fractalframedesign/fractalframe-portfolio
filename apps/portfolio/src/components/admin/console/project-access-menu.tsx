'use client';

import { Ellipsis } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AccessLevel } from '@/lib/access/levels';

type SaveResult = { ok: true } | { ok: false; error?: string };

type ProjectAccessMenuProps = {
  slug: string;
  name: string;
  level: AccessLevel;
  /** Injectable for tests; defaults to the server action */
  onSave?: (slug: string, level: AccessLevel) => Promise<SaveResult>;
};

const SAVED_FOR_MS = 2000;
const FALLBACK_ERROR = 'Couldn’t save. Try again.';

/** The "…" menu on a project row: Add password / Make public */
export default function ProjectAccessMenu({
  slug,
  name,
  level,
  onSave = setProjectLevel,
}: ProjectAccessMenuProps) {
  const [value, setValue] = useState(level);
  const [, startSaving] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
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
    setIsSaving(true);
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
        setIsSaving(false);
      }
    });
  }

  function change(target: AccessLevel) {
    if (target === value) return;
    // Making private or hidden work public always needs a second look
    if (target === 'public') {
      setConfirming(true);
      return;
    }
    save(target);
  }

  return (
    <div className="flex items-center gap-3">
      {/* Always rendered so screen readers announce the text change */}
      <p role="status" className="text-muted-foreground text-sm">
        {isSaving ? 'Saving…' : status}
      </p>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Access for ${name}`}
            disabled={isSaving}
          >
            <Ellipsis aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {value !== 'public' && (
            <DropdownMenuItem onSelect={() => change('public')}>
              Make public
            </DropdownMenuItem>
          )}
          {value !== 'unlocked' && (
            <DropdownMenuItem onSelect={() => change('unlocked')}>
              Add password
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
