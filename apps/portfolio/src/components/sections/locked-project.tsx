import { Lock } from 'lucide-react';

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

type LockedProjectProps = {
  /** Frontmatter only: the case study itself is never passed in */
  project: {
    slug: string;
    name: string;
    description: string;
  };
};

/** What a visitor sees in place of a password-protected case study: its name and the way in, nothing from inside it */
export default function LockedProject({ project }: LockedProjectProps) {
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
    </section>
  );
}
