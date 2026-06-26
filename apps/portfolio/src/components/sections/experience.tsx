'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';

import { cn } from '@/lib/utils';

const skills = [
  'React / Next.js',
  'TypeScript / JavaScript (ES6+)',
  'State management (Zustand, Redux, Context)',
  'Responsive design & accessibility',
  'Motion & interaction (Framer Motion, GSAP)',
  'API integration & data fetching',
  'Node.js / Express / Fastify',
  'RESTful & GraphQL API design',
  'PostgreSQL / Prisma ORM',
  'Authentication & authorization',
  'WebSockets & real-time systems',
];

const experiences = [
  {
    company: 'Cactus Plant',
    href: 'https://cactusplant.com',
    role: 'Full-stack developer',
    period: '2024 - Present',
    skills: [0, 1, 2, 4, 6, 7, 8, 9, 10],
  },
  {
    company: 'Happy Stats',
    href: 'https://happystats.io',
    role: 'Full-stack developer',
    period: '2023 - 2024',
    skills: [0, 1, 5, 6, 7, 8, 9],
  },
  {
    company: 'JustOS',
    href: 'https://justos.dev',
    role: 'Frontend developer',
    period: '2021 - 2023',
    skills: [0, 1, 2, 3, 4, 5],
  },
  {
    company: 'Freelance',
    href: 'https://upwork.com',
    role: 'Frontend developer',
    period: '2019 - 2021',
    skills: [0, 1, 3, 4, 5],
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

const skillListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const skillItemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as const },
  },
};

const Experience = () => {
  const [hoveredSkills, setHoveredSkills] = useState<number[] | null>(null);

  return (
    <section className="section-padding container space-y-10">
      <motion.h2
        className="text-2xl leading-none"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        Experience
      </motion.h2>

      <div className="grid gap-10 md:grid-cols-2">
        <motion.ul
          className="space-y-10"
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {experiences.map((exp) => (
            <motion.li key={exp.company} className="text-lg leading-none" variants={itemVariants}>
              <motion.div
                className="pointer-events-none"
                initial="idle"
                whileHover="hover"
                onHoverStart={() => setHoveredSkills(exp.skills)}
                onHoverEnd={() => setHoveredSkills(null)}
              >
                <motion.div
                  className="pointer-events-auto inline-block"
                  variants={{
                    idle: { x: 0 },
                    hover: { x: 8 },
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <Link
                    href={exp.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline inline-block"
                  >
                    {exp.company}
                  </Link>
                </motion.div>
                <motion.p
                  className="text-muted-foreground mt-4"
                  variants={{
                    idle: { x: 0, opacity: 0.7 },
                    hover: { x: 8, opacity: 1 },
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.02 }}
                >
                  {exp.role}
                </motion.p>
                <motion.p
                  className="text-muted-foreground mt-4"
                  variants={{
                    idle: { x: 0, opacity: 0.7 },
                    hover: { x: 8, opacity: 1 },
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.04 }}
                >
                  {exp.period}
                </motion.p>
              </motion.div>
            </motion.li>
          ))}
        </motion.ul>

        <div className="space-y-4 text-lg leading-none">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            Skills
          </motion.p>
          <motion.ul
            className="space-y-4"
            variants={skillListVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {skills.map((skill, index) => (
              <motion.li
                key={skill}
                variants={skillItemVariants}
                className={cn(
                  'transition-colors duration-300',
                  hoveredSkills === null
                    ? 'text-muted-foreground'
                    : hoveredSkills.includes(index)
                      ? 'text-foreground'
                      : 'text-muted-foreground/40',
                )}
              >
                {skill}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
};

export default Experience;
