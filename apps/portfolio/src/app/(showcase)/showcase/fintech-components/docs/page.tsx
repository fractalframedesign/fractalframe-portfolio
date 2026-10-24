import type { Metadata } from 'next';
import Link from 'next/link';

import { TailwindTokensGuide } from '@/components/project-demos/fintech-components/docs/tailwind-tokens';
import { TokenGuide } from '@/components/project-demos/fintech-components/docs/token-guide';
import { TokenExplorer } from '@/components/showcase/token-explorer';
import { Button } from '@/components/ui/button';
import { getDesignTokens } from '@/lib/design-tokens';
import { getComponentCount, getShowcaseProject } from '@/lib/showcase';
import { buildTailwindTokens } from '@/lib/tailwind-tokens';

export const metadata: Metadata = { title: 'Docs' };

const sections = [
  { id: 'design-tokens', label: 'Design tokens' },
  { id: 'tailwind-tokens', label: 'Tailwind tokens' },
  { id: 'token-explorer', label: 'Token explorer' },
];

export default async function Page() {
  const componentCount = getComponentCount(getShowcaseProject('fintech-components')!);
  const [{ total, collections }, tailwindTokens] = await Promise.all([
    getDesignTokens(),
    buildTailwindTokens(),
  ]);

  return (
    <div className="space-y-16">
      <nav aria-label="On this page" className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <Button key={section.id} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={`#${section.id}`}>{section.label}</Link>
          </Button>
        ))}
      </nav>

      <section id="design-tokens" className="scroll-mt-24">
        <TokenGuide total={total} collectionCount={collections.length} />
      </section>

      <section id="tailwind-tokens" className="scroll-mt-24">
        <TailwindTokensGuide tokens={tailwindTokens} />
      </section>

      <section id="token-explorer" className="scroll-mt-24 space-y-6">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Token explorer</h2>
          <p className="text-muted-foreground">
            A live, searchable view of every raw and semantic variable. Switch colour mode and
            corner radius to see how values change, and select any token to copy its CSS variable.
          </p>
        </div>
        <TokenExplorer total={total} collections={collections} />
      </section>
      <section className="border-border flex flex-wrap items-center justify-between gap-6 border-t pt-10">
        <div className="max-w-xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Components</h2>
          <p className="text-muted-foreground">
            {componentCount} components, each with a live preview and copyable source.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/showcase/fintech-components">View components</Link>
        </Button>
      </section>
    </div>
  );
}
