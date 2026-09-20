import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { showcaseProjects } from '@/lib/showcase';

export default function ShowcaseIndexPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-16 md:px-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Showcase</h1>
        <p className="text-muted-foreground text-lg">
          Live components, documentation and case studies.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {showcaseProjects.map((project) => (
          <li key={project.slug}>
            <Link href={`/showcase/${project.slug}`} className="block">
              <Card className="hover:bg-muted/50 h-full transition-colors">
                <CardContent className="space-y-2">
                  <h2 className="text-lg font-semibold">{project.name}</h2>
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
