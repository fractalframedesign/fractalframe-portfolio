import { Lock } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { getProductLevels } from '@/lib/access/cached-levels';
import { visibleProjects } from '@/lib/access/visible';
import { showcaseProjects } from '@/lib/showcase';

export default async function ShowcaseIndexPage() {
  const projects = visibleProjects(showcaseProjects, await getProductLevels());

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-16 md:px-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Showcase</h1>
        <p className="text-muted-foreground text-lg">
          Live components, documentation and case studies.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link href={`/showcase/${project.slug}`} className="block">
              <Card className="hover:bg-muted/50 h-full transition-colors">
                <CardContent className="space-y-2">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    {project.name}
                    {project.locked && (
                      <Lock
                        role="img"
                        aria-label="Password protected"
                        className="text-muted-foreground size-4"
                      />
                    )}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
