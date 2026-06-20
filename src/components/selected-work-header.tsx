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
      className="flex items-center justify-between md:container"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.h2 className="text-2xl leading-none" variants={itemVariants}>
        Selected work
      </motion.h2>
      <motion.div variants={itemVariants}>
        <Link href="/projects" className="link-underline text-lg leading-none">
          View all
        </Link>
      </motion.div>
    </motion.div>
  );
};
