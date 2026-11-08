"use client";

import {
  GalleryVerticalEnd,
  House,
  type LucideIcon,
  PencilLine,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { KiranLogoIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const siteLinks: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/", label: "Home", icon: House },
  { href: "/projects", label: "Projects", icon: GalleryVerticalEnd },
  { href: "/about", label: "Profile", icon: UserRound },
  { href: "/articles", label: "Stories", icon: PencilLine },
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
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      // 40px tall and pill-shaped, matching the buttons on the right of the bar
      className="group h-10 rounded-full px-3 sm:px-4"
    >
      <Link
        href={link.href}
        aria-label={link.label}
        aria-current={isActive ? "page" : undefined}
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
  /** Width and side padding of the inner row; match it to the page content below */
  widthClassName?: string;
};

/**
 * The header bar shared by the portfolio (desktop) and the showcase, so both
 * always look the same: name and links on the left, theme toggle on the right.
 */
export function SiteHeader({
  activePath,
  themeToggle,
  className,
  widthClassName = "max-w-7xl px-4 md:px-8",
}: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "bg-background/80 border-border z-50 border-b backdrop-blur",
        className,
      )}
    >
      <nav
        aria-label="Main"
        className={cn(
          // Three columns so the links sit in the true centre
          "mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-3 md:gap-4",
          widthClassName,
        )}
      >
        <Link
          href="/"
          // The name is hidden on phones, so the link needs its own label
          aria-label="Kiran Pingle, home"
          className="focus-visible:ring-ring/50 flex shrink-0 items-center gap-3 justify-self-start rounded-lg font-medium outline-none focus-visible:ring-[3px]"
        >
          <KiranLogoIcon
            aria-hidden="true"
            className="text-logo size-9 shrink-0"
          />
          <span className="hidden flex-col whitespace-nowrap sm:flex">
            <span className="text-sm leading-tight font-bold">
              Kiran Pingle
            </span>
            <span className="text-muted-foreground text-xs leading-tight">
              Product Designer
            </span>
          </span>
        </Link>

        <ul className="flex items-center gap-2 sm:gap-1">
          {siteLinks.map((link) => {
            const isActive =
              activePath === link.href ||
              activePath.startsWith(`${link.href}/`);
            return (
              <li key={link.href}>
                <NavLink link={link} isActive={isActive} />
              </li>
            );
          })}
        </ul>

        <div className="shrink-0 justify-self-end">{themeToggle}</div>
      </nav>
    </header>
  );
}
