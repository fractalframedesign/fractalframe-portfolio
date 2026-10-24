'use client';

import {
  animate,
  motion,
  useInView,
  useReducedMotion,
} from 'motion/react';
import { useEffect, useRef } from 'react';

import { Principles } from '@/components/sections/principles';
import { WhatIDo } from '@/components/sections/what-i-do';

const EASE = [0.23, 1, 0.32, 1] as const;

const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const riseVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const stats = [
  { value: 15, suffix: '+', label: 'Years designing digital products' },
  { value: 100, suffix: 'M+', label: 'Users reached at Reliance Jio' },
  { value: 4, suffix: '', label: 'Companies across my career' },
];

const BACKGROUND_PARAGRAPHS = [
  'I lead Digital Product Design at Rakuten, focusing on design systems and workflows that let design and engineering scale together. Before Rakuten, I designed large-scale digital experiences for hundreds of millions of users at Reliance Jio. That taught me that great design relies on strong systems, close teamwork, and consistent execution.',
  'My work bridges design craftsmanship, frontend development, and AI. What sets me apart is my ability to translate complex ideas into products that are not only functional but so intuitive that the right choice feels obvious.',
];

/** Counts up from zero the first time it scrolls into view. */
const StatNumber = ({ value, suffix }: { value: number; suffix: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || !isInView || prefersReducedMotion) return;

    const controls = animate(0, value, {
      duration: 1.2,
      ease: EASE,
      onUpdate: (latest) => {
        node.textContent = `${Math.round(latest)}${suffix}`;
      },
    });

    return () => controls.stop();
  }, [isInView, prefersReducedMotion, suffix, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
      {suffix}
    </span>
  );
};

const About = () => {
  return (
    <>
      <section className="hero-padding pb-12.5! md:pb-15! lg:pb-18.75!">
        <motion.div
          className="container flex flex-col gap-5"
          variants={staggerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className="text-3xl md:text-4xl" variants={riseVariants}>
            About
          </motion.h1>
          <motion.p
            className="text-muted-foreground max-w-xl text-lg leading-relaxed"
            variants={riseVariants}
          >
            Fifteen years of design, frontend engineering, and product
            strategy, and what that looks like in practice.
          </motion.p>
        </motion.div>
      </section>

      <section className="container pb-12.5 md:pb-15 lg:pb-18.75">
        <motion.ul
          className="grid gap-10 sm:grid-cols-3"
          variants={staggerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {stats.map((stat) => (
            <motion.li key={stat.label} className="space-y-3" variants={riseVariants}>
              <p className="font-display font-weight-display text-5xl leading-none tracking-tight md:text-6xl">
                <StatNumber value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </motion.li>
          ))}
        </motion.ul>
      </section>

      <WhatIDo />

      <section className="section-padding container">
        <div className="max-w-2xl space-y-5">
          <motion.h2
            className="text-2xl leading-none"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            Background
          </motion.h2>
          <div className="space-y-6 text-lg leading-relaxed md:space-y-8">
            {BACKGROUND_PARAGRAPHS.map((text, i) => (
              <motion.p
                key={text}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, ease: EASE, delay: i * 0.1 }}
              >
                {text}
              </motion.p>
            ))}
          </div>
        </div>
      </section>

      <section className="container pb-12.5 md:pb-15 lg:pb-18.75">
        <Principles />
      </section>
    </>
  );
};

export default About;
