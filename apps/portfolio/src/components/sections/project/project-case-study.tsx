import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { getStackItems } from '@/lib/stack';
import { ProjectCaseStudy as CaseStudy } from '@/lib/types';

interface ProjectCaseStudyProps {
  name: string;
  coverImage: string;
  stack: string[];
  caseStudy: CaseStudy;
}

const TagRow = ({ tags, className }: { tags: string[]; className: string }) => (
  <ul className={`relative z-10 flex flex-wrap justify-center gap-2 ${className}`}>
    {tags.map((tag) => (
      <li key={tag}>
        <Badge
          variant="outline"
          className="bg-background font-semibold tracking-widest uppercase"
        >
          {tag}
        </Badge>
      </li>
    ))}
  </ul>
);

const ProjectCaseStudy = ({
  name,
  coverImage,
  stack,
  caseStudy,
}: ProjectCaseStudyProps) => {
  const tools = getStackItems(stack);

  return (
    <section className="hero-padding space-y-15 md:space-y-18">
      <div className="container">
        <div className="mx-auto max-w-2xl">
          <header className="flex flex-col items-center gap-5 pb-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/projects">Projects</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-center text-3xl leading-[1.08] text-balance md:text-4xl lg:text-5xl">
              {name}
            </h1>
          </header>

          <TagRow tags={caseStudy.industries} className="-mb-3" />
          <Card className="relative aspect-3/2 overflow-hidden p-0">
            <Image
              src={coverImage}
              alt={name}
              fill
              sizes="(min-width: 768px) 672px, 100vw"
              className="object-cover"
              priority
            />
          </Card>
          <TagRow tags={caseStudy.services} className="-mt-3" />

          <div className="space-y-12 pt-12 md:space-y-15 md:pt-15">
            {caseStudy.sections.map((section) => (
              <div key={section.title} className="space-y-5">
                <h2 className="text-2xl leading-none">{section.title}</h2>
                <div className="space-y-6 text-lg leading-relaxed">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="container">
          <h2 className="mx-auto max-w-2xl text-2xl leading-none">Gallery</h2>
        </div>
        <ul className="gallery-gutter flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {caseStudy.gallery.map((image) => (
            <li key={image.src} className="w-5/6 shrink-0 snap-center md:w-2xl">
              <figure className="space-y-3">
                <Card className="flex aspect-3/2 items-center justify-center overflow-hidden p-8">
                  <Image
                    src={image.src}
                    alt={image.caption ?? ''}
                    width={image.width}
                    height={image.height}
                    className="max-h-full w-auto object-contain"
                  />
                </Card>
                {image.caption && (
                  <figcaption className="text-muted-foreground text-center text-sm">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      </div>

      <div className="container">
        <div className="mx-auto max-w-2xl space-y-5">
          <h2 className="text-2xl leading-none">Tools used</h2>
          <ul className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 text-lg leading-relaxed">
            {tools.map((tool) => (
              <li key={tool.name}>{tool.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ProjectCaseStudy;
