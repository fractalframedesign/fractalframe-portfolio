import { notFound } from 'next/navigation';

import {
  MoreProjects,
  ProjectDetails,
  ProjectHero,
} from '@/components/sections/project';
import { StackGrid } from '@/components/stack-grid';
import {
  getAllProjects,
  getProjectBySlug,
  getProjectSlugs,
} from '@/lib/projects';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const { frontmatter } = project;
  const allProjects = await getAllProjects();

  // Get related projects specified in the MDX frontmatter
  const moreProjects = frontmatter.moreProjects
    .map((slug) => allProjects.find((p) => p.slug === slug))
    .filter(Boolean) as typeof allProjects;

  return (
    <article>
      <ProjectHero
        name={frontmatter.name}
        liveUrl={frontmatter.liveUrl}
        sourceUrl={frontmatter.sourceUrl}
        coverImage={frontmatter.image}
        longDescription={frontmatter.longDescription}
        category={frontmatter.category}
        wrapperClassName={frontmatter.wrapperClassName}
        imageClassName={frontmatter.imageClassName}
      />

      <StackGrid
        stack={frontmatter.stack}
        title="Project stack"
        className="hero-padding pt-0!"
      />

      <ProjectDetails
        images={frontmatter.images}
        additionalDescription={frontmatter.additionalDescription}
        highlights={frontmatter.highlights}
      />

      <MoreProjects projects={moreProjects} />
    </article>
  );
}
