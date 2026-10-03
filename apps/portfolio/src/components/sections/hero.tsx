'use client';

import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
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

  // Scroll-parallax on the inner wrapper only — keeps entrance animation clean
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="border-border/60 border-b pt-15 pb-6 md:pt-20 md:pb-8 lg:pt-30 lg:pb-10"
    >
      <motion.div
        className="container space-y-8"
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
              Digital Product Designer and Design Engineer
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-4xl leading-[1.08] text-balance md:text-5xl lg:text-[3.25rem]"
          variants={itemVariants}
        >
          I lead product design and build the systems that make complex products feel clear.
        </motion.h1>

        {/* Serif lead */}
        <motion.p
          className="font-serif text-muted-foreground max-w-2xl text-xl leading-relaxed"
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
            <Link href="/about">Read my profile</Link>
          </Button>
        </motion.div>

        <motion.p
          className="text-muted-foreground text-sm"
          variants={itemVariants}
        >
          Tokyo · Product Design Director at Rakuten Mobile · Previously at Reliance Jio
        </motion.p>
      </motion.div>
    </section>
  );
};

export default Hero;
