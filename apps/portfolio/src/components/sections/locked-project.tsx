import { Lock } from 'lucide-react';
import Image from 'next/image';

import SignInCard from '@/components/access/sign-in-card';
import {
  Card,
  CardContent,
  CardDescription,
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
  /** From the link in the code email: start on the code step */
  initialEmail?: string;
};

/** Teaser for a password-protected case study */
export default function LockedProject({
  project,
  initialEmail,
}: LockedProjectProps) {
  return (
    <section className="hero-padding">
      <div className="container space-y-6 md:space-y-8">
        <p className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
          <Lock className="size-4" aria-hidden />
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
              <h2 className="text-base font-semibold">Sign in to view</h2>
            </CardTitle>
            <CardDescription>
              Enter your email. If you&apos;re on my guest list, a 6-digit code
              arrives in seconds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignInCard
              project={{ slug: project.slug, name: project.name }}
              next={`/projects/${project.slug}`}
              initialEmail={initialEmail}
              autoFocus={false}
            />
          </CardContent>
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
