'use client';

import { ArrowRight, Pin } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';

import { ArticleFrontmatter } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ArticlesListProps {
  articles: ArticleFrontmatter[];
  showHeader?: boolean;
  showPinIcon?: boolean;
  showReadAllLink?: boolean;
  headerTitle?: string;
  className?: string;
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
}: ArticlesListProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section
      className={cn('section-padding bigger-container space-y-10', className)}
    >
      {showHeader && (
        <motion.div
          className="flex items-center justify-between md:container"
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
        className="divide-y rounded-3xl border shadow-xs"
        variants={rowVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {articles.map((article, index) => (
          <motion.li
            key={article.slug}
            variants={rowItemVariants}
            initial="idle"
            whileHover="hover"
            className={cn('relative first:rounded-t-3xl last:rounded-b-3xl')}
            onMouseEnter={() => setHoveredIndex(index)}
          >
            <AnimatePresence>
              {hoveredIndex === index && (
                <motion.div
                  layoutId="article-hover-bg"
                  className={cn(
                    'bg-muted/30 absolute inset-0',
                    index === 0 && 'rounded-t-3xl',
                    index === articles.length - 1 && 'rounded-b-3xl',
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </AnimatePresence>
            <Link
              href={`/articles/${article.slug}`}
              className="relative z-10 flex items-start justify-between gap-6 p-10"
            >
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  {showPinIcon && article.pinned && (
                    <motion.div
                      variants={{
                        idle: { rotate: 0 },
                        hover: { rotate: -20 },
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Pin className="text-foreground size-5" />
                    </motion.div>
                  )}
                  <h3 className="text-lg leading-none">{article.title}</h3>
                </div>
                <p className="text-muted-foreground text-base leading-7">
                  {article.description}
                </p>
                <span className="text-base leading-6">
                  {new Date(article.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <motion.div
                variants={{
                  idle: { x: 0 },
                  hover: { x: 6 },
                }}
              >
                <ArrowRight className="size-5 shrink-0" />
              </motion.div>
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
