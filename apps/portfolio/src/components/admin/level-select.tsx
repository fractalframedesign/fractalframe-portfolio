'use client';

import { useState, useTransition } from 'react';

import { setProjectLevel } from '@/app/(admin)/admin/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { AccessLevel } from '@/lib/access/levels';

type LevelSelectProps = {
  slug: string;
  name: string;
  level: AccessLevel;
  /** Only showcase projects (with a demo) can be Unlocked */
  canUnlock: boolean;
};

export default function LevelSelect({
  slug,
  name,
  level,
  canUnlock,
}: LevelSelectProps) {
  const [value, setValue] = useState(level);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function change(next: string) {
    const previous = value;
    setValue(next as AccessLevel);
    setError(undefined);
    startTransition(async () => {
      const result = await setProjectLevel(slug, next as AccessLevel);
      if (!result.ok) {
        setValue(previous);
        setError(result.error ?? 'Couldn’t save. Try again.');
      }
    });
  }

  return (
    <div className="space-y-1">
      <Select value={value} onValueChange={change} disabled={pending}>
        <SelectTrigger className="w-36" aria-label={`Access for ${name}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="public">Public</SelectItem>
          {canUnlock ? (
            <SelectItem value="unlocked">Unlocked</SelectItem>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <SelectItem
                  value="unlocked"
                  disabled
                  className="data-[disabled]:pointer-events-auto"
                >
                  Unlocked
                </SelectItem>
              </TooltipTrigger>
              <TooltipContent side="right">
                Only projects with a demo can be Unlocked.
              </TooltipContent>
            </Tooltip>
          )}
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
