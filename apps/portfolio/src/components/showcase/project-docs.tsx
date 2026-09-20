import type { ShowcaseProject } from '@/lib/showcase';

export function ProjectDocs({ project }: { project: ShowcaseProject }) {
  return (
    <div className="max-w-3xl space-y-10">
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Theming</h2>
        <p className="text-muted-foreground">
          Colours come from semantic tokens (canvas, surface, ink, accent-1 to
          accent-4) defined under{' '}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">
            [data-project=&quot;{project.scope}&quot;]
          </code>{' '}
          in this project&apos;s theme.css. The tokens are scoped, so they
          never affect the portfolio or other projects.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Components</h2>
        <ul className="divide-border divide-y">
          {project.components.map((component) => (
            <li key={component.name} className="space-y-1 py-4">
              <h3 className="font-medium">{component.name}</h3>
              <p className="text-muted-foreground text-sm">
                {component.description}
              </p>
              <code className="text-muted-foreground block text-xs">
                @/components/project-demos/{component.file}
              </code>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
