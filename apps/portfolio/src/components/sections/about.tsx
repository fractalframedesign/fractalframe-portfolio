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
        <motion.h2
          className="text-2xl leading-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          About
        </motion.h2>
        <div className="text-muted-foreground space-y-8 text-lg md:space-y-11">
          {[
            'I started coding out of curiosity — building small browser games and landing pages — and over time grew into developing complete products that balance design and engineering.',
            'My stack includes TypeScript, React, Next.js, Node, and PostgreSQL, but I love exploring new technologies that make the web better.',
            'Outside of coding, I enjoy writing, contributing to open source, and teaching others what I’ve learned.',
          ].map((text, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1], delay: i * 0.1 }}
            >
              {text}
            </motion.p>
          ))}
        </div>
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
