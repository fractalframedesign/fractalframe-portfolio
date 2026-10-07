'use client';

import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';

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

  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="border-border/60 relative overflow-hidden border-b pt-15 pb-6 md:pt-20 md:pb-8 lg:pt-30 lg:pb-10"
    >
      <motion.div
        className="container space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ y, opacity }}
      >
        <motion.div className="flex flex-col gap-1" variants={itemVariants}>
          <span className="text-2xl">
            👋 Hi! I am Kiran Pingle
          </span>
          <span className="text-muted-foreground text-xl">
            Digital Product Designer and Design Engineer
          </span>
        </motion.div>

        <motion.h1
          className="max-w-3xl text-4xl leading-[1.08] text-balance md:text-5xl lg:text-[3.25rem]"
          variants={itemVariants}
        >
          I lead product design and build the systems that make complex products feel clear.
        </motion.h1>

        <motion.p
          className="text-muted-foreground max-w-2xl text-xl leading-relaxed"
          variants={itemVariants}
        >
          I bring product strategy, design systems, and frontend engineering together to shape clear, scalable digital experiences.
        </motion.p>

        <motion.div className="flex flex-wrap items-center gap-3" variants={itemVariants}>
          <Button asChild size="lg">
            <Link href="/projects">
              Explore projects <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/about"> Know More </Link>
          </Button>
        </motion.div>

        <motion.p className="text-muted-foreground text-sm" variants={itemVariants}>
          Tokyo · Product Design Director at Rakuten Mobile · Previously at Reliance Jio
        </motion.p>
      </motion.div>
    </section>
  );
};

export default Hero;
