'use client';

import { useId, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { ExpiryChoice } from '@/lib/access/expiry';

const CHOICES: { value: ExpiryChoice; label: string }[] = [
  { value: '24h', label: '24 hours' },
  { value: '48h', label: '48 hours' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'custom', label: 'Custom' },
  { value: 'never', label: 'Never' },
];

type ExpiryFieldProps = {
  defaultValue?: ExpiryChoice;
  /** Message for the custom date and time, from the action's fieldErrors */
  error?: string;
};

/** Posts `expiry` and, for Custom, `expiryCustom` (Tokyo time) with its form */
export default function ExpiryField({
  defaultValue = '7d',
  error,
}: ExpiryFieldProps) {
  const id = useId();
  const [choice, setChoice] = useState<ExpiryChoice>(defaultValue);

  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-sm font-medium">Access ends after</legend>
      <input type="hidden" name="expiry" value={choice} />
      <RadioGroup
        value={choice}
        onValueChange={(value) => setChoice(value as ExpiryChoice)}
        className="grid-cols-3"
      >
        {CHOICES.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
            <Label htmlFor={`${id}-${option.value}`} className="font-normal">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {choice === 'custom' && (
        <div className="space-y-2">
          <Label htmlFor={`${id}-custom`}>Date and time (Tokyo time)</Label>
          <Input
            id={`${id}-custom`}
            name="expiryCustom"
            type="datetime-local"
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-custom-error` : undefined}
          />
          {error && (
            <p
              id={`${id}-custom-error`}
              role="alert"
              className="text-destructive text-sm"
            >
              {error}
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}
