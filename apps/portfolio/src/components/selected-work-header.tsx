'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const },
  },
};

export const SelectedWorkHeader = () => {
  return (
    <motion.div
      className="flex items-end justify-between gap-4"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="space-y-2">
        <motion.p
          className="text-primary text-xs font-semibold tracking-widest uppercase"
          variants={itemVariants}
        >
          Work
        </motion.p>
        <motion.h2 className="text-2xl leading-none" variants={itemVariants}>
          Recent projects
        </motion.h2>
      </div>
      <motion.div variants={itemVariants}>
        <Link href="/projects" className="link-underline text-base leading-none">
          View all
        </Link>
      </motion.div>
    </motion.div>
  );
};
