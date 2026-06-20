import About from '@/components/sections/about';
import Experience from '@/components/sections/experience';
import Hero from '@/components/sections/hero';
import { ArticlesList } from '@/components/sections/latest-writing';
import SelectedWork from '@/components/sections/selected-work';
import { StackGrid } from '@/components/stack-grid';
import { getAllArticles } from '@/lib/articles';

const stack = [
  'typescript',
  'nextjs',
  'figma',
  'nodejs',
  'vercel',
  'tailwind',
  'docker',
  'flyio',
];

export default async function Home() {
  const articles = await getAllArticles();
  const latestArticles = articles.slice(0, 3);

  return (
    <>
      <Hero />
     
      <SelectedWork />
      <StackGrid stack={stack} />
      <About />
      <Experience />
      <ArticlesList articles={latestArticles} showHeader />
    </>
  );
}
