'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useRef } from 'react';

import {
  DribbbleIcon,
  LinkedInIcon,
  MediumIcon,
} from '@/components/icons/social';
import { LocalTime } from '@/components/local-time';
import { Button } from '@/components/ui/button';
import { PROFILE_LINKS } from '@/lib/constants';

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

const PROFILE_ICONS = {
  LinkedIn: LinkedInIcon,
  Medium: MediumIcon,
  Dribbble: DribbbleIcon,
};

const ProfileLinks = () => (
  <motion.ul
    className="mt-6 -ml-2 flex items-center gap-1"
    variants={itemVariants}
  >
    {PROFILE_LINKS.map(({ name, href }) => {
      const Icon = PROFILE_ICONS[name];
      return (
        <li key={name}>
          <Button asChild variant="ghost" size="icon" tooltip={name}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
            >
              <Icon aria-hidden="true" className="size-4" />
            </a>
          </Button>
        </li>
      );
    })}
  </motion.ul>
);

const Key = ({ children }: { children: ReactNode }) => (
  <strong className="text-foreground font-medium">{children}</strong>
);

const NameRow = () => (
  <motion.div className="mt-8 flex items-center gap-3" variants={itemVariants}>
    <Image
      src="/images/home/Kiran-Pingle.png"
      alt="Kiran Pingle"
      width={48}
      height={48}
      priority
      className="size-12 rounded-xl object-cover"
    />
    <div>
      <h1 className="text-xl leading-snug">Kiran Pingle</h1>
      <p className="text-muted-foreground leading-snug">Product Designer</p>
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
      for hundreds of millions of people. That gave me{' '}
      <Link href="/about#principles" className="link-underline text-success">
        5 guiding principles
      </Link>{' '}
      that I use as my north star.
    </p>
    <p>
      I write about what I learn on{' '}
      <Link href="/articles" className="link-underline text-success">
        Articles
      </Link>
      , and share my work on{' '}
      <Link href="/projects" className="link-underline text-success">
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
          <ProfileLinks />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
