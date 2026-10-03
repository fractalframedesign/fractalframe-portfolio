'use client';

import { ArrowRight, Pin } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

import { ArticleFrontmatter } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ArticlesListProps {
  articles: ArticleFrontmatter[];
  showHeader?: boolean;
  showPinIcon?: boolean;
  showReadAllLink?: boolean;
  headerTitle?: string;
  className?: string;
  containerSize?: 'standard' | 'wide';
}

const rowVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const rowItemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const },
  },
};

export function ArticlesList({
  articles,
  showHeader = false,
  showPinIcon = false,
  showReadAllLink = true,
  headerTitle = 'Latest writing',
  className,
  containerSize = 'wide',
}: ArticlesListProps) {

  return (
    <section
      className={cn(
        'section-padding space-y-10',
        containerSize === 'standard' ? 'container' : 'bigger-container',
        className,
      )}
    >
      {showHeader && (
        <motion.div
          className={cn(
            'flex items-center justify-between',
            containerSize === 'wide' && 'md:container',
          )}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <h2 className="text-2xl leading-none">{headerTitle}</h2>
          {showReadAllLink && (
            <Link href="/articles" className="link-underline text-lg">
              Read all
            </Link>
          )}
        </motion.div>
      )}

      <motion.ul
        className="space-y-0 divide-y divide-border  pl-6"
        variants={rowVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {articles.map((article) => (
          <motion.li
            key={article.slug}
            variants={rowItemVariants}
            className="relative"
          >
            <Link
              href={`/articles/${article.slug}`}
              className="relative z-10 flex items-start justify-between gap-6 p-10"
            >
              <div className="flex-1 space-y-5">
                <div className="flex items-center gap-3">
                  {showPinIcon && article.pinned && (
                    <Pin className="text-foreground size-5" />
                  )}
                  <h3 className="text-xl leading-snug md:text-2xl">{article.title}</h3>
                </div>
                <span className="text-muted-foreground block text-sm">
                  {new Date(article.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <p className="text-muted-foreground text-base leading-7">
                  {article.description}
                </p>
              </div>
              {article.image && (
                <div className="bg-muted relative hidden aspect-video w-64 shrink-0 self-start overflow-hidden rounded-xl md:block">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="256px"
                    className="object-cover"
                  />
                </div>
              )}
              <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
