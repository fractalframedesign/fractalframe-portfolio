'use client';

import { motion } from 'motion/react';
import type { ComponentType } from 'react';

import SectionTitle from '@/components/section-title';
import { cn } from '@/lib/utils';

import { CodeArt, FlowArt, SwatchArt, TeamArt } from './what-i-do-art';

const EASE = [0.23, 1, 0.32, 1] as const;

const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const riseVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const services: Array<{
  title: string;
  description: string;
  Art: ComponentType;
}> = [
  {
    title: 'Product design',
    description:
      'From research and flows to an interface people get at first glance.',
    Art: FlowArt,
  },
  {
    title: 'Design systems',
    description:
      'Tokens and components that let design and engineering scale together.',
    Art: SwatchArt,
  },
  {
    title: 'Design leadership',
    description:
      'Teams and partners aligned, so strong work ships consistently.',
    Art: TeamArt,
  },
  {
    title: 'Frontend engineering',
    description: 'I build what I design, so the details survive to production.',
    Art: CodeArt,
  },
];

const ServiceTile = ({
  title,
  description,
  Art,
}: (typeof services)[number]) => (
  <motion.li
    className="bg-card flex min-h-56 flex-col rounded-2xl border p-5"
    variants={riseVariants}
  >
    <div className="flex flex-1 items-center justify-center py-4">
      <Art />
    </div>
    <h3 className="text-base leading-snug">{title}</h3>
    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
      {description}
    </p>
  </motion.li>
);

export const WhatIDo = ({ className }: { className?: string }) => {
  return (
    <section className={cn('container', className)}>
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-3">
          <SectionTitle>What I do</SectionTitle>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Design, systems, and code for products where clarity is
            non-negotiable.
          </p>
        </div>
        <motion.ul
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          variants={staggerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {services.map((service) => (
            <ServiceTile key={service.title} {...service} />
          ))}
        </motion.ul>
      </div>
    </section>
  );
};
