'use client';

import { motion } from 'motion/react';

const principles = [
  {
    title: 'Clarity Over Complexity',
    description:
      'Complexity often appears naturally; clarity must be designed intentionally. My goal is to simplify without oversimplifying, removing friction, reducing cognitive load, and helping people focus on what matters most.',
  },
  {
    title: 'Systems Over Screens',
    description:
      'Individual interfaces solve immediate problems. Systems solve them repeatedly. I invest in patterns, design systems, and scalable foundations that create consistency, speed delivery, and improve product quality as teams grow.',
  },
  {
    title: 'Collaboration Over Handoffs',
    description:
      'The strongest products are built when design, engineering, and product teams work together rather than as separate functions. Shared ownership leads to better decisions, faster learning, and stronger outcomes.',
  },
  {
    title: 'Progress Over Perfection',
    description:
      'Perfection can delay learning. I believe in delivering value early, gathering feedback quickly, and continuously improving through iteration. Great products evolve through evidence, not assumptions.',
  },
  {
    title: 'People First',
    description:
      'Technology changes rapidly, but human needs remain remarkably consistent. Every design decision should ultimately serve the people using the product, making their work easier, their goals clearer, and their experiences more meaningful.',
  },
];

export function Principles() {
  return (
    <div className="space-y-8 md:space-y-10">
      <div className="max-w-2xl space-y-3">
        <motion.h2
          className="text-2xl leading-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          Principles
        </motion.h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          5 principles guide how I approach the design engineering.
        </p>
      </div>
      <ul className="space-y-8">
        {principles.map((principle, index) => (
          <motion.li
            key={principle.title}
            className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 gap-y-3 md:grid-cols-[3rem_minmax(0,1fr)] md:gap-x-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1], delay: index * 0.08 }}
          >
            <span className="text-muted-foreground pt-1 text-sm">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="text-xl leading-snug md:text-2xl">
              {principle.title}
            </h3>
            <p className="text-muted-foreground col-start-2 max-w-2xl text-lg leading-relaxed">
              {principle.description}
            </p>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}