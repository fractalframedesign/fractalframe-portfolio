// import { BrandsScroll } from '@/components/sections/brands-scroll';
import Hero from '@/components/sections/hero';
import { ArticlesList } from '@/components/sections/latest-writing';
import SelectedWork from '@/components/sections/selected-work';
import { StackGrid } from '@/components/stack-grid';
import { getAllArticles } from '@/lib/articles';

const stack = [
  'figma',
  'js',
  'html5',
  'typescript',
  'reactjs',
  'nextjs',
  'tailwind',
  'vscode',
  'claude',
  'codex',
];

export default async function Home() {
  const articles = await getAllArticles();
  const latestArticles = articles.slice(0, 3);

  return (
    <>
      <Hero />
     
      <StackGrid stack={stack} />
      {/* <BrandsScroll /> */}
      {/* <SelectedWork /> */}
      <ArticlesList articles={latestArticles} showHeader />
    </>
  );
}
