'use client';

import { Check, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { DesignToken, TokenCollection } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

type TokenExplorerProps = {
  total: number;
  collections: TokenCollection[];
};

type Theme = 'light' | 'dark';
type Radius = 'square' | 'round';

function TokenPreview({ token }: { token: DesignToken }) {
  const reference = `var(${token.cssName})`;

  if (token.type === 'color') {
    return (
      <span
        className="border-border relative block size-11 shrink-0 overflow-hidden rounded-lg border"
        style={{
          backgroundImage:
            'repeating-conic-gradient(var(--muted) 0% 25%, transparent 0% 50%)',
          backgroundSize: '10px 10px',
        }}
      >
        <span className="absolute inset-0" style={{ background: reference }} />
      </span>
    );
  }

  if (token.type === 'radius') {
    return (
      <span className="border-border flex size-11 shrink-0 items-center justify-center rounded-lg border">
        <span
          className="border-primary bg-primary/10 size-6 border-2"
          style={{ borderRadius: reference }}
        />
      </span>
    );
  }

  return (
    <span className="border-border flex size-11 shrink-0 items-center overflow-hidden rounded-lg border px-1">
      <span
        className="bg-primary block h-1.5 rounded-full"
        style={{ width: reference, maxWidth: '100%' }}
      />
    </span>
  );
}

/** Searchable reference for every design token, with light/dark and square/round previews. */
export function TokenExplorer({ total, collections }: TokenExplorerProps) {
  const [collectionId, setCollectionId] = useState('all');
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState<Theme>('light');
  const [radius, setRadius] = useState<Radius>('square');
  const [copied, setCopied] = useState<string | null>(null);

  const modeFor = (collection: TokenCollection) => {
    if (collection.id === 'color') return theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    if (collection.id === 'radius') return radius === 'round' ? 'Round' : 'Square';
    return collection.modes[0];
  };

  const sections = useMemo(() => {
    const search = query.trim().toLowerCase();

    return collections
      .filter((collection) => collectionId === 'all' || collection.id === collectionId)
      .map((collection) => {
        const mode =
          collection.id === 'color'
            ? theme === 'dark' ? 'Dark Mode' : 'Light Mode'
            : collection.id === 'radius'
              ? radius === 'round' ? 'Round' : 'Square'
              : collection.modes[0];

        const tokens = collection.tokens.filter((token) => {
          if (!search) return true;
          const value = token.values[mode];
          return [token.name, token.cssName, value.css, value.resolved]
            .join(' ')
            .toLowerCase()
            .includes(search);
        });

        return { collection, mode, tokens };
      })
      .filter((section) => section.tokens.length > 0);
  }, [collections, collectionId, query, theme, radius]);

  const visible = sections.reduce((sum, section) => sum + section.tokens.length, 0);

  async function copy(cssName: string) {
    const reference = `var(${cssName})`;
    try {
      await navigator.clipboard.writeText(reference);
    } catch {
      // Clipboard can be unavailable (e.g. insecure context); the feedback below still shows.
    }
    setCopied(cssName);
    window.setTimeout(() => setCopied((current) => (current === cssName ? null : current)), 1500);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, value or CSS variable"
            aria-label="Search design tokens"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ToggleGroup
            type="single"
            variant="outline"
            value={theme}
            onValueChange={(value) => value && setTheme(value as Theme)}
            aria-label="Colour mode"
          >
            <ToggleGroupItem value="light">Light</ToggleGroupItem>
            <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
          </ToggleGroup>

          <ToggleGroup
            type="single"
            variant="outline"
            value={radius}
            onValueChange={(value) => value && setRadius(value as Radius)}
            aria-label="Corner radius mode"
          >
            <ToggleGroupItem value="square">Square</ToggleGroupItem>
            <ToggleGroupItem value="round">Round</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <Tabs value={collectionId} onValueChange={setCollectionId}>
          <TabsList>
            <TabsTrigger value="all">All ({total})</TabsTrigger>
            {collections.map((collection) => (
              <TabsTrigger key={collection.id} value={collection.id}>
                {collection.label} ({collection.tokens.length})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <p className="sr-only" role="status">
        {copied ? `Copied var(${copied})` : ''}
      </p>

      <p className="text-muted-foreground text-sm" aria-live="polite">
        Showing {visible} of {total} tokens · {theme === 'dark' ? 'Dark' : 'Light'} mode ·{' '}
        {radius === 'round' ? 'Round' : 'Square'} radius. Select a token to copy its CSS variable.
      </p>

      {/* Tokens resolve inside this scope, so previews follow the mode switches above */}
      <div data-token-scope data-theme={theme} data-radius={radius} className="space-y-10">
        {sections.length === 0 && (
          <p className="text-muted-foreground border-border rounded-xl border border-dashed p-10 text-center text-sm">
            No tokens match &ldquo;{query}&rdquo;.
          </p>
        )}

        {sections.map(({ collection, mode, tokens }) => (
          <section key={collection.id} className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{collection.label}</h3>
                <p className="text-muted-foreground text-xs">{collection.source}</p>
              </div>
              <span className="text-muted-foreground text-xs">
                {tokens.length} {tokens.length === 1 ? 'token' : 'tokens'} · {mode}
              </span>
            </div>

            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {tokens.map((token) => {
                const value = token.values[modeFor(collection)];
                const isCopied = copied === token.cssName;

                return (
                  <li key={token.cssName}>
                    <button
                      type="button"
                      onClick={() => copy(token.cssName)}
                      title={`Copy var(${token.cssName})`}
                      className={cn(
                        'border-border bg-card hover:bg-muted/60 focus-visible:ring-ring flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors outline-none focus-visible:ring-2',
                        isCopied && 'border-primary',
                      )}
                    >
                      <TokenPreview token={token} />
                      <span className="min-w-0 flex-1 space-y-0.5">
                        <span className="block truncate text-sm font-medium">{token.name}</span>
                        <span className="text-muted-foreground block truncate font-mono text-xs">
                          {token.cssName}
                        </span>
                        <span className="text-muted-foreground block truncate font-mono text-[11px]">
                          {value.css === value.resolved
                            ? value.css
                            : `${value.css} → ${value.resolved}`}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'text-muted-foreground flex size-6 shrink-0 items-center justify-center text-xs',
                          isCopied && 'text-primary',
                        )}
                      >
                        {isCopied ? <Check className="size-4" /> : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
