'use client';

import { AnimatePresence, motion, useScroll } from 'motion/react';
import { useRef, useState } from 'react';

interface ArticleHeroProps {
  title: string;
  date?: string;
  description?: string;
}

export function ArticleHero({ title, date, description }: ArticleHeroProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);
  const { scrollYProgress } = useScroll();

  const handleCopyLink = async () => {
    if (copied) return;
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <>
      {/* Reading progress bar */}
      <motion.div
        className="bg-success fixed top-0 left-0 right-0 z-60 h-0.75 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <section className="hero-padding container space-y-7 pb-7! md:pb-10!">
        <h1 className="text-3xl leading-[1.08] md:text-4xl lg:text-5xl">
          {title}
        </h1>

        {description && (
          <p className="font-serif text-muted-foreground text-xl leading-relaxed max-w-2xl">
            {description}
          </p>
        )}

        <div className="border-border flex items-center justify-between gap-4 border-t pt-6 flex-wrap">
          {formattedDate && (
            <span className="text-muted-foreground text-sm">
              {formattedDate}
            </span>
          )}
          <button
            className="link-underline ml-auto flex cursor-pointer items-center gap-2"
            onClick={handleCopyLink}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={copied ? 'check' : 'link'}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 text-sm"
              >
                {copied ? <>Copied!</> : <>Copy link</>}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </section>
    </>
  );
}
