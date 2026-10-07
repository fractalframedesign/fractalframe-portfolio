'use client';

import { motion } from 'motion/react';

import { Principles } from '@/components/sections/principles';

const STORY_PARAGRAPHS = [
  "I'm Kiran, a Digital Product Designer based in Tokyo, known for integrating design, frontend engineering, and product strategy to create seamless user experiences for over 15 years.",
  'I lead Digital Product Design at Rakuten, focusing on design systems and workflows that let design and engineering scale together. Before Rakuten, I designed large-scale digital experiences for hundreds of millions of users at Reliance Jio. That taught me that great design relies on strong systems, close teamwork, and consistent execution.',
  'My work bridges design craftsmanship, frontend development, and AI. What sets me apart is my ability to translate complex ideas into products that are not only functional but so intuitive that the right choice feels obvious.',
];

const About = () => {
  return (
    <section className="section-padding bigger-container space-y-11 pt-15! md:space-y-21 md:pt-20! lg:pt-30!">
      <div className="space-y-10 md:container">
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

      <Principles />
    </section>
  );
};

export default About;
