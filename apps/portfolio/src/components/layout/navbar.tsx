'use client';

import {
  GalleryVerticalEnd,
  Home,
  type LucideIcon,
  PencilLine,
  UserRound,
} from 'lucide-react';
import { LayoutGroup, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ThemeToggle } from '@/components/theme-toggle';

const MotionLink = motion.create(Link);

const navItems: Array<{
  href: string;
  icon: LucideIcon;
  label: string;
  ariaLabel: string;
}> = [
  { href: '/', icon: Home, label: 'Home', ariaLabel: 'Home' },
  { href: '/projects', icon: GalleryVerticalEnd, label: 'Projects', ariaLabel: 'Projects' },
  { href: '/about', icon: UserRound, label: 'Profile', ariaLabel: 'Profile' },
  { href: '/articles', icon: PencilLine, label: 'Articles', ariaLabel: 'Articles' },
];

const spring = { type: 'spring', stiffness: 300, damping: 28, mass: 0.8 } as const;

const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto min-w-screen">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 100% at 50% 0%, color-mix(in oklch, var(--background) 80%, transparent) 0%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
        }}
      />
      <nav className="container relative flex w-full items-center justify-center py-2 md:mt-4 md:pb-6">
        <LayoutGroup id="navbar">
          <div className="glass-pill flex items-center gap-1 rounded-full p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <MotionLink
                  key={item.href}
                  href={item.href}
                  aria-label={item.ariaLabel}
                  className="relative rounded-full outline-none"
                  whileTap={{ scale: 0.94 }}
                  transition={spring}
                >
                  {/* Pill indicator — FLIP animates position+size via layoutId */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'color-mix(in oklch, var(--foreground) 12%, transparent)',
                        boxShadow:
                          'inset 0 1px 0 color-mix(in oklch, var(--foreground) 15%, transparent)',
                      }}
                      transition={spring}
                    />
                  )}

                  {/* Content: icon always shown, label fades in alongside pill */}
                  <span className="relative z-10 flex items-center gap-2 px-3 py-2.5">
                    <motion.span
                      animate={{ opacity: isActive ? 1 : 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="size-4 shrink-0" />
                    </motion.span>

                    {/* Label: overflow-hidden clip — no layout change, width is CSS not animated */}
                    <span
                      className="overflow-hidden text-sm leading-none font-medium whitespace-nowrap transition-[max-width,opacity] duration-300 ease-out"
                      style={{
                        maxWidth: isActive ? '5rem' : '0px',
                        opacity: isActive ? 1 : 0,
                      }}
                    >
                      {item.label}
                    </span>
                  </span>
                </MotionLink>
              );
            })}
            <ThemeToggle />
          </div>
        </LayoutGroup>
      </nav>
    </header>
  );
};

export default Navbar;
