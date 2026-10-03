import type { Metadata } from 'next';

import About from '@/components/sections/about';
import { StackGrid } from '@/components/stack-grid';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Product Designer and Design Engineer with 20 years of experience building products that are as clear to use as they are to look at.',
};

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
  return (
    <>
      <About />
      <StackGrid stack={MY_STACK} />
    </>
  );
}
