'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type ScrubFieldProps = {
  label: string;
  value: number;
  range: { min: number; max: number; step: number };
  format: (value: number) => string;
  /** Named values in the menu beside the field */
  presets?: Array<{ label: string; value: number }>;
  /** `final` is true once a drag ends, a preset is picked or a typed value is committed */
  onValueChange: (value: number, final: boolean) => void;
  className?: string;
};

/**
 * A slider that reads like a field: drag anywhere on it (in fine steps while
 * dragging, snapped to the step on release), click the value to type one,
 * or pick a preset from the menu beside it. Arrow keys work too.
 */
export default function ScrubField({
  label,
  value,
  range: { min, max, step },
  format,
  presets,
  onValueChange,
  className,
}: ScrubFieldProps) {
  const [dragging, setDragging] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const id = React.useId();

  const decimals = (String(step).split('.')[1] ?? '').length;
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const snap = (n: number) =>
    Number(clamp(Math.round(n / step) * step).toFixed(decimals));
  const progress = (clamp(value) - min) / (max - min);

  function commitTyped(text: string) {
    setEditing(false);
    const typed = parseFloat(text);
    if (!Number.isNaN(typed)) onValueChange(snap(typed), true);
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <SliderPrimitive.Root
        value={[value]}
        min={min}
        max={max}
        step={step / 5}
        onValueChange={([next]) => {
          setDragging(true);
          onValueChange(next, false);
        }}
        onValueCommit={([next]) => {
          setDragging(false);
          onValueChange(snap(next), true);
        }}
        data-dragging={dragging || undefined}
        className="group/field bg-muted hover:bg-muted/70 has-[[role=slider]:focus-visible]:ring-ring/50 relative flex h-8 min-w-0 flex-1 cursor-ew-resize touch-none items-center rounded-lg transition-colors select-none has-[[role=slider]:focus-visible]:ring-[3px]"
      >
        {/* Fill: starts 2rem wide so the label always sits on it */}
        <span
          aria-hidden
          className={cn(
            'bg-foreground/10 ring-foreground/5 group-data-[dragging]/field:bg-foreground/15 absolute inset-y-0 left-0 rounded-lg shadow-xs ring-1 transition-[width,background-color,opacity] duration-200 ease-out ring-inset group-data-[dragging]/field:transition-colors',
            editing && 'opacity-0',
          )}
          style={{ width: `calc(2rem + (100% - 2rem) * ${progress})` }}
        >
          <span className="bg-foreground/70 absolute top-1/2 right-2 h-4.5 w-0.5 -translate-y-1/2 rounded-full opacity-0 transition-opacity group-hover/field:opacity-60 group-data-[dragging]/field:opacity-100" />
        </span>

        <span
          id={id}
          className="text-muted-foreground pointer-events-none relative z-10 min-w-0 flex-1 truncate pl-3 text-[13px] font-medium transition-opacity group-data-[dragging]/field:opacity-70"
        >
          {label}
        </span>

        {editing ? (
          <input
            autoFocus
            inputMode="decimal"
            aria-label={label}
            defaultValue={String(value)}
            onPointerDown={(event) => event.stopPropagation()}
            onFocus={(event) => event.currentTarget.select()}
            onBlur={(event) => commitTyped(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitTyped(event.currentTarget.value);
              if (event.key === 'Escape') setEditing(false);
              event.stopPropagation();
            }}
            className="text-foreground relative z-10 w-18 bg-transparent pr-3 text-right text-[13px] tabular-nums outline-none"
          />
        ) : (
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setEditing(true)}
            className="text-foreground relative z-10 cursor-text pr-3 text-[13px] tabular-nums"
          >
            {format(value)}
          </button>
        )}

        <SliderPrimitive.Thumb
          aria-labelledby={id}
          aria-valuetext={format(value)}
          className="absolute inset-y-0 w-px opacity-0 outline-none"
        />
      </SliderPrimitive.Root>

      {presets && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`${label} presets`}
            className="bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground data-[state=open]:bg-muted/70 data-[state=open]:text-foreground focus-visible:ring-ring/50 grid size-8 shrink-0 place-items-center rounded-lg transition-[color,background-color,scale] outline-none focus-visible:ring-[3px] active:scale-96"
          >
            <ChevronDown className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Presets
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={String(value)}
              onValueChange={(next) => onValueChange(Number(next), true)}
            >
              {presets.map((preset) => (
                <DropdownMenuRadioItem
                  key={preset.label}
                  value={String(preset.value)}
                >
                  <span className="flex-1">{preset.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {format(preset.value)}
                  </span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
