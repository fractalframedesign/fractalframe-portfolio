import Image from 'next/image';

import { Card, CardContent } from '@/components/ui/card';
import { ProjectImage } from '@/lib/types';
import { cn } from '@/lib/utils';

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
      <div className="space-y-15 md:space-y-18">
        {topImages.map((image, index) => (
          <ImageCard key={index} image={image} />
        ))}
      </div>

      {/* Additional Description */}
      <p className="text-muted-foreground hero-padding container text-lg">
        {additionalDescription}
      </p>

      {/* Middle 3 images - grid layout */}
      <div className="hero-padding space-y-15 pt-0! md:space-y-18">
        {/* First row: 2 columns */}
        <div className="grid gap-10 md:grid-cols-2">
          {middleImages.slice(0, 2).map((image, index) => (
            <ImageCard key={index + 2} image={image} />
          ))}
        </div>
        {/* Second row: full width */}
        <ImageCard image={middleImages[2]} />
      </div>

      {/* Highlights */}
      <div className="container space-y-10">
        <h2 className="text-2xl leading-none">Highlights</h2>
        <ul className="text-muted-foreground ms-7 space-y-2 text-lg">
          {highlights.map((highlight, index) => (
            <li key={index} className="list-disc">
              {highlight}
            </li>
          ))}
        </ul>
      </div>
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
        'flex items-center justify-end overflow-clip md:h-80 md:justify-center',
        image.wrapperClassName,
      )}
    >
      <CardContent className="relative">
        <Image
          src={image.src}
          alt={image.caption || ''}
          width={image.width}
          height={image.height}
        />
      </CardContent>
    </Card>
    {image.caption && (
      <p className="text-muted-foreground text-center text-base">
        {image.caption}
      </p>
    )}
  </div>
);
