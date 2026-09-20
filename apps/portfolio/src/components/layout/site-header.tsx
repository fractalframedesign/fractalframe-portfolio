'use client';

import { GalleryVerticalEnd, type LucideIcon, PencilLine, UserRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const siteLinks: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: '/projects', label: 'Projects', icon: GalleryVerticalEnd },
  { href: '/about', label: 'Profile', icon: UserRound },
  { href: '/articles', label: 'Articles', icon: PencilLine },
];

type NavLinkProps = {
  link: (typeof siteLinks)[number];
  isActive: boolean;
};

/** Link with an icon that fills in on hover or keyboard focus. Labels hide on phones. */
function NavLink({ link, isActive }: NavLinkProps) {
  const Icon = link.icon;

  return (
    <Button
      asChild
      variant={isActive ? 'secondary' : 'ghost'}
      size="sm"
      className="group max-sm:px-2.5"
    >
      <Link
        href={link.href}
        aria-label={link.label}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon
          aria-hidden="true"
          className="transition-[fill] duration-200 group-hover:fill-current group-focus-visible:fill-current"
        />
        <span className="max-sm:sr-only">{link.label}</span>
      </Link>
    </Button>
  );
}

type SiteHeaderProps = {
  /** Current path, used to highlight the active link */
  activePath: string;
  themeToggle: React.ReactNode;
  className?: string;
};

/**
 * The header bar shared by the portfolio (desktop) and the showcase, so both
 * always look the same: name and links on the left, theme toggle on the right.
 */
export function SiteHeader({
  activePath,
  themeToggle,
  className,
}: SiteHeaderProps) {
  return (
    <header
      className={cn(
        'bg-background/80 border-border z-50 border-b backdrop-blur',
        className,
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 md:gap-4 md:px-8"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 font-medium"
        >
          <span className="relative size-9 shrink-0 overflow-hidden rounded-full">
            <Image
              src="/images/home/avatar-sm.png"
              alt="Kiran Pingle"
              fill
              unoptimized
              className="object-cover"
            />
          </span>
          <span className="hidden text-sm whitespace-nowrap sm:inline">
            Kiran Pingle
          </span>
        </Link>

        <ul className="flex items-center gap-0.5 sm:gap-1">
          {siteLinks.map((link) => {
            const isActive =
              activePath === link.href || activePath.startsWith(`${link.href}/`);
            return (
              <li key={link.href}>
                <NavLink link={link} isActive={isActive} />
              </li>
            );
          })}
        </ul>

        <div className="ml-auto shrink-0">{themeToggle}</div>
      </nav>
    </header>
  );
}
