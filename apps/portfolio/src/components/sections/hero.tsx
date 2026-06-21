'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

import { CONTACT_EMAIL } from '@/lib/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const avatarY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const emailY = useTransform(scrollYProgress, [0, 1], [0, -15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <motion.section
      ref={sectionRef}
      className="hero-padding container relative space-y-10"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      style={{ opacity }}
    >
      <motion.div
        className="relative size-16 overflow-hidden rounded-full"
        variants={itemVariants}
        style={{ y: avatarY }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Image
          src="/images/home/avatar.webp"
          alt="Kiran Pingle's avatar"
          fill
          className="rounded-full object-cover"
          priority
        />
      </motion.div>

      {/* Text content */}
      <motion.div
        className="flex flex-col gap-5"
        variants={itemVariants}
        style={{ y: textY }}
      >
        <h1 className="text-3xl md:text-4xl">Hi, I&apos;m Kiran</h1>on
        <p className="text-muted-foreground text-lg leading-none">
          Full-stack developer who loves building things from idea to launch.
        </p>
      </motion.div>

      {/* Email link */}
      <motion.div variants={itemVariants} style={{ y: emailY }}>
        <Link
          href={`mailto:${CONTACT_EMAIL}`}
          className="link-underline text-lg leading-none"
        >
          {CONTACT_EMAIL}
        </Link>
      </motion.div>
    </motion.section>
  );
};

export default Hero;
