'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useRef } from 'react';

import { LocalTime } from '@/components/local-time';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.23, 1, 0.32, 1] as const },
  },
};

const Key = ({ children }: { children: ReactNode }) => (
  <strong className="text-foreground font-medium">{children}</strong>
);

const NameRow = () => (
  <motion.div className="mt-8 flex items-center gap-3" variants={itemVariants}>
    <Image
      src="/images/home/avatar-sm.png"
      alt="Kiran Pingle"
      width={48}
      height={48}
      priority
      className="size-12 rounded-xl object-cover"
    />
    <div>
      <h1 className="text-base leading-snug">Kiran Pingle</h1>
      <p className="text-muted-foreground leading-snug">
        Product Design Director, Rakuten
      </p>
    </div>
  </motion.div>
);

const Intro = () => (
  <motion.div
    className="text-muted-foreground mt-8 space-y-4 text-lg leading-relaxed"
    variants={itemVariants}
  >
    <p>
      I lead product design at <Key>Rakuten</Key>. I work across{' '}
      <Key>strategy</Key>, <Key>interaction</Key>, <Key>design systems</Key>,
      and <Key>frontend</Key>, because good products need all four to agree.
    </p>
    <p>
      Before Rakuten I was at <Key>Reliance Jio</Key>, where design had to work
      for hundreds of millions of people. That taught me that clarity comes from
      systems, not screens.
    </p>
    <p>
      I write about what I learn on{' '}
      <Link href="/articles" className="link-underline text-foreground">
        Articles
      </Link>
      , and share my work on{' '}
      <Link href="/projects" className="link-underline text-foreground">
        Projects
      </Link>
      .
    </p>
  </motion.div>
);

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pt-15 md:pt-20 lg:pt-30"
    >
      <div className="container">
        <motion.div
          className="mx-auto max-w-2xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ y, opacity }}
        >
          <motion.div variants={itemVariants}>
            <LocalTime />
          </motion.div>

          <NameRow />
          <Intro />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
