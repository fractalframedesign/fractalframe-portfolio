import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const principles = [
  {
    title: '1. Start with variables',
    body: 'Token names describe the purpose, not the specific value. This keeps the design system reusable and consistent.',
  },
  {
    title: '2. Keep semantics clear',
    body: 'Use semantic names like color, spacing and radius rather than raw hex values everywhere in the codebase.',
  },
  {
    title: '3. Update once',
    body: 'When a brand colour changes, adjust the token and every component using it inherits the update automatically.',
  },
];

const roles = [
  {
    badge: 'Primary',
    title: 'Main action / emphasis',
    body: 'Used for the central interaction in the UI: CTA buttons, links, active states and the most important brand accent.',
    points: ['High visibility', 'Strong brand presence', 'Should be used sparingly'],
  },
  {
    badge: 'Secondary',
    title: 'Supportive / alternate',
    body: 'Supports the primary action without competing with it. Useful for less critical actions, subtle highlights and navigation states.',
    points: ['Lower emphasis', 'Helpful, but not dominant', 'Often used for helper actions'],
  },
  {
    badge: 'Neutral',
    title: 'Background / text / structure',
    body: 'Handles layout, surfaces, borders and text hierarchy. Keeps things readable without adding strong emotion or visual noise.',
    points: ['Text and borders', 'Panels and cards', 'Low-contrast supporting UI'],
  },
];

const semanticMapping = [
  ['Primary button', '--color-background-buttons-primary-active'],
  ['Secondary button', '--color-background-buttons-secondary-active'],
  ['Neutral panel', '--color-background-surface-primary'],
  ['Primary text', '--color-typography-primary'],
];

const themeMapping = [
  ['Base layer', 'light: gray-3 / dark: gray-12-a'],
  ['Text colour', 'light: gray-12 / dark: white'],
  ['Surface contrast', 'light: white / dark: gray-12'],
  ['Theme trigger', 'data-theme="light" or "dark"'],
];

const cheatSheet = [
  {
    label: 'Primary',
    hint: 'Use for the main action',
    tokens: ['--color-background-buttons-primary-active', '--color-typography-accent-primary'],
  },
  {
    label: 'Secondary',
    hint: 'Use for supportive actions',
    tokens: ['--color-background-buttons-secondary-active', '--color-typography-accent-secondary'],
  },
  {
    label: 'Neutral',
    hint: 'Use for structure and text',
    tokens: ['--color-background-surface-primary', '--color-typography-primary'],
  },
  {
    label: 'Success / Error',
    hint: 'Use for status feedback',
    tokens: ['--color-typography-system-success', '--color-typography-system-error'],
  },
];

const palette = [
  { name: 'Blue / 7', token: '--global-blue-7' },
  { name: 'Purple / 5', token: '--global-purple-5' },
  { name: 'Green / 8', token: '--global-green-8' },
  { name: 'Gray / 12', token: '--global-gray-12' },
  { name: 'Red / 6', token: '--global-system-red-6' },
  { name: 'Success / 6', token: '--global-system-green-6' },
];

const usageExample = `.button {
  background: var(--global-purple-5);
  color: var(--global-white-1);
  border-radius: var(--radius-corner-radius-m);
  padding: var(--spacing-spacing-8) var(--spacing-spacing-16);
}

.card {
  background: var(--global-white-1);
  border: 1px solid var(--global-gray-3);
  box-shadow: 0 8px 24px var(--global-gray-1-a);
}`;

const setupExample = `<link rel="stylesheet" href="tokens.css" />

<!-- Colour mode: light is the default -->
<html data-theme="dark" data-radius="round">`;

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-muted text-foreground overflow-x-auto rounded-xl p-4 font-mono text-sm leading-relaxed">
      {code}
    </pre>
  );
}

