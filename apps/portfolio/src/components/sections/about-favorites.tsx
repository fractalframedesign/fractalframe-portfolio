'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

const IMAGE_WIDTH = 280;
const IMAGE_HEIGHT = 180;
const IMAGE_GAP_X = 100;
const IMAGE_GAP_Y = 40;

const FAVORITES = [
  {
    title: 'Favorite movies',
    items: [
      { name: 'F1', image: '/images/about/movies/f1.webp' },
      { name: 'Home Alone', image: '/images/about/movies/home-alone.webp' },
      {
        name: 'Mission Impossible Franchise',
        image: '/images/about/movies/mission-impossible.webp',
      },
      { name: 'Rain Man', image: '/images/about/movies/rain-man.webp' },
      {
        name: 'Top Gun Maverick',
        image: '/images/about/movies/top-gun-maverick.webp',
      },
      {
        name: 'The Shawshank Redemption',
        image: '/images/about/movies/shawshank-redemption.webp',
      },
    ],
  },
  {
    title: 'Favorite cars',
    items: [
      {
        name: 'Nissan Skyline GT-R',
        image: '/images/about/cars/nissan-skyline.webp',
      },
      {
        name: 'Honda Civic Type-R',
        image: '/images/about/cars/honda-civic.webp',
      },
      { name: 'Audi R8', image: '/images/about/cars/audi-r8.webp' },
      { name: 'BMW M5', image: '/images/about/cars/bmw-m5.webp' },
      { name: 'Xiaomi SU7', image: '/images/about/cars/xiaomi-su7.webp' },
      {
        name: 'Mercedes-Benz S-Class',
        image: '/images/about/cars/mercedes-s-class.webp',
      },
    ],
  },
];

type FavoriteItem = { name: string; image: string };

const FavoriteSection = ({
  title,
  items,
}: {
  title: string;
  items: FavoriteItem[];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { isAtMost } = useMediaQuery();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const getImageOffset = (e: React.MouseEvent) => {
    if (!containerRef.current || !listRef.current) return { x: 0, y: 0 };

    const containerRect = containerRef.current.getBoundingClientRect();
    const listRect = listRef.current.getBoundingClientRect();

    const mouseXInContainer = e.clientX - containerRect.left;
    const mouseYInContainer = e.clientY - containerRect.top;

    const isMobile = isAtMost('md');
    const cursorXInList = e.clientX - listRect.left;
    const isRightHalf = cursorXInList > listRect.width / 2;

    // On mobile, center image above the hovered item
    if (isMobile) {
      const itemRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const itemCenterX =
        itemRect.left + itemRect.width / 2 - containerRect.left;
      return {
        x: itemCenterX - IMAGE_WIDTH / 2,
        y: mouseYInContainer - IMAGE_HEIGHT - IMAGE_GAP_Y,
      };
    } else if (isRightHalf) {
      return {
        x: mouseXInContainer - IMAGE_WIDTH / 2,
        y: mouseYInContainer - IMAGE_HEIGHT - IMAGE_GAP_Y,
      };
    } else {
      return {
        x: mouseXInContainer + IMAGE_GAP_X,
        y: mouseYInContainer - IMAGE_HEIGHT / 2,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const offset = getImageOffset(e);
    mouseX.set(offset.x);
    mouseY.set(offset.y);
  };

  const handleMouseEnter = (e: React.MouseEvent, index: number) => {
    setActiveIndex(index);
    const offset = getImageOffset(e);
    mouseX.set(offset.x);
    mouseY.set(offset.y);
    x.jump(offset.x);
    y.jump(offset.y);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative grid gap-10 select-none md:grid-cols-2 md:gap-20"
    >
      <h2 className="text-2xl">{title}</h2>

      <ul ref={listRef} className="space-y-4">
        {items.map((item, index) => (
          <motion.li
            key={item.name}
            className={cn(
              'link-underline cursor-pointer text-lg leading-none transition-opacity duration-300',
              activeIndex !== null && activeIndex !== index && 'opacity-40',
            )}
            whileHover={{ x: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onMouseEnter={(e) => handleMouseEnter(e, index)}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          >
            {item.name}
          </motion.li>
        ))}
      </ul>

      {/* Floating image with premium blur effect */}
      <motion.div
        className="pointer-events-none absolute z-50 overflow-hidden rounded-lg shadow-2xl"
        style={{
          width: IMAGE_WIDTH,
          height: IMAGE_HEIGHT,
          x,
          y,
        }}
        initial={{ scale: 0.95, opacity: 0, filter: 'blur(10px)' }}
        animate={{
          scale: activeIndex !== null ? 1 : 0.95,
          opacity: activeIndex !== null ? 1 : 0,
          filter: activeIndex !== null ? 'blur(0px)' : 'blur(10px)',
        }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.name}
            className="absolute inset-0"
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{
              opacity: activeIndex === index ? 1 : 0,
              filter: activeIndex === index ? 'blur(0px)' : 'blur(8px)',
            }}
            transition={{ duration: 0.25 }}
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="280px"
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const AboutFavorites = () => {
  return (
    <section className="section-padding container space-y-15 md:space-y-20">
      {FAVORITES.map((favorite) => (
        <FavoriteSection
          key={favorite.title}
          title={favorite.title}
          items={favorite.items}
        />
      ))}
    </section>
  );
};

export default AboutFavorites;
