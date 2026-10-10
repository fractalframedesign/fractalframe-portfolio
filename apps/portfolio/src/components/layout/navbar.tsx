'use client';

import { usePathname } from 'next/navigation';

import { SiteHeader } from '@/components/layout/site-header';
import { ThemeToggle } from '@/components/theme-toggle';

const Navbar = () => {
  const pathname = usePathname();

  return (
    <SiteHeader
      activePath={pathname}
      themeToggle={<ThemeToggle />}
      className="fixed top-0 right-0 left-0"
    />
  );
};

export default Navbar;
