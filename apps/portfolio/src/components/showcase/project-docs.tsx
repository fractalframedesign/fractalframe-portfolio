import type { ShowcaseProject } from '@/lib/showcase';

export function ProjectDocs({
  project,
  showTheming = true,
}: {
  project: ShowcaseProject;
  /** Hide the generic theming note when a project documents its own tokens */
  showTheming?: boolean;
}) {
  return (
    <div className="space-y-10">
      {showTheming && (
      <section className="max-w-3xl space-y-3">
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
      )}

      <section id="components" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl font-semibold">Components</h2>
        <ul className="grid gap-x-12 md:grid-cols-2">
          {project.components.map((component) => (
            <li key={component.name} className="border-border space-y-1 border-b py-4">
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
