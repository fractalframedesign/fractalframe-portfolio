import Image from 'next/image';
import Link from 'next/link';

import SectionTitle from '@/components/section-title';
import type { ProjectFrontmatter } from '@/lib/types';

/** Showcase projects as cover-image cards, a little wider than the reading column */
export default function Highlights({
  projects,
}: {
  projects: ProjectFrontmatter[];
}) {
  if (projects.length === 0) return null;

  return (
    <section className="space-y-8">
      <div className="container">
        <SectionTitle className="mx-auto max-w-2xl">Highlights</SectionTitle>
      </div>
      <ul className="bigger-container grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
        {projects.map((project) => (
          project.liveUrl && (
            <li key={project.slug}>
              <Link
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block space-y-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="bg-muted outline-foreground/10 relative block aspect-video overflow-hidden rounded-xl outline -outline-offset-1">
                  <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 320px, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                </span>
                <span className="block">
                  <span className="block text-lg leading-snug">
                    {project.name}
                  </span>
                  <span className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                    {project.description}
                  </span>
                </span>
              </Link>
            </li>
          )
        ))}
      </ul>
    </section>
  );
}
