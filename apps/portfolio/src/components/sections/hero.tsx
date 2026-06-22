'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import { useRef } from 'react';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.55, ease: [0.23, 1, 0.32, 1] as const },
  },
};

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Scroll-parallax on the inner wrapper only — keeps entrance animation clean
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={sectionRef} className="hero-padding container">
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ y, opacity }}
      >
        {/* Avatar + identity row */}
        <motion.div className="flex items-center gap-4" variants={itemVariants}>
          <motion.div
            className="relative size-18 shrink-0 overflow-hidden rounded-full"
            whileHover={{ scale: 1.08, rotate: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Image
              src="/images/home/avatar.webp"
              alt="Kiran Pingle"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          <div className="flex flex-col gap-1">
            <span className="text-foreground text-base font-medium">
              Hi, I&apos;m Kiran 👋
            </span>
            <span className="text-muted-foreground text-sm">
              Product Designer and Design Engineer
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-4xl leading-[1.08] text-balance md:text-5xl lg:text-[3.25rem]"
          variants={itemVariants}
        >
          Building better products, leading calmly, and making smarter decisions in the age of AI.
        </motion.h1>

        {/* Serif lead */}
        <motion.p
          className="font-serif text-muted-foreground max-w-xl text-xl leading-relaxed"
          variants={itemVariants}
        >
          Two decades of product design, distilled into notes on clarity, craft, and clear thinking.
        </motion.p>
      </motion.div>
    </section>
  );
};

export default Hero;
