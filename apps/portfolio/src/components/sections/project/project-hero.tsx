import Image from 'next/image';
import Link from 'next/link';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProjectHeroProps {
  name: string;
  liveUrl: string;
  sourceUrl: string;
  coverImage: string;
  longDescription: string;
  category?: string;
  wrapperClassName?: string;
  imageClassName?: string;
}

const categoryLabel: Record<string, string> = {
  featured: 'Featured Project',
  'open-source': 'Open Source',
  personal: 'Personal Project',
};

const ProjectHero = ({
  name,
  liveUrl,
  sourceUrl,
  coverImage,
  longDescription,
  category,
  wrapperClassName,
  imageClassName,
}: ProjectHeroProps) => {
  return (
    <section className="hero-padding">
      <div className="container space-y-6 md:space-y-8">
        {category && (
          <div className="text-success text-xs font-semibold tracking-[0.12em] uppercase">
            {categoryLabel[category] ?? category}
          </div>
        )}
        <h1 className="text-4xl leading-[1.05] md:text-5xl">{name}</h1>

        <p className="font-serif text-muted-foreground text-xl leading-relaxed max-w-2xl">
          {longDescription}
        </p>

        <div className="flex items-center gap-4 pt-2">
          <Link
            href={liveUrl}
            className="link-underline text-base leading-none"
            target="_blank"
            rel="noopener noreferrer"
          >
            View live
          </Link>
          <div className="bg-border h-4 w-px" />
          <Link
            href={sourceUrl}
            className="link-underline text-base leading-none"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source code
          </Link>
        </div>
      </div>

      <div className="bigger-container my-15 md:my-18">
        <Card className="flex aspect-video items-center justify-center overflow-hidden p-0">
          <div className={cn('relative size-full', wrapperClassName)}>
            <Image
              src={coverImage}
              alt={name}
              fill
              className={cn('object-cover', imageClassName)}
              priority
            />
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ProjectHero;
