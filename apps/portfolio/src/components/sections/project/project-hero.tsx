import Image from 'next/image';
import Link from 'next/link';

import { Card } from '@/components/ui/card';
import { PROJECT_CATEGORY_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

import ProjectImagePlaceholder from './project-image-placeholder';

interface ProjectHeroProps {
  name: string;
  liveUrl?: string;
  sourceUrl?: string;
  coverImage: string;
  imagePlaceholder?: boolean;
  longDescription: string;
  category?: string;
  wrapperClassName?: string;
  imageClassName?: string;
}

const ProjectHero = ({
  name,
  liveUrl,
  sourceUrl,
  coverImage,
  imagePlaceholder,
  longDescription,
  category,
  wrapperClassName,
  imageClassName,
}: ProjectHeroProps) => {
  return (
    <section className="hero-padding">
      <div className="container space-y-6 md:space-y-8">
        {category && (
          <div className="text-success-text text-xs font-semibold tracking-widest uppercase">
            {PROJECT_CATEGORY_LABELS[category] ?? category}
          </div>
        )}
        <h1 className="text-3xl leading-[1.08] text-balance md:text-4xl lg:text-5xl">
          {name}
        </h1>

        <p className="text-muted-foreground max-w-2xl text-xl leading-relaxed">
          {longDescription}
        </p>

        {(liveUrl || sourceUrl) && (
          <div className="flex items-center gap-4 pt-2">
            {liveUrl && (
              <Link
                href={liveUrl}
                className="link-underline text-base leading-none"
                target="_blank"
                rel="noopener noreferrer"
              >
                View live
              </Link>
            )}
            {liveUrl && sourceUrl && <div className="bg-border h-4 w-px" />}
            {sourceUrl && (
              <Link
                href={sourceUrl}
                className="link-underline text-base leading-none"
                target="_blank"
                rel="noopener noreferrer"
              >
                Source code
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="bigger-container my-15 md:my-18">
        <Card className="flex aspect-video items-center justify-center overflow-hidden p-0">
          <div className={cn('relative size-full', wrapperClassName)}>
            {imagePlaceholder ? (
              <ProjectImagePlaceholder
                label="Replace with a project cover image"
                className="size-full"
              />
            ) : (
              <Image
                src={coverImage}
                alt={name}
                fill
                className={cn('object-cover', imageClassName)}
                priority
              />
            )}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ProjectHero;
