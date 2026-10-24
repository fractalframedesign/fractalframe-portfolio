'use client';

import {
  Blocks,
  CodeXml,
  type LucideIcon,
  PenTool,
  UsersRound,
} from 'lucide-react';
import { motion } from 'motion/react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
  icon: LucideIcon;
  title: string;
  description: string;
  tags: string[];
}> = [
  {
    icon: PenTool,
    title: 'Product design',
    description:
      'End-to-end design for complex digital products, from research and flows to a finished interface people understand at first glance.',
    tags: [
      'User-centered design',
      'Interaction design',
      'Information architecture',
      'Prototyping',
    ],
  },
  {
    icon: Blocks,
    title: 'Design systems',
    description:
      'Patterns, tokens, and components that keep products consistent and let design and engineering scale together.',
    tags: ['Design systems', 'AI design systems', 'Figma', 'Tailwind CSS'],
  },
  {
    icon: UsersRound,
    title: 'Design leadership',
    description:
      'Leading design teams and aligning product, engineering, and business partners so strong work ships consistently.',
    tags: ['Team management', 'Stakeholder management', 'Product management'],
  },
  {
    icon: CodeXml,
    title: 'Frontend engineering',
    description:
      'Building what I design in code, so the details that make an interface feel right survive all the way to production.',
    tags: ['Frontend development', 'TypeScript', 'React', 'Next.js'],
  },
];

export const WhatIDo = ({ className }: { className?: string }) => {
  return (
    <section className={cn('container space-y-10', className)}>
      <motion.div
        className="max-w-2xl space-y-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={riseVariants}
      >
        <h2 className="text-2xl leading-none">What I do</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Design, systems, and code for products where clarity is
          non-negotiable.
        </p>
      </motion.div>
      <motion.ul
        className="grid gap-4 md:grid-cols-2"
        variants={staggerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {services.map((service) => (
          <motion.li
            key={service.title}
            className="bg-card flex flex-col gap-5 rounded-2xl border p-6"
            variants={riseVariants}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <span className="bg-muted flex size-10 items-center justify-center rounded-xl">
              <service.icon aria-hidden="true" className="size-5" />
            </span>
            <div className="space-y-3">
              <h3 className="text-xl leading-snug">{service.title}</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                {service.description}
              </p>
            </div>
            <ul className="mt-auto flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="outline" className="rounded-full px-2.5">
                    {tag}
                  </Badge>
                </li>
              ))}
            </ul>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
};
