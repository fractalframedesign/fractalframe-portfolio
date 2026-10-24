'use client';

import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const AboutCta = () => {
  return (
    <section className="bigger-container pb-12.5 md:pb-15 lg:pb-18.75">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      >
        <Card className="items-center gap-6 px-6 py-12 text-center md:py-15">
          <h2 className="max-w-xl text-2xl leading-snug text-balance">
            See how these principles play out in real products
          </h2>
          <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
            Case studies, components, and experiments, each with the thinking
            behind it.
          </p>
          <Button asChild size="lg">
            <Link href="/projects">
              Explore projects <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </Card>
      </motion.div>
    </section>
  );
};

export default AboutCta;
