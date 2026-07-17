'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';

import { HireMePopup } from '@/components/hire-me-popup';
import { cn } from '@/lib/utils';

const images = [
  {
    image: {
      src: '/images/about/coding.webp',
      alt: 'Person coding on laptop',
      rotation: 4.6,
    },
    emoji: {
      text: '👨‍💻',
      classname: 'top-0 -translate-y-1/2 -right-4',
      hoverX: -226, // slides from right side to left side (250px image + offsets - emoji width)
    },
  },
  {
    image: {
      src: '/images/about/bridge.webp',
      alt: 'Golden Gate Bridge',
      rotation: -4,
    },
    emoji: {
      text: '🏔️',
      classname: 'bottom-0 translate-y-1/2 -right-4',
      hoverX: -206, // slides from right side to left side
    },
  },
  {
    image: {
      src: '/images/about/dog.webp',
      alt: 'French Bulldog',
      rotation: 3.6,
    },
    emoji: {
      text: '🐶',
      classname: 'top-0 -translate-y-1/2 left-8',
      hoverX: 126, // slides from left side to right side (250px - 32px left offset - 32px right offset)
    },
  },
];

const HOVER_THRESHOLD = 3000; // 3 seconds total

const STORY_PARAGRAPHS = [
  "I'm Kiran Pingle, a Product Designer based in Tokyo, known for integrating design, frontend engineering, and product strategy to create seamless user experiences for over 15 years.",
  'I lead Digital Product Design at Rakuten, focusing on design systems and workflows that let design and engineering scale together. Before Rakuten, I designed large-scale digital experiences for hundreds of millions of users at Reliance Jio. That taught me that great design relies on strong systems, close teamwork, and consistent execution.',
  'My work bridges design craftsmanship, frontend development, and AI. What sets me apart is my ability to translate complex ideas into products that are not only functional but so intuitive that the right choice feels obvious.',
];

const PRINCIPLES = [
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

const About = () => {
  const [showPopup, setShowPopup] = useState(false);
  /** Bump when opening so HireMePopup remounts and picks a fresh random message. */
  const [hirePopupKey, setHirePopupKey] = useState(0);
  const accumulatedTimeRef = useRef(0);
  const hoverStartTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownRef = useRef(false);

  const handleHoverStart = useCallback(() => {
    if (hasShownRef.current) return;

    hoverStartTimeRef.current = Date.now();

    // Check accumulated time periodically
    intervalRef.current = setInterval(() => {
      if (hoverStartTimeRef.current === null) return;

      const currentHoverTime = Date.now() - hoverStartTimeRef.current;
      const totalTime = accumulatedTimeRef.current + currentHoverTime;

      if (totalTime >= HOVER_THRESHOLD) {
        setHirePopupKey((k) => k + 1);
        setShowPopup(true);
        hasShownRef.current = true;

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 100);
  }, []);

  const handleHoverEnd = useCallback(() => {
    if (hoverStartTimeRef.current !== null) {
      accumulatedTimeRef.current += Date.now() - hoverStartTimeRef.current;
      hoverStartTimeRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return (
    <section className="section-padding bigger-container space-y-11 md:space-y-21">
      <div className="space-y-10 md:container">
        <motion.div
          className="relative size-18 shrink-0 overflow-hidden rounded-full"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          whileHover={{ scale: 1.08, rotate: 4 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <Image
            src="/images/home/avatar.webp"
            alt="Kiran Pingle"
            fill
            className="object-cover"
          />
        </motion.div>
        <div className="max-w-2xl space-y-8 md:space-y-10">
          <motion.p
            className="text-foreground text-xl leading-relaxed md:text-2xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          >
            {STORY_PARAGRAPHS[0]}
          </motion.p>
          <div className="text-muted-foreground space-y-6 text-lg leading-relaxed md:space-y-8">
            {STORY_PARAGRAPHS.slice(1).map((text, i) => (
              <motion.p
                key={text}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1], delay: (i + 1) * 0.1 }}
              >
                {text}
              </motion.p>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-10 md:container">
        <motion.h2
          className="text-2xl leading-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          Principles
        </motion.h2>
        <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
          5 principles guide how I approach the design engineering.
        </p>
        <ul className="max-w-2xl space-y-10 md:space-y-14">
          {PRINCIPLES.map((principle, i) => (
            <motion.li
              key={principle.title}
              className="space-y-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1], delay: i * 0.08 }}
            >
              <span className="text-muted-foreground block text-sm">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-xl leading-snug md:text-2xl">{principle.title}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {principle.description}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="relative">
        <ul className="flex flex-wrap justify-center gap-8 lg:justify-between">
          {images.map((item, index) => (
            <motion.li
              key={item.image.src}
              className="relative"
              initial={{ opacity: 0, rotate: item.image.rotation }}
              whileInView={{ opacity: 1, rotate: item.image.rotation }}
              whileHover="hover"
              viewport={{ once: true, margin: '-40px' }}
              transition={{ type: 'spring', stiffness: 180, damping: 22, delay: index * 0.12 }}
              onHoverStart={handleHoverStart}
              onHoverEnd={handleHoverEnd}
            >
              <motion.div
                className="relative size-62.5 overflow-hidden rounded-3xl"
                variants={{
                  hover: { rotate: -item.image.rotation },
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  className="object-cover"
                />
              </motion.div>
              <motion.div
                className={cn(
                  'bg-background absolute flex size-14 items-center justify-center rounded-full border shadow-xs',
                  item.emoji.classname,
                )}
                variants={{
                  idle: { x: 0 },
                  hover: { x: item.emoji.hoverX },
                }}
                transition={{ type: 'spring', stiffness: 80, damping: 20 }}
              >
                <span className="text-3xl">{item.emoji.text}</span>
              </motion.div>
            </motion.li>
          ))}
        </ul>

        <HireMePopup
          key={hirePopupKey}
          show={showPopup}
          onDismiss={() => setShowPopup(false)}
        />
      </div>
    </section>
  );
};

export default About;
