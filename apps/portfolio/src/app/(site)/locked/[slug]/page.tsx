import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import LockedProject from '@/components/sections/locked-project';
import { offersUnlock } from '@/lib/access/gate';
import { getStoredLevels } from '@/lib/access/repo/products';
import { getDb } from '@/lib/db/client';
import { getProjectBySlug } from '@/lib/projects';

// Reached only through the proxy, which rewrites a locked /projects/<slug>
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = await getProjectBySlug((await params).slug);
  return {
    title: project?.frontmatter.name ?? 'Private case study',
    robots: { index: false, follow: false },
  };
}

export default async function LockedProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project || !(await offersUnlock(slug, () => getStoredLevels(getDb()))))
    notFound();

  const { name, description, image, wrapperClassName, imageClassName } =
    project.frontmatter;

  return (
    <article>
      <LockedProject
        project={{
          slug,
          name,
          description,
          image,
          wrapperClassName,
          imageClassName,
        }}
      />
    </article>
  );
}
