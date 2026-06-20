import Hero from '@/components/sections/hero';
import { ArticlesList } from '@/components/sections/latest-writing';
import { getAllArticles } from '@/lib/articles';

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return (
    <>
    <Hero/>
      <section className="hero-padding container flex flex-col gap-5">
        <h1 className="text-3xl md:text-4xl">Articles & notes</h1>
        <p className="text-muted-foreground text-lg leading-none">
          Full-stack developer who loves building things from idea to launch.
        </p>
      </section>

      <ArticlesList articles={articles} showPinIcon className="pt-0!" />
    </>
  );
}
