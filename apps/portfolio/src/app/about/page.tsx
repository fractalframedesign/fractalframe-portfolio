import Link from 'next/link';

import { ProjectCard } from '@/components/project-card';
import AboutFavorites from '@/components/sections/about-favorites';
import AboutHero from '@/components/sections/about-hero';
import { ArticlesList } from '@/components/sections/latest-writing';
import { StackGrid } from '@/components/stack-grid';
import { getAllArticles } from '@/lib/articles';
import { getAllProjects } from '@/lib/projects';

const MY_STACK = [
  'typescript',
  'nextjs',
  'figma',
  'nodejs',
  'vercel',
  'tailwind',
  'docker',
  'flyio',
];

export default async function AboutPage() {
  const allProjects = await getAllProjects();
  const allArticles = await getAllArticles();
  const currentlyBuilding = allProjects.filter((p) =>
    ['echo-ui', 'justos'].includes(p.slug),
  );
  const latestArticles = allArticles.slice(0, 3);

  return (
    <>
      <AboutHero />

      <AboutFavorites />

      <StackGrid stack={MY_STACK} />

      <section className="section-padding bigger-container space-y-10">
        <div className="container flex items-center justify-between">
          <h2 className="text-2xl leading-none">Currently building</h2>
          <Link
            href="/projects"
            className="link-underline text-lg leading-none"
          >
            View all
          </Link>
        </div>

        <ul className="grid gap-x-5 gap-y-10 md:grid-cols-2">
          {currentlyBuilding.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </ul>
      </section>

      <ArticlesList articles={latestArticles} showHeader />
    </>
  );
}
