import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type Role, spacingMap, type TailwindTokens } from '@/lib/tailwind-tokens';

const CHECKER = {
  backgroundImage: 'repeating-conic-gradient(var(--muted) 0% 25%, transparent 0% 50%)',
  backgroundSize: '8px 8px',
};

const tiers = [
  {
    title: 'Palette',
    body: 'Raw colours from Figma, named the Tailwind way. Nothing in a component should use these directly.',
    code: 'bg-purple-5  text-gray-12/74',
  },
  {
    title: 'Roles',
    body: 'The shadcn names components use. Each role is built from one Figma semantic token.',
    code: 'bg-primary  text-muted-foreground',
  },
  {
    title: 'Themes',
    body: 'Small overrides on top of the roles. Light and dark, square and round, and brand are separate switches.',
    code: '.dark  [data-radius="round"]  [data-brand]',
  },
];

const alphaExamples = [
  ['--global-gray-10-a', 'text-gray-12/74'],
  ['--global-white-9-a', 'text-white/82'],
  ['--global-purple-9-a', 'bg-purple-5/80'],
  ['--global-gray-1-a', 'bg-gray-12/4'],
];

const setupExample = `@import "tailwindcss";
@import "./tokens.tailwind.css";`;

const usageExample = `<button class="rounded-button-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
  Send money
</button>

<div class="rounded-2xl border border-border bg-card p-6 text-card-foreground">
  <p class="text-muted-foreground">Total balance</p>
  <p class="text-success">+2.03%</p>
</div>`;

const themeExample = `<html class="dark">                     <!-- or data-theme="dark" -->
<html data-radius="round">              <!-- pill buttons -->
<html data-brand="partner">             <!-- brand override -->`;

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-muted text-foreground overflow-x-auto rounded-xl p-4 font-mono text-sm leading-relaxed">
      {code}
    </pre>
  );
}

function Swatch({ short, dark }: { short: string; dark?: boolean }) {
  return (
    <span
      data-token-scope
      {...(dark ? { 'data-theme': 'dark' } : {})}
      className="border-border relative block h-7 w-full min-w-24 overflow-hidden rounded-md border"
      style={CHECKER}
    >
      <span className="absolute inset-0" style={{ background: `var(--global-${short})` }} />
    </span>
  );
}

function RoleRow({ role }: { role: Role }) {
  return (
    <tr className="border-border border-b align-middle">
      <td className="py-2.5 pr-4 font-mono text-xs">{role.name}</td>
      <td className="text-muted-foreground py-2.5 pr-4 font-mono text-xs">
        {role.source.startsWith('added') ? role.source : `--color-${role.source}`}
      </td>
      <td className="py-2.5 pr-3">
        <Swatch short={role.light} />
      </td>
      <td className="py-2.5 pr-3">
        <Swatch short={role.dark} dark />
      </td>
      <td className="py-2.5">
        {role.partner ? (
          <Swatch short={role.partner} />
        ) : (
          <span className="text-muted-foreground text-xs">same as base</span>
        )}
      </td>
    </tr>
  );
}

