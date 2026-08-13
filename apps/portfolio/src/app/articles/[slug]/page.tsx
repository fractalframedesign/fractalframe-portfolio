import rehypeShiki from '@shikijs/rehype';
import { MDXComponents } from 'mdx/types';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import { ComponentPropsWithoutRef, isValidElement } from 'react';

import * as DetailsArticleDemos from '@/components/article-demos/details-article';
import * as FractalArticleDemos from '@/components/article-demos/fractal-article';
import { Pre } from '@/components/mdx/code-block';
import { ArticleHero } from '@/components/sections/article';
import { ArticlesList } from '@/components/sections/latest-writing';
import {
  getAllArticles,
  getArticleBySlug,
  getArticleSlugs,
} from '@/lib/articles';
import { ArticleFrontmatter } from '@/lib/types';

function MdxImage({ src, alt }: ComponentPropsWithoutRef<'img'>) {
  return (
    <div className="not-prose bigger-container">
      <figure className="space-y-3">
        <div className="bg-muted relative aspect-video overflow-hidden rounded-3xl">
          <Image src={String(src ?? '')} alt={alt ?? ''} fill className="object-cover" />
        </div>
        {alt && (
          <figcaption className="text-muted-foreground text-center text-sm">
            {alt}
          </figcaption>
        )}
      </figure>
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

function H3({ children, ...props }: ComponentPropsWithoutRef<'h3'>) {
  return (
    <div className="container">
      <h3 {...props}>{children}</h3>
    </div>
  );
}

function P({ children, className, ...props }: ComponentPropsWithoutRef<'p'>) {
  // MDX wraps standalone images in a paragraph; MdxImage renders a div,
  // which is invalid inside <p> and breaks hydration — unwrap it instead
  if (isValidElement(children) && children.type === MdxImage) {
    return children;
  }
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
  h3: H3,
  p: P,
  ul: Ul,
  Lead,
  ...DetailsArticleDemos,
  ...FractalArticleDemos,
};

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {};
  }

  const { title, description, date, image } = article.frontmatter;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: date,
      url: `/articles/${slug}`,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
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
      <article className="section-padding relative pt-0!">
        <ArticleHero
          title={article.frontmatter.title}
          date={article.frontmatter.date}
          description={article.frontmatter.description}
        />
        <div className="prose prose-lg prose-neutral dark:prose-invert prose-a:link-underline prose-a:no-underline prose-lead:text-muted-foreground prose-li:marker:text-foreground prose-h2:text-2xl prose-h2:font-display prose-h2:mt-12 prose-h2:mb-0 prose-p:font-serif prose-p:font-normal prose-p:text-[1.3125rem] prose-p:leading-[1.58] prose-p:tracking-[-0.003em] prose-p:mt-0 prose-li:font-serif prose-li:font-normal prose-li:text-[1.3125rem] prose-li:leading-[1.58] prose-blockquote:font-serif prose-blockquote:not-italic prose-blockquote:font-normal prose-blockquote:text-[1.3rem] max-w-none space-y-6">
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
