'use client';

import { motion } from 'motion/react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Brand = {
  name: string;
  color: string;
  logo: string;
};

const brands: Brand[] = [
  { name: 'Reliance Industries', logo: '/images/brands/ril.svg', color: '#D2AB67' },
  { name: 'Jio Platforms', logo: '/images/brands/jio.svg', color: '#BF0000' },
  { name: 'Rakuten', logo: '/images/brands/rakuten.svg', color: '#BF0000' },
  { name: 'Rakuten Mobile', logo: '/images/brands/rakuten-mobile.svg', color: '#BF0000' },
  { name: 'Sony Music', logo: '/images/brands/sony-music.svg', color: '#FF0000' },
  { name: 'Times Music', logo: '/images/brands/times-music.svg', color: '#EA048A' },
];

const doubled = [...brands, ...brands];

export function BrandsScroll() {
  return (
    <section className="section-padding bigger-container space-y-10">
      <motion.h2
        className="container text-2xl leading-none"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        Brands I&apos;ve worked with
      </motion.h2>

      <div className="relative overflow-hidden">
        <div className="from-background pointer-events-none absolute top-0 left-0 z-10 h-full w-20 bg-linear-to-r to-transparent" />
        <div className="from-background pointer-events-none absolute top-0 right-0 z-10 h-full w-20 bg-linear-to-l to-transparent" />

        <motion.ul
          className="flex gap-4"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
        >
          {doubled.map((brand, i) => (
            <Tooltip key={`${brand.name}-${i}`}>
              <TooltipTrigger asChild>
                <motion.li
                  className="group bg-muted flex h-25 w-44 shrink-0 cursor-default list-none items-center justify-center rounded-3xl p-5"
                  style={{ '--brand-color': brand.color } as React.CSSProperties}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-10 w-auto max-w-30 object-contain grayscale opacity-60 dark:invert transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 dark:group-hover:invert-0"
                  />
                </motion.li>
              </TooltipTrigger>
              <TooltipContent side="bottom">{brand.name}</TooltipContent>
            </Tooltip>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
