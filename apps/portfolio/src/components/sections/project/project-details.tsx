import Image from 'next/image';

import { Card, CardContent } from '@/components/ui/card';
import { ProjectImage } from '@/lib/types';
import { cn } from '@/lib/utils';

import ProjectImagePlaceholder from './project-image-placeholder';

const ProjectDetails = ({
  images,
  additionalDescription,
  highlights,
}: ProjectDetailsProps) => {
  const topImages = images.slice(0, 2);
  const middleImages = images.slice(2, 5);

  return (
    <section className="section-padding bigger-container pt-0!">
      {/* Top 2 images */}
      {topImages.length > 0 && (
        <div className="space-y-15 md:space-y-18">
          {topImages.map((image, index) => (
            <ImageCard key={index} image={image} />
          ))}
        </div>
      )}

      {/* Additional Description */}
      {additionalDescription && (
        <div className="hero-padding container">
          <p className="max-w-2xl text-lg leading-relaxed">
            {additionalDescription}
          </p>
        </div>
      )}

      {/* Middle 3 images - grid layout */}
      {middleImages.length > 0 && (
        <div className="hero-padding space-y-15 pt-0! md:space-y-18">
          {/* First row: 2 columns */}
          <div className="grid gap-10 md:grid-cols-2">
            {middleImages.slice(0, 2).map((image, index) => (
              <ImageCard key={index + 2} image={image} />
            ))}
          </div>
          {/* Second row: full width */}
          {middleImages[2] && <ImageCard image={middleImages[2]} />}
        </div>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="container space-y-10">
          <h2 className="text-2xl leading-none">Highlights</h2>
          <ul className="ms-7 max-w-2xl space-y-2 text-lg leading-relaxed">
            {highlights.map((highlight, index) => (
              <li key={index} className="list-disc">
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ProjectDetails;

interface ProjectDetailsProps {
  images: ProjectImage[];
  additionalDescription: string;
  highlights: string[];
}

const ImageCard = ({ image }: { image: ProjectImage }) => (
  <div className="flex flex-col gap-5">
    <Card
      className={cn(
        'relative flex items-center justify-end overflow-clip md:h-80 md:justify-center',
        image.wrapperClassName,
      )}
      style={
        image.placeholder
          ? { aspectRatio: `${image.width} / ${image.height}` }
          : undefined
      }
    >
      {image.placeholder ? (
        <ProjectImagePlaceholder
          label={image.caption || 'Project image placeholder'}
          className="absolute inset-0"
        />
      ) : (
        <CardContent className="relative">
          <Image
            src={image.src}
            alt={image.caption || ''}
            width={image.width}
            height={image.height}
          />
        </CardContent>
      )}
    </Card>
    {image.caption && !image.placeholder && (
      <p className="text-muted-foreground text-center text-sm">
        {image.caption}
      </p>
    )}
  </div>
);
