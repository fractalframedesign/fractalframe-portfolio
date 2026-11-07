import Experience from '@/components/sections/experience';
import Hero from '@/components/sections/hero';
import Highlights from '@/components/sections/highlights';
import { Principles } from '@/components/sections/principles';
import { WhatIDo } from '@/components/sections/what-i-do';
import Writing from '@/components/sections/writing';
import { getAllArticles } from '@/lib/articles';
import { HIGHLIGHT_PROJECT_SLUGS, HOME_ARTICLE_SLUGS } from '@/lib/constants';
import { getProjectsBySlugs } from '@/lib/projects';

export default async function Home() {
  const [allArticles, projects] = await Promise.all([
    getAllArticles(),
    getProjectsBySlugs(HIGHLIGHT_PROJECT_SLUGS),
  ]);
  const articles = HOME_ARTICLE_SLUGS.flatMap((slug) => {
    const article = allArticles.find((item) => item.slug === slug);
    return article ? [article] : [];
  });

  return (
    <>
      <Hero />
      <WhatIDo className="section-padding" />
      <div className="section-padding">
        <Highlights projects={projects} />
      </div>
      <div className="section-padding">
        <Writing articles={articles} />
      </div>
      <section className="section-padding container">
        <div className="mx-auto max-w-2xl">
          <Principles handwritten />
        </div>
      </section>
      <div className="section-padding">
        <Experience />
      </div>
    </>
  );
}