/** Documents the reduced, Tailwind v4 and shadcn compatible token file. */
export function TailwindTokensGuide({ tokens }: { tokens: TailwindTokens }) {
  const { stats, roles, css } = tokens;
  const saved = Math.round((1 - stats.total / stats.original) * 100);

  const rows = [
    { label: 'Colour palette', before: 156, after: stats.palette, note: 'Alpha steps become the opacity modifier' },
    { label: 'Colour roles', before: 117, after: stats.roles, note: 'Flattened to shadcn role names' },
    { label: 'Corner radius', before: 15, after: stats.radius, note: 'Button radius follows the radius mode' },
    { label: 'Spacing', before: 17, after: 0, note: 'Matches Tailwind\'s default 4px scale' },
  ];

  return (
    <div className="space-y-14">
      <div className="max-w-3xl space-y-4">
        <p className="text-primary text-sm font-medium">Theming-ready tokens</p>
        <h2 className="text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl">
          Tailwind and shadcn ready
        </h2>
        <p className="text-muted-foreground text-lg text-pretty">
          The Figma library has {stats.original} variables. In a Tailwind codebase most of them
          are already provided: opacity, spacing and button states. This is the same system reduced
          to {stats.total} tokens, generated from the Figma file, so classes like{' '}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">bg-primary</code> and{' '}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">text-muted-foreground</code>{' '}
          work directly.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild>
            <a href="/showcase/fintech-components/tokens.tailwind.css" download>
              <Download />
              Download tokens.tailwind.css
            </a>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-xl text-left text-sm">
          <thead>
            <tr className="border-border text-muted-foreground border-b text-xs tracking-wide uppercase">
              <th className="py-2 pr-4 font-semibold">Group</th>
              <th className="py-2 pr-4 font-semibold">Figma</th>
              <th className="py-2 pr-4 font-semibold">Optimised</th>
              <th className="py-2 font-semibold">What changed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-border border-b">
                <td className="py-3 pr-4 font-medium">{row.label}</td>
                <td className="text-muted-foreground py-3 pr-4">{row.before}</td>
                <td className="py-3 pr-4 font-medium">{row.after}</td>
                <td className="text-muted-foreground py-3">{row.note}</td>
              </tr>
            ))}
            <tr>
              <td className="py-3 pr-4 font-semibold">Total</td>
              <td className="text-muted-foreground py-3 pr-4">{stats.original}</td>
              <td className="py-3 pr-4 font-semibold">{stats.total}</td>
              <td className="text-muted-foreground py-3">{saved}% fewer tokens</td>
            </tr>
          </tbody>
        </table>
      </div>

      <section className="space-y-6">
        <h3 className="text-2xl font-semibold tracking-tight">Three tiers</h3>
        <ul className="grid gap-4 md:grid-cols-3">
          {tiers.map((tier, index) => (
            <li key={tier.title}>
              <Card className="h-full">
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Tier {index + 1}
                  </p>
                  <h4 className="text-lg font-semibold">{tier.title}</h4>
                  <p className="text-muted-foreground text-sm">{tier.body}</p>
                  <code className="bg-muted block overflow-x-auto rounded-lg px-3 py-2 text-xs">
                    {tier.code}
                  </code>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-6">
        <div className="max-w-3xl space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight">Roles</h3>
          <p className="text-muted-foreground">
            Every role with the Figma token it comes from, in light and dark. The last column shows
            the <code className="bg-muted rounded px-1.5 py-0.5 text-sm">partner</code> brand
            example: a new brand only overrides the roles that change.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-3xl text-left text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-xs tracking-wide uppercase">
                <th className="py-2 pr-4 font-semibold">Role</th>
                <th className="py-2 pr-4 font-semibold">Built from</th>
                <th className="py-2 pr-3 font-semibold">Light</th>
                <th className="py-2 pr-3 font-semibold">Dark</th>
                <th className="py-2 font-semibold">Partner brand</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <RoleRow key={role.name} role={role} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-2xl font-semibold tracking-tight">Using it</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">Import the file after Tailwind.</p>
            <CodeBlock code={setupExample} />
            <p className="text-muted-foreground pt-2 text-sm">Switch themes with attributes.</p>
            <CodeBlock code={themeExample} />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">Components use roles, not values.</p>
            <CodeBlock code={usageExample} />
          </div>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section className="space-y-4">
          <h3 className="text-2xl font-semibold tracking-tight">Alpha steps become opacity</h3>
          <p className="text-muted-foreground text-sm">
            The {156 - stats.palette} pre-baked alpha tokens are replaced by
            Tailwind&apos;s opacity modifier, which uses the same base colour and percentage.
          </p>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-xs tracking-wide uppercase">
                <th className="py-2 pr-4 font-semibold">Figma</th>
                <th className="py-2 font-semibold">Tailwind</th>
              </tr>
            </thead>
            <tbody>
              {alphaExamples.map(([from, to]) => (
                <tr key={from} className="border-border border-b">
                  <td className="text-muted-foreground py-2.5 pr-4 font-mono text-xs">{from}</td>
                  <td className="py-2.5 font-mono text-xs">{to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-semibold tracking-tight">Spacing is already a scale</h3>
          <p className="text-muted-foreground text-sm">
            All {spacingMap.length + 1} Figma spacing steps land on Tailwind&apos;s default scale, so
            they need no tokens. For example <span className="font-mono text-xs">p-4</span> is 16px.
          </p>
          <ul className="grid grid-cols-2 gap-x-6 sm:grid-cols-4">
            {spacingMap.map(([px, utility]) => (
              <li key={px} className="border-border flex justify-between border-b py-2 text-xs">
                <span className="text-muted-foreground font-mono">{px}</span>
                <span className="font-mono">{utility}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <details className="border-border rounded-xl border">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          View tokens.tailwind.css
        </summary>
        <pre className="bg-muted text-foreground max-h-[32rem] overflow-auto rounded-b-xl p-4 font-mono text-xs leading-relaxed">
          {css}
        </pre>
      </details>
    </div>
  );
}
