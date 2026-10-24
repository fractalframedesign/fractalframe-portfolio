import fs from 'fs/promises';
import path from 'path';

export type TokenType = 'color' | 'radius' | 'spacing';

export type TokenValue = {
  /** Value as written in the CSS, e.g. `var(--global-gray-12)` or `12px` */
  css: string;
  /** Fully resolved value, e.g. `#1F1F21` */
  resolved: string;
};

export type DesignToken = {
  /** Display name, e.g. `Purple/5` */
  name: string;
  cssName: string;
  type: TokenType;
  /** Values keyed by mode name, e.g. `Light Mode` / `Dark Mode` */
  values: Record<string, TokenValue>;
};

export type TokenCollection = {
  id: string;
  label: string;
  /** Original collection name in Figma */
  source: string;
  modes: string[];
  tokens: DesignToken[];
};

type CollectionConfig = {
  id: string;
  label: string;
  source: string;
  prefix: string;
  modes: string[];
  type: TokenType;
};

const COLLECTIONS: CollectionConfig[] = [
  { id: 'global', label: 'Global', source: '00 - Global', prefix: '--global-', modes: ['Main'], type: 'color' },
  { id: 'color', label: 'Color Styles', source: '01 - Color Styles', prefix: '--color-', modes: ['Light Mode', 'Dark Mode'], type: 'color' },
  { id: 'radius', label: 'Corner Radius', source: '02 - Corner Radius', prefix: '--radius-', modes: ['Square', 'Round'], type: 'radius' },
  { id: 'spacing', label: 'Spacing', source: '03 - Spacing', prefix: '--spacing-', modes: ['Value'], type: 'spacing' },
];

const TOKENS_FILE = path.join(
  process.cwd(),
  'src/components/project-demos/fintech-components/tokens/tokens.css',
);

/** Reads `--name: value;` declarations from every rule, keyed by selector. */
function parseRules(css: string) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = new Map<string, Map<string, string>>();

  for (const match of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].trim();
    const variables = new Map<string, string>();

    for (const declaration of match[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      variables.set(declaration[1], declaration[2].trim());
    }

    rules.set(selector, variables);
  }

  return rules;
}

function resolveValue(
  value: string,
  variables: Map<string, string>,
  visited = new Set<string>(),
): string {
  const match = value.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/);
  if (!match) return value;

  const [, name, fallback] = match;
  if (visited.has(name)) return value;
  visited.add(name);

  const target = variables.get(name);
  if (!target) return fallback ? resolveValue(fallback, variables, visited) : value;

  return resolveValue(target, variables, visited);
}

const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

function displayName(cssName: string, collection: CollectionConfig) {
  let name = cssName.slice(collection.prefix.length);

  if (collection.id === 'spacing') {
    return `Spacing/${name.replace(/^spacing-/, '')}`;
  }

  if (collection.id === 'radius') {
    name = name.replace(/^corner-radius-/, '');

    if (name.startsWith('button-')) {
      return `Corner Radius/Button/${name.replace('button-', '').toUpperCase()}`;
    }

    return `Corner Radius/${name.replace(/^(\d+)-([a-z]+)$/i, '$1$2').toUpperCase()}`;
  }

  if (collection.id === 'global') {
    const match = name.match(
      /^(system-red|system-green|purple|blue|green|gray|white|yellow)-(.+)$/,
    );

    if (match) {
      const group = match[1].split('-').map(capitalize).join('-');
      const step = match[2].replace(/-(a)$/i, '$1').toUpperCase();
      return `${group}/${step}`;
    }
  }

  return name.split('-').map(capitalize).join('/');
}

/** Builds the token inventory from tokens.css (server only). */
export async function getDesignTokens(): Promise<{
  total: number;
  collections: TokenCollection[];
}> {
  const css = await fs.readFile(TOKENS_FILE, 'utf8');
  const rules = parseRules(css);

  const base = rules.get('[data-token-scope]') ?? new Map<string, string>();
  const dark = rules.get('[data-token-scope][data-theme="dark"]') ?? new Map<string, string>();
  const round = rules.get('[data-token-scope][data-radius="round"]') ?? new Map<string, string>();

  const withOverrides = (overrides: Map<string, string>) =>
    new Map([...base, ...overrides]);

  const collections = COLLECTIONS.map((collection): TokenCollection => {
    const names = [...base.keys()]
      .filter((name) => name.startsWith(collection.prefix))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const tokens = names.map((cssName): DesignToken => {
      const baseValue = base.get(cssName) ?? '';
      const build = (value: string, scope: Map<string, string>): TokenValue => ({
        css: value,
        resolved: resolveValue(value, scope),
      });

      let values: Record<string, TokenValue>;
      if (collection.id === 'color') {
        values = {
          'Light Mode': build(baseValue, base),
          'Dark Mode': build(dark.get(cssName) ?? baseValue, withOverrides(dark)),
        };
      } else if (collection.id === 'radius') {
        values = {
          Square: build(baseValue, base),
          Round: build(round.get(cssName) ?? baseValue, withOverrides(round)),
        };
      } else {
        values = { [collection.modes[0]]: build(baseValue, base) };
      }

      return {
        name: displayName(cssName, collection),
        cssName,
        type: collection.type,
        values,
      };
    });

    return {
      id: collection.id,
      label: collection.label,
      source: collection.source,
      modes: collection.modes,
      tokens,
    };
  });

  return {
    total: collections.reduce((sum, collection) => sum + collection.tokens.length, 0),
    collections,
  };
}
