import type { ReactNode } from 'react';

interface SpecimenProps {
  tag: string;
  hint?: string;
  /** Right side of the footer: controls (Switch, ToggleGroup, replay Button) */
  controls?: ReactNode;
  /** Extra classes for the stage, e.g. a gradient background */
  stageClassName?: string;
  children: ReactNode;
}

export function Specimen({
  tag,
  hint,
  controls,
  stageClassName,
  children,
}: SpecimenProps) {
  return (
    <div className="not-prose bigger-container">
      <figure className="bg-card my-8 overflow-hidden rounded-2xl border shadow-xs">
        <div className="border-b px-4 py-2.5">
          <span className="text-muted-foreground font-mono text-[10.5px] tracking-[0.12em] uppercase">
            {tag}
          </span>
        </div>
        <div
          className={`bg-muted/60 flex min-h-[150px] flex-wrap items-center justify-center gap-6 px-6 py-10 ${stageClassName ?? ''}`}
        >
          {children}
        </div>
        {(hint || controls) && (
          <figcaption className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-[13px]">
            <span>{hint}</span>
            {controls}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
