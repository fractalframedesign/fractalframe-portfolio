'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';

interface ArticleHeroProps {
  title: string;
}

export function ArticleHero({ title }: ArticleHeroProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  const handleCopyLink = async () => {
    if (copied) return;

    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="hero-padding container space-y-8 pb-7! md:space-y-10 md:pb-10!">
      <h1 className="text-3xl md:text-4xl">{title}</h1>
      <button
        className="link-underline flex cursor-pointer items-center gap-2"
        onClick={handleCopyLink}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={copied ? 'check' : 'link'}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 text-lg"
          >
            {copied ? <>Copied!</> : <>Copy link</>}
          </motion.div>
        </AnimatePresence>
      </button>
    </section>
  );
}
