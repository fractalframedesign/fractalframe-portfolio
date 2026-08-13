import type { Metadata } from 'next';

import { ArticlesList } from '@/components/sections/latest-writing';
import { getAllArticles } from '@/lib/articles';

export const metadata: Metadata = {
  title: 'Articles & notes',
  description:
    'Notes on product design, design systems, and clear thinking.',
};

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return (
    <>
      <section className="hero-padding">
        <div className="container flex flex-col gap-5">
          <h1 className="text-3xl md:text-4xl">Articles & notes</h1>
          <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
            Notes on product design, design systems, and clear thinking.
          </p>
        </div>
      </section>

      <ArticlesList articles={articles} showPinIcon className="pt-0!" />
    </>
  );
}
