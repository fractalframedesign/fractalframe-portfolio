import {
  ChartColumn,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  type LucideIcon,
  Package,
  Settings,
  Users,
} from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  soon?: boolean;
  badge?: 'pendingRequests';
};

export type NavGroup = { label: string; items: NavItem[] };

const OVERVIEW_HREF = '/admin';

/** Admin console sidebar. A new section is one entry here plus one route folder. */
export const ADMIN_NAV: NavGroup[] = [
  {
    label: 'Manage',
    items: [
      { title: 'Overview', href: OVERVIEW_HREF, icon: LayoutDashboard },
      { title: 'Projects', href: '/admin/projects', icon: FolderKanban },
      {
        title: 'Requests',
        href: '/admin/requests',
        icon: Inbox,
        badge: 'pendingRequests',
      },
      { title: 'Guests', href: '/admin/guests', icon: Users },
    ],
  },
  {
    label: 'Coming later',
    items: [
      {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: ChartColumn,
        soon: true,
      },
      { title: 'Products', href: '/admin/products', icon: Package, soon: true },
    ],
  },
  {
    label: 'Account',
    items: [{ title: 'Settings', href: '/admin/settings', icon: Settings }],
  },
];

/** `/admin` matches only itself; other sections match their own subtree. */
export function isActiveNav(pathname: string, href: string): boolean {
  if (href === OVERVIEW_HREF) return pathname === OVERVIEW_HREF;
  return pathname === href || pathname.startsWith(`${href}/`);
}
