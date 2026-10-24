// import { BrandsScroll } from '@/components/sections/brands-scroll';
import { DesignMotivation } from '@/components/sections/design-motivation';
import Experience from '@/components/sections/experience';
import Hero from '@/components/sections/hero';
import { ArticlesList } from '@/components/sections/latest-writing';
import { Principles } from '@/components/sections/principles';
import { WhatIDo } from '@/components/sections/what-i-do';
import { getAllArticles } from '@/lib/articles';

export default async function Home() {
  const articles = await getAllArticles();
  const recentStorySlugs = [
    'design-to-motivate',
    'stop-bringing-more-options-to-the-meeting',
    'nature-shipped-it-first',
    'stop-making-users-read-your-dashboard',
    'proactive-ux',
  ];
  const recentStories = recentStorySlugs.flatMap((slug) => {
    const article = articles.find((item) => item.slug === slug);
    return article ? [article] : [];
  });

  return (
    <>
      <Hero />
      <div className="border-border/60 border-b">
        <WhatIDo className="section-padding" />
      </div>
      <div className="border-border/60 border-b">
        <ArticlesList
          articles={recentStories}
          showHeader
          headerTitle="Recent stories"
          containerSize="standard"
        />
      </div>
      <section className="border-border/60 border-b section-padding">
        <div className="container">
          <Principles />
        </div>
      </section>
      <section className="border-border/60 border-b section-padding">
        <div className="container">
          <DesignMotivation />
        </div>
      </section>
      <Experience />
    </>
  );
}