function Mapping({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <h4 className="font-semibold">{title}</h4>
        <dl className="divide-border divide-y">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5 text-sm"
            >
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-mono text-xs">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

/** Explains how the Figma variable library is structured and how to use it. */
export function TokenGuide({
  total,
  collectionCount,
}: {
  total: number;
  collectionCount: number;
}) {
  return (
    <div className="space-y-14">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-4">
          <p className="text-primary text-sm font-medium">Design tokens</p>
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl">
            Token CSS, explained simply
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg text-pretty">
            Design tokens are the source of truth for colour, spacing and radius. Instead of
            hard-coded values, reference CSS variables such as{' '}
            <code className="bg-muted rounded px-1.5 py-0.5 text-sm">var(--global-purple-5)</code>{' '}
            and{' '}
            <code className="bg-muted rounded px-1.5 py-0.5 text-sm">
              var(--spacing-spacing-16)
            </code>{' '}
            so the whole interface stays aligned and easy to update.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
          <div className="border-border bg-card rounded-2xl border px-6 py-4 text-center">
            <p className="text-4xl font-semibold tracking-tight">{total}</p>
            <p className="text-muted-foreground text-sm">
              tokens / {collectionCount} collections
            </p>
          </div>
          <Button asChild variant="outline">
            <a href="/downloads/fintech-components/tokens.css" download>
              <Download />
              Download tokens.css
            </a>
          </Button>
        </div>
      </div>

      <ul className="grid gap-4 md:grid-cols-3">
        {principles.map((item) => (
          <li key={item.title}>
            <Card className="h-full">
              <CardContent className="space-y-2">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.body}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <section className="space-y-6">
        <div className="max-w-3xl space-y-3">
          <h3 className="text-2xl font-semibold tracking-tight">How theme meaning works</h3>
          <p className="text-muted-foreground">
            The system separates <strong className="text-foreground">raw tokens</strong> from{' '}
            <strong className="text-foreground">semantic tokens</strong>. Raw tokens define colour
            values like purple-5, blue-7 and gray-12. Semantic tokens define meaning: primary
            surfaces, secondary actions, neutral text, success states and surface backgrounds.
          </p>
        </div>

        <ul className="grid gap-4 md:grid-cols-3">
          {roles.map((role) => (
            <li key={role.badge}>
              <Card className="h-full">
                <CardContent className="space-y-3">
                  <span className="bg-muted text-muted-foreground inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                    {role.badge}
                  </span>
                  <h4 className="text-lg font-semibold">{role.title}</h4>
                  <p className="text-muted-foreground text-sm">{role.body}</p>
                  <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                    {role.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>

        <div className="grid gap-4 lg:grid-cols-2">
          <Mapping title="Semantic mapping" rows={semanticMapping.map(([a, b]) => [a, `var(${b})`])} />
          <Mapping title="How light and dark themes work" rows={themeMapping} />
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {cheatSheet.map((item) => (
            <li key={item.label}>
              <Card className="h-full">
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    {item.label}
                  </p>
                  <p className="font-medium">{item.hint}</p>
                  {item.tokens.map((token) => (
                    <code
                      key={token}
                      className="bg-muted block overflow-x-auto rounded-lg px-3 py-2 text-xs"
                    >
                      var({token})
                    </code>
                  ))}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-6">
        <h3 className="text-2xl font-semibold tracking-tight">Colour palette</h3>
        <ul data-token-scope className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {palette.map((swatch) => (
            <li key={swatch.token} className="border-border bg-card overflow-hidden rounded-xl border">
              <div className="h-20" style={{ background: `var(${swatch.token})` }} />
              <div className="space-y-0.5 p-3">
                <p className="text-sm font-medium">{swatch.name}</p>
                <p className="text-muted-foreground truncate font-mono text-[11px]">
                  var({swatch.token})
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-6">
        <h3 className="text-2xl font-semibold tracking-tight">How to use tokens in CSS</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">Load the file and pick a mode.</p>
            <CodeBlock code={setupExample} />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">Reference tokens instead of raw values.</p>
            <CodeBlock code={usageExample} />
          </div>
        </div>
      </section>
    </div>
  );
}
