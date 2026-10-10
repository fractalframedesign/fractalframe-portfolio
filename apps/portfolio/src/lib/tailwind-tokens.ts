import { getDesignTokens } from './design-tokens';

/**
 * Builds a Tailwind v4 + shadcn style version of the Figma token library.
 *
 * Tier 1  Palette      raw colours, `bg-purple-5`
 * Tier 2  Roles        shadcn names that components use, `bg-primary`
 * Tier 3  Themes       small overrides: light/dark, square/round, brand
 *
 * Everything is derived from tokens.css, so the palette values never drift from Figma.
 */

/** Figma family names mapped to Tailwind-style names */
const FAMILY_RENAMES: Record<string, string> = {
  'system-red': 'red',
  'system-green': 'green',
  green: 'teal',
};

export type Role = {
  /** shadcn variable name without the leading dashes */
  name: string;
  /** Figma semantic token this role is built from ("added" when Figma has none) */
  source: string;
  /** Global token short names, e.g. `gray-3` or `white-9-a` */
  light: string;
  dark: string;
  /** Optional override used by the partner brand example */
  partner?: string;
};

const roles: Role[] = [
  { name: 'background', source: 'background-surface-primary', light: 'gray-3', dark: 'gray-12-a' },
  { name: 'foreground', source: 'typography-primary', light: 'gray-12', dark: 'white-1' },
  { name: 'card', source: 'background-surface-secondary', light: 'white-1', dark: 'gray-12' },
  { name: 'card-foreground', source: 'typography-primary', light: 'gray-12', dark: 'white-1' },
  { name: 'popover', source: 'background-surface-secondary', light: 'white-1', dark: 'gray-12' },
  { name: 'popover-foreground', source: 'typography-primary', light: 'gray-12', dark: 'white-1' },
  { name: 'primary', source: 'background-buttons-primary-active', light: 'purple-5', dark: 'purple-5', partner: 'blue-7' },
  { name: 'primary-foreground', source: 'typography-primary-light-static', light: 'white-1', dark: 'white-1', partner: 'gray-12' },
  { name: 'secondary', source: 'background-buttons-secondary-active', light: 'gray-1-a', dark: 'white-1-a' },
  { name: 'secondary-foreground', source: 'typography-primary', light: 'gray-12', dark: 'white-1' },
  { name: 'muted', source: 'background-surface-tertiary', light: 'gray-1', dark: 'gray-11' },
  { name: 'muted-foreground', source: 'typography-secondary', light: 'gray-10-a', dark: 'white-9-a' },
  { name: 'accent', source: 'background-buttons-primary-light', light: 'purple-1', dark: 'purple-4-a', partner: 'blue-2' },
  { name: 'accent-foreground', source: 'typography-accent-primary', light: 'purple-7', dark: 'purple-4', partner: 'blue-10' },
  { name: 'destructive', source: 'typography-system-error', light: 'system-red-6', dark: 'system-red-6' },
  { name: 'destructive-foreground', source: 'added', light: 'white-1', dark: 'white-1' },
  { name: 'success', source: 'background-chip-system-success', light: 'system-green-6', dark: 'system-green-6' },
  { name: 'success-foreground', source: 'added', light: 'white-1', dark: 'white-1' },
  { name: 'warning', source: 'added (yellow palette)', light: 'yellow-5', dark: 'yellow-5' },
  { name: 'warning-foreground', source: 'added', light: 'gray-12', dark: 'gray-12' },
  { name: 'border', source: 'border-gray-light', light: 'gray-3', dark: 'gray-11' },
  { name: 'input', source: 'border-gray', light: 'gray-4', dark: 'gray-9' },
  { name: 'ring', source: 'border-accent-primary', light: 'purple-5', dark: 'purple-5', partner: 'blue-7' },
  { name: 'chart-1', source: 'charts-primary', light: 'purple-5', dark: 'purple-5', partner: 'blue-7' },
  { name: 'chart-2', source: 'charts-secondary', light: 'blue-7', dark: 'blue-7' },
  { name: 'chart-3', source: 'charts-tertiary', light: 'green-7', dark: 'green-6' },
  { name: 'chart-4', source: 'charts-primary-dark-light', light: 'purple-3', dark: 'purple-9-a' },
  { name: 'chart-5', source: 'charts-negative', light: 'system-red-6', dark: 'system-red-7' },
];

const radiusScale: Array<[string, string]> = [
  ['3xs', '2px'],
  ['2xs', '4px'],
  ['xs', '6px'],
  ['sm', '8px'],
  ['md', '12px'],
  ['lg', '16px'],
  ['xl', '20px'],
  ['2xl', '24px'],
  ['3xl', '32px'],
  ['4xl', '40px'],
  ['5xl', '48px'],
  ['full', '9999px'],
];

