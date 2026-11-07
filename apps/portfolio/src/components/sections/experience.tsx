'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

import SectionTitle from '@/components/section-title';

const experiences = [
  {
    company: 'Rakuten Mobile',
    href: 'https://mobile.rakuten.co.jp',
    role: 'Product Design Director',
    period: '2022 - Present',
  },
  {
    company: 'Rakuten Inc.',
    href: 'https://www.rakuten.com',
    role: 'UI/UX Section Manager',
    period: '2019 - 2022',
  },
  {
    company: 'Reliance Jio',
    href: 'https://www.jio.com',
    role: 'Product - UX/UI Manager',
    period: '2015 - 2019',
  },
  {
    company: 'Winjit Technologies',
    href: 'https://www.winjit.com',
    role: 'Design Lead',
    period: '2008 - 2015',
  },
];

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const },
  },
};

/** Work history as simple rows: company and role on the left, period on the right */
const Experience = () => {
  return (
    <section className="container">
      <div className="max-w-2xl space-y-8">
        <SectionTitle>Work</SectionTitle>
        <motion.ul
          className="divide-y border-y"
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {experiences.map((exp) => (
            <motion.li
              key={exp.company}
              variants={itemVariants}
              className="flex items-start justify-between gap-4 py-4"
            >
              <div>
                <Link
                  href={exp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline leading-snug"
                >
                  {exp.company}
                </Link>
                <p className="text-muted-foreground leading-snug">{exp.role}</p>
              </div>
              <p className="text-muted-foreground shrink-0 text-sm tabular-nums">
                {exp.period}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
};

export default Experience;
