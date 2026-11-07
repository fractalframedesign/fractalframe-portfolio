import { cn } from '@/lib/utils';

/** Small, quiet drawings for the What I do tiles. Theme tokens only, so they follow light and dark mode. */

const Screen = ({ active = false }: { active?: boolean }) => (
  <span
    className={cn(
      'bg-background relative block h-14 w-10 rounded-md border',
      active ? 'border-foreground/70' : 'border-border',
    )}
  >
    <span
      className={cn(
        'absolute inset-x-1.5 top-2 h-1 rounded-full',
        active ? 'bg-muted-foreground' : 'bg-muted-foreground/30',
      )}
    />
  </span>
);

const Connector = () => <span className="bg-border block h-px w-4" />;

export const FlowArt = () => (
  <div aria-hidden="true" className="flex items-center gap-2">
    <Screen />
    <Connector />
    <Screen />
    <Connector />
    <Screen active />
  </div>
);

// Steps of the foreground colour so all six differ in light and dark mode
const SWATCHES = [
  'bg-foreground',
  'bg-foreground/70',
  'bg-foreground/45',
  'bg-foreground/25',
  'bg-foreground/10',
  'bg-success',
];

export const SwatchArt = () => (
  <div aria-hidden="true" className="grid grid-cols-3 gap-2">
    {SWATCHES.map((swatch) => (
      <span
        key={swatch}
        className={cn('ring-border block size-7 rounded-lg ring-1', swatch)}
      />
    ))}
  </div>
);

const PEOPLE = [
  'bg-muted-foreground/60',
  'bg-muted-foreground',
  'bg-foreground/80',
  'bg-muted-foreground/40',
];

export const TeamArt = () => (
  <div aria-hidden="true" className="flex ps-3">
    {PEOPLE.map((person) => (
      <span
        key={person}
        className={cn(
          'border-card -ms-3 block size-10 rounded-full border-4',
          person,
        )}
      />
    ))}
  </div>
);

export const CodeArt = () => (
  <pre
    aria-hidden="true"
    className="text-muted-foreground font-mono text-sm leading-relaxed"
  >
    {'<'}
    <span className="text-foreground">Card</span>
    {'\n  tone="calm"\n/>'}
  </pre>
);
