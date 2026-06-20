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
  wrapperClassName?: string;
  imageClassName?: string;
}

const ProjectHero = ({
  name,
  liveUrl,
  sourceUrl,
  coverImage,
  longDescription,
  wrapperClassName,
  imageClassName,
}: ProjectHeroProps) => {
  return (
    <section className="hero-padding">
      <div className="container space-y-8 md:space-y-10">
        <h1 className="text-3xl md:text-4xl">{name}</h1>

        <div className="flex items-center gap-4">
          <Link
            href={liveUrl}
            className="link-underline text-lg leading-none"
            target="_blank"
            rel="noopener noreferrer"
          >
            View live
          </Link>
          <div className="bg-border h-4 w-px" />
          <Link
            href={sourceUrl}
            className="link-underline text-lg leading-none"
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

      <p className="text-muted-foreground container text-lg leading-7">
        {longDescription}
      </p>
    </section>
  );
};

export default ProjectHero;
