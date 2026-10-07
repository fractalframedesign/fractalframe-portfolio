import Image from 'next/image';
import Link from 'next/link';

import { SelectedWorkHeader } from '@/components/selected-work-header';
import { getAllProjects } from '@/lib/projects';
import { cn } from '@/lib/utils';

const SelectedWork = async () => {
  const allProjects = await getAllProjects();

  const projects = allProjects.slice(-3).reverse();

  return (
    <section className="border-border/60 border-y section-padding">
      <div className="container space-y-8">
      <SelectedWorkHeader />

      <ul className="grid gap-4">
        {projects.map((project) => {
          const href = project.href.startsWith('/')
            ? project.href
            : `/projects/${project.slug}`;

          return (
            <li key={project.slug}>
              <Link
                href={href}
                {...(project.openInNewTab && {
                  target: '_blank',
                  rel: 'noopener noreferrer',
                })}
                className="group flex h-full overflow-hidden rounded-lg border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 p-5 sm:p-8">
                  <h3 className="text-xl font-semibold sm:text-2xl">{project.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>
                <div className="relative min-h-48 w-1/2 shrink-0 overflow-hidden bg-muted sm:min-h-64 sm:w-3/5 lg:min-h-72">
                  <div
                    className={cn('relative size-full', project.wrapperClassName)}
                  >
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      sizes="(min-width: 1024px) 60vw, 50vw"
                      className={cn(
                        'object-cover transition-transform duration-500 group-hover:scale-[1.03]',
                        project.imageClassName,
                      )}
                    />
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      </div>
    </section>
  );
};

export default SelectedWork;
