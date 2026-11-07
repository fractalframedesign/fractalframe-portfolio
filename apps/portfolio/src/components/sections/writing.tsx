import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import SectionTitle from '@/components/section-title';
import type { ArticleFrontmatter } from '@/lib/types';

/** Quiet list of recent articles for the home page */
export default function Writing({
  articles,
}: {
  articles: ArticleFrontmatter[];
}) {
  return (
    <section className="container">
      <div className="mx-auto max-w-2xl space-y-8">
        <SectionTitle>Stories</SectionTitle>
        <ul className="divide-y border-y">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/articles/${article.slug}`}
                className="group flex items-center gap-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {article.image && (
                  <span className="bg-muted relative block h-14 w-20 shrink-0 overflow-hidden rounded-lg border">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-2xl leading-snug">
                    {article.title}
                  </span>
                  <span className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                    {article.description}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/articles" className="link-underline text-foreground">
          Read all
        </Link>
      </div>
    </section>
  );
}
