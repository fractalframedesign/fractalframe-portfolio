import Image from 'next/image';
import Link from 'next/link';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import ProjectCoverVideo from './project-cover-video';
import ProjectImagePlaceholder from './project-image-placeholder';

interface ProjectHeroProps {
  name: string;
  liveUrl?: string;
  coverImage: string;
  coverVideo?: { src: string; poster: string };
  imagePlaceholder?: boolean;
  longDescription: string;
  wrapperClassName?: string;
  imageClassName?: string;
}

const ProjectHero = ({
  name,
  liveUrl,
  coverImage,
  coverVideo,
  imagePlaceholder,
  longDescription,
  wrapperClassName,
  imageClassName,
}: ProjectHeroProps) => {
  return (
    <section className="hero-padding">
      <div className="container space-y-6 md:space-y-8">
        <h1 className="text-3xl leading-[1.08] text-balance md:text-4xl lg:text-5xl">
          {name}
        </h1>

        <p className="text-muted-foreground max-w-2xl text-xl leading-relaxed">
          {longDescription}
        </p>

        {liveUrl && (
          <div className="pt-2">
            <Link
              href={liveUrl}
              className="link-underline text-base leading-none"
              target="_blank"
              rel="noopener noreferrer"
            >
              View live
            </Link>
          </div>
        )}
      </div>

      <div className="bigger-container my-15 md:my-18">
        <Card className="flex aspect-video items-center justify-center overflow-hidden p-0">
          <div className={cn('relative size-full', wrapperClassName)}>
            <CoverMedia
              name={name}
              coverImage={coverImage}
              coverVideo={coverVideo}
              imagePlaceholder={imagePlaceholder}
              imageClassName={imageClassName}
            />
          </div>
        </Card>
      </div>
    </section>
  );
};

type CoverMediaProps = Pick<
  ProjectHeroProps,
  'name' | 'coverImage' | 'coverVideo' | 'imagePlaceholder' | 'imageClassName'
>;

const CoverMedia = ({
  name,
  coverImage,
  coverVideo,
  imagePlaceholder,
  imageClassName,
}: CoverMediaProps) => {
  if (coverVideo) {
    return (
      <ProjectCoverVideo
        src={coverVideo.src}
        poster={coverVideo.poster}
        label={`${name} cover video`}
      />
    );
  }
  if (imagePlaceholder) {
    return (
      <ProjectImagePlaceholder
        label="Replace with a project cover image"
        className="size-full"
      />
    );
  }
  return (
    <Image
      src={coverImage}
      alt={name}
      fill
      className={cn('object-cover', imageClassName)}
      priority
    />
  );
};

export default ProjectHero;
