// import { BrandsScroll } from '@/components/sections/brands-scroll';
import Experience from '@/components/sections/experience';
import Hero from '@/components/sections/hero';
import { ArticlesList } from '@/components/sections/latest-writing';
import { Principles } from '@/components/sections/principles';
import { getAllArticles } from '@/lib/articles';

export default async function Home() {
  const articles = await getAllArticles();
  const latestArticles = articles.slice(0, 3);

  return (
    <>
      <Hero />
      <section className="border-border/60 border-b section-padding">
        <div className="container">
          <Principles />
        </div>
      </section>
      <Experience />
      <div className="border-border/60 border-t">
        <ArticlesList
          articles={latestArticles}
          showHeader
          containerSize="standard"
        />
      </div>
    </>
  );
}
