'use client';

import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

import { Card } from '@/components/ui/card';
import { ProjectFrontmatter } from '@/lib/types';
import { cn } from '@/lib/utils';

type ProjectCardProps = {
  project: ProjectFrontmatter;
  icon?: LucideIcon;
  delay?: number;
};

export const ProjectCard = ({ project, icon: Icon, delay = 0 }: ProjectCardProps) => {
  return (
    <motion.li
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1], delay }}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="group block space-y-6"
      >
        <Card className="xs:h-80 group flex h-62 items-center justify-center overflow-hidden p-0">
          <div className={cn('relative size-full', project.wrapperClassName)}>
            <Image
              src={project.image}
              alt={project.name}
              fill
              className={cn(
                'object-cover transition-all duration-500 group-hover:scale-105',
                project.imageClassName,
              )}
            />
          </div>
        </Card>

        <div className="space-y-3 px-3 md:px-6 lg:px-10.25">
          <h3 className="flex items-center gap-3 text-lg leading-none">
            {Icon && <Icon className="text-muted-foreground size-4" />}
            {project.name}
          </h3>
          <p className="text-muted-foreground text-lg leading-7">
            {project.description}
          </p>
        </div>
      </Link>
    </motion.li>
  );
};
