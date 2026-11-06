import { Lock } from 'lucide-react';
import Image from 'next/image';

import RequestAccessDialog from '@/components/access/request-access-dialog';
import UnlockForm from '@/components/access/unlock-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type LockedProjectProps = {
  /** Frontmatter only: the case study itself is never passed in */
  project: {
    slug: string;
    name: string;
    description: string;
    image: string;
    wrapperClassName?: string;
    imageClassName?: string;
  };
};

/** Teaser for a password-protected case study */
export default function LockedProject({ project }: LockedProjectProps) {
  return (
    <section className="hero-padding">
      <div className="container space-y-6 md:space-y-8">
        <p className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
          <Lock className="size-3.5" aria-hidden />
          Private case study
        </p>
        <h1 className="text-3xl leading-[1.08] text-balance md:text-4xl lg:text-5xl">
          {project.name}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-xl leading-relaxed text-pretty">
          {project.description}
        </p>

        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>
              <h2 className="text-base font-semibold">Enter the password</h2>
            </CardTitle>
            <CardDescription>
              One password opens all my private case studies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UnlockForm
              project={project.slug}
              next={`/projects/${project.slug}`}
              autoFocus={false}
            />
          </CardContent>
          <CardFooter className="text-muted-foreground gap-1 text-sm">
            Don&apos;t have one?
            <RequestAccessDialog
              project={{ slug: project.slug, name: project.name }}
            />
          </CardFooter>
        </Card>
      </div>

      <div className="bigger-container my-15 md:my-18">
        <Card className="flex aspect-video items-center justify-center overflow-hidden p-0">
          <div className={cn('relative size-full', project.wrapperClassName)}>
            <Image
              src={project.image}
              alt={project.name}
              fill
              sizes="(min-width: 1024px) 1024px, 100vw"
              className={cn('object-cover', project.imageClassName)}
            />
          </div>
        </Card>
      </div>
    </section>
  );
}
