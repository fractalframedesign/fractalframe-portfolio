import rehypeShiki from '@shikijs/rehype';
import { MDXComponents } from 'mdx/types';
import Image, { ImageProps } from 'next/image';
import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import { ComponentPropsWithoutRef } from 'react';

import { Pre } from '@/components/mdx/code-block';
import { ArticleHero } from '@/components/sections/article';
import { ArticlesList } from '@/components/sections/latest-writing';
import {
  getAllArticles,
  getArticleBySlug,
  getArticleSlugs,
} from '@/lib/articles';
import { ArticleFrontmatter } from '@/lib/types';

function MdxImage(props: ImageProps) {
  return (
    <div className="not-prose bigger-container">
      <Image {...props} className="rounded-3xl" alt={props.alt || ''} />
    </div>
  );
}

function H2({ children, ...props }: ComponentPropsWithoutRef<'h2'>) {
  return (
    <div className="container">
      <h2 {...props}>{children}</h2>
    </div>
  );
}

function P({ children, className, ...props }: ComponentPropsWithoutRef<'p'>) {
  return (
    <div className="container">
      <p className={className} {...props}>
        {children}
      </p>
    </div>
  );
}

function Lead({ children }: { children: React.ReactNode }) {
  return (
    <div className="container">
      <p className="lead text-muted-foreground">{children}</p>
    </div>
  );
}

function Ul({ children, ...props }: ComponentPropsWithoutRef<'ul'>) {
  return (
    <div className="container">
      <ul {...props}>{children}</ul>
    </div>
  );
}

const mdxComponents: MDXComponents = {
  pre: Pre,
  img: MdxImage as MDXComponents['img'],
  h2: H2,
  p: P,
  ul: Ul,
  Lead,
};

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, allArticles] = await Promise.all([
    getArticleBySlug(slug),
    getAllArticles(),
  ]);

  if (!article) {
    notFound();
  }

  const otherArticles = allArticles.filter((a) => a.slug !== slug);

  const { content } = await compileMDX<ArticleFrontmatter>({
    source: article.content,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [
          [
            rehypeShiki,
            {
              themes: {
                light: 'github-light',
                dark: 'github-dark',
              },
              defaultColor: false,
            },
          ],
        ],
      },
    },
    components: mdxComponents,
  });

  return (
    <>
      <article className="section-padding pt-0!">
        <ArticleHero
          title={article.frontmatter.title}
          date={article.frontmatter.date}
          description={article.frontmatter.description}
        />
        <div className="prose prose-lg prose-neutral dark:prose-invert prose-a:link-underline prose-a:no-underline prose-lead:text-muted-foreground prose-li:marker:text-foreground prose-h2:text-2xl prose-h2:font-display prose-h2:mt-12 prose-h2:mb-4 prose-p:font-serif prose-p:text-xl prose-p:leading-[1.75] prose-li:font-serif prose-li:text-xl prose-blockquote:font-serif prose-blockquote:not-italic prose-blockquote:text-[1.3rem] max-w-none space-y-6">
          {content}
        </div>
      </article>
      {otherArticles.length > 0 && (
        <ArticlesList
          articles={otherArticles}
          showHeader
          headerTitle="Related articles"
          showReadAllLink={false}
        />
      )}
    </>
  );
}
