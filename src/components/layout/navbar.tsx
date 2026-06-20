'use client';

import {
  GalleryVerticalEnd,
  Home,
  type LucideIcon,
  PencilLine,
  UserRound,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// import { GitHubIcon, XIcon } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

const MotionLink = motion.create(Link);

const navItems: Array<{
  href: string;
  icon: LucideIcon;
  label: string;
  ariaLabel: string;
}> = [
  { href: '/', icon: Home, label: 'Home', ariaLabel: 'Home' },
  {
    href: '/projects',
    icon: GalleryVerticalEnd,
    label: 'Projects',
    ariaLabel: 'Projects',
  },
  { href: '/about', icon: UserRound, label: 'Profile', ariaLabel: 'Profile' },
  {
    href: '/articles',
    icon: PencilLine,
    label: 'Articles',
    ariaLabel: 'Articles',
  },
];

const liquidSpring = { type: 'spring', stiffness: 280, damping: 26, mass: 0.9 } as const;
const tapSpring = { type: 'spring', stiffness: 400, damping: 20 } as const;

const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto  min-w-screen">
      {/* Ambient glow behind pills */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 100% at 50% 0%, color-mix(in oklch, var(--background) 80%, transparent) 0%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
        }}
      />
      <nav className="container relative w-full flex items-center justify-center py-2 md:mt-4 md:pb-6 md:justify-center md:gap-6  ">
        {/* Left — nav items */}
        <motion.div layoutRoot className="glass-pill flex items-center gap-1 rounded-full p-1 md:p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <MotionLink
                key={item.href}
                href={item.href}
                aria-label={item.ariaLabel}
                className="relative flex items-center rounded-full p-3 outline-none hover:bg-black/5 active:bg-black/10"
                whileTap={{ scale: 0.95 }}
                transition={tapSpring}
              >
                {/* Liquid blob — slides between items */}
                {isActive && (
                  <motion.span
                    key={pathname}
                    className="absolute inset-0 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      background:
                        'color-mix(in oklch, var(--foreground) 12%, transparent)',
                      boxShadow:
                        'inset 0 1px 0 color-mix(in oklch, var(--foreground) 15%, transparent), inset 0 -1px 0 color-mix(in oklch, var(--foreground) 8%, transparent)',
                    }}
                    transition={liquidSpring}
                  />
                )}

                {/* Icon */}
                <span className="relative z-10 flex items-center">
                  <Icon className="size-4 shrink-0" />

                  {/* Label expands on active */}
                  <motion.span
                    animate={{
                      maxWidth: isActive ? 72 : 0,
                      opacity: isActive ? 1 : 0,
                      marginLeft: isActive ? 8 : 0,
                    }}
                    transition={liquidSpring}
                    className="overflow-hidden text-sm leading-none font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                </span>
              </MotionLink>
            );
          })}
            <ThemeToggle />
        </motion.div>
      </nav>
    </header>
  );
};

export default Navbar;