/** Figma spacing steps expressed on Tailwind's default 4px scale */
export const spacingMap = [
  ['1px', 'px'],
  ['2px', '0.5'],
  ['4px', '1'],
  ['6px', '1.5'],
  ['8px', '2'],
  ['10px', '2.5'],
  ['12px', '3'],
  ['16px', '4'],
  ['20px', '5'],
  ['24px', '6'],
  ['32px', '8'],
  ['40px', '10'],
  ['48px', '12'],
  ['56px', '14'],
  ['64px', '16'],
  ['72px', '18'],
] as const;

export type TailwindTokens = {
  css: string;
  roles: Role[];
  stats: {
    palette: number;
    roles: number;
    radius: number;
    original: number;
    total: number;
  };
};

function newFamily(family: string) {
  return FAMILY_RENAMES[family] ?? family;
}

export async function buildTailwindTokens(): Promise<TailwindTokens> {
  const { total: original, collections } = await getDesignTokens();
  const globals = collections.find((collection) => collection.id === 'global')!.tokens;

  // short name (`gray-10-a`) to CSS value (`#1F1F21BD`)
  const values = new Map(
    globals.map((token) => [
      token.cssName.replace('--global-', ''),
      token.values.Main.css,
    ]),
  );

  const parse = (short: string) => {
    const match = short.match(/^(.+?)-(\d+)(-a)?$/)!;
    return { family: match[1], step: match[2], alpha: Boolean(match[3]) };
  };

  // A solid palette step for a base hex, so alpha steps can point at a token
  const solidByHex = new Map<string, string>();
  for (const [short, value] of values) {
    if (!short.endsWith('-a') && !solidByHex.has(value.toUpperCase())) {
      solidByHex.set(value.toUpperCase(), short);
    }
  }

  const ref = (short: string): string => {
    const { family, step, alpha } = parse(short);

    if (!alpha) return `var(--color-${newFamily(family)}-${step})`;

    const hex8 = values.get(short)!.toUpperCase();
    const base = solidByHex.get(hex8.slice(0, 7))!;
    const percent = Math.round((parseInt(hex8.slice(7, 9), 16) / 255) * 100);
    return `color-mix(in srgb, ${ref(base)} ${percent}%, transparent)`;
  };

  const solids = [...values].filter(([short]) => !short.endsWith('-a'));

  const palette = solids
    .map(([short, value]) => {
      const { family, step } = parse(short);
      return `  --color-${newFamily(family)}-${step}: ${value};`;
    })
    .join('\n');

  const roleBlock = (key: 'light' | 'dark' | 'partner') =>
    roles
      .filter((role) => key !== 'partner' || role.partner)
      .map((role) => `  --${role.name}: ${ref(role[key] ?? role.light)};`)
      .join('\n');

  const mapping = roles.map((role) => `  --color-${role.name}: var(--${role.name});`).join('\n');
  const radius = radiusScale.map(([name, value]) => `  --radius-${name}: ${value};`).join('\n');

  const css = `/*
  Tailwind v4 + shadcn design tokens for Fintech Components.
  Generated from the Figma variable library (tokens.css). Do not edit by hand.

  Tier 1  Palette   raw colours              bg-purple-5   text-gray-12/74
  Tier 2  Roles     shadcn names             bg-primary    text-muted-foreground
  Tier 3  Themes    small overrides          .dark / [data-theme="dark"]
                                             [data-radius="round"]
                                             [data-brand="partner"]

  Family names: Figma "system-red" is red, "system-green" is green and "green" is teal.
  Opacity: use the modifier instead of stored alpha steps, e.g. bg-gray-12/74.
  Spacing: Figma steps match Tailwind's default 4px scale, so no spacing tokens are needed.
*/

@custom-variant dark (&:is(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));

/* Tier 1: palette and radius scale */
@theme static {
  --color-*: initial;
  --color-white: #ffffff;
${palette}

  --radius-*: initial;
${radius}
  --radius-button-sm: 8px;
  --radius-button-md: 12px;
  --radius-button-lg: 16px;
}

/* Tier 2: roles (light is the default theme) */
:root {
  --radius: 0.75rem;
${roleBlock('light')}
}

/* Tier 3: dark mode */
.dark,
[data-theme="dark"] {
${roleBlock('dark')}
}

/* Tier 3: round radius mode. Buttons become pills, everything else stays. */
[data-radius="round"] {
  --radius-button-sm: 9999px;
  --radius-button-md: 9999px;
  --radius-button-lg: 9999px;
  --radius-5xl: 40px;
}

/* Tier 3: brand theme example. A new brand only overrides roles. */
[data-brand="partner"] {
${roleBlock('partner')}
}

/* Utilities: bg-background, text-foreground, bg-primary, border-border, ... */
@theme inline {
${mapping}
}

@layer base {
  * {
    border-color: var(--border);
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
  }
}
`;

  return {
    css,
    roles,
    stats: {
      palette: solids.length,
      roles: roles.length,
      radius: radiusScale.length + 3,
      original,
      total: solids.length + roles.length + radiusScale.length + 3,
    },
  };
}
