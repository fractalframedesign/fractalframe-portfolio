import { Lock } from 'lucide-react';

import SignInCard from '@/components/access/sign-in-card';

type LockedProjectProps = {
  /** Frontmatter only: the case study itself is never passed in */
  project: {
    slug: string;
    name: string;
    description: string;
  };
  /** From the link in the code email: start on the code step */
  initialEmail?: string;
};

/** What a visitor sees in place of a private case study: its name and the way in, nothing from inside it */
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

        <SignInCard
          className="max-w-sm"
          title="Log in to access"
          project={{ slug: project.slug, name: project.name }}
          next={`/projects/${project.slug}`}
          initialEmail={initialEmail}
          autoFocus={false}
        />
      </div>
    </section>
  );
}
