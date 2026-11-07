'use client';

import { ArrowRight, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

import type { ProjectFrontmatter } from '@/lib/types';
import { cn } from '@/lib/utils';

import ProjectImagePlaceholder from './project/project-image-placeholder';

type ListedProject = ProjectFrontmatter & { locked?: boolean };

/** Internal links (e.g. a showcase page) go there directly; others open the case study */
const projectHref = (project: ListedProject) =>
  project.href.startsWith('/') ? project.href : `/projects/${project.slug}`;

const ProjectRow = ({ project }: { project: ListedProject }) => (
  <motion.li
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
  >
    <Link
      href={projectHref(project)}
      {...(project.openInNewTab && {
        target: '_blank',
        rel: 'noopener noreferrer',
      })}
      className="group focus-visible:ring-ring focus-visible:ring-offset-background block space-y-5 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
    >
      {/* Centred, so a project can show a small logo (wrapperClassName) instead of a full image */}
      <span className="bg-muted outline-foreground/10 flex aspect-video items-center justify-center overflow-hidden rounded-2xl outline -outline-offset-1">
        <span className={cn('relative size-full', project.wrapperClassName)}>
          {project.imagePlaceholder ? (
            <ProjectImagePlaceholder
              label="Project image placeholder"
              decorative
              className="size-full"
            />
          ) : (
            <Image
              src={project.image}
              alt=""
              fill
              sizes="(min-width: 952px) 912px, 100vw"
              className={cn(
                'object-cover transition-transform duration-500 group-hover:scale-102',
                project.imageClassName,
              )}
            />
          )}
        </span>
      </span>

      <span className="block space-y-2">
        <span className="flex items-baseline justify-between gap-6">
          <h2 className="flex items-center gap-2 text-2xl leading-snug">
            {project.name}
            {project.locked && (
              <Lock
                role="img"
                aria-label="Password protected"
                className="text-muted-foreground size-4"
              />
            )}
          </h2>
          <span className="text-success-text flex shrink-0 items-center gap-1.5">
            {/* Arrow only on phones, so long names keep their room */}
            <span className="max-sm:sr-only">View project</span>
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </span>
        <span className="text-muted-foreground block leading-relaxed">
          {project.description}
        </span>
      </span>
    </Link>
  </motion.li>
);

/** Every project as one big card, image on top and text underneath */
export default function ProjectsList({
  projects,
}: {
  projects: ListedProject[];
}) {
  return (
    <ul className="bigger-container mt-15 space-y-16 md:mt-18 md:space-y-20">
      {projects.map((project) => (
        <ProjectRow key={project.slug} project={project} />
      ))}
    </ul>
  );
}
