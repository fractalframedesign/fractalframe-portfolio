'use client';

import { LogOut, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { logout } from '@/app/(admin)/admin/login/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { ADMIN_NAV, isActiveNav, type NavItem } from '@/lib/admin-nav';

const ADMIN_USER = { name: 'Kiran', initial: 'K' };

type AppSidebarProps = { pendingRequests: number };

export default function AppSidebar({ pendingRequests }: AppSidebarProps) {
  const pathname = usePathname();
  const badges = { pendingRequests };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="Overview">
              <Link href="/admin">
                <span className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
                  <ShieldCheck className="size-4" aria-hidden />
                </span>
                <span className="truncate font-semibold">
                  {ADMIN_USER.name} · Admin
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {ADMIN_NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <NavMenuItem
                    key={item.href}
                    item={item}
                    active={isActiveNav(pathname, item.href)}
                    count={item.badge ? badges[item.badge] : 0}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 px-2 py-1.5 text-sm group-data-[collapsible=icon]:px-0">
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg">
                {ADMIN_USER.initial}
              </AvatarFallback>
            </Avatar>
            <span className="truncate font-medium group-data-[collapsible=icon]:hidden">
              {ADMIN_USER.name}
            </span>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={logout}>
              <SidebarMenuButton type="submit" tooltip="Log out">
                <LogOut aria-hidden />
                <span>Log out</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

type NavMenuItemProps = { item: NavItem; active: boolean; count: number };

function NavMenuItem({ item, active, count }: NavMenuItemProps) {
  const Icon = item.icon;

  if (item.soon) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton aria-disabled tooltip={`${item.title} (soon)`}>
          <Icon aria-hidden />
          <span>{item.title}</span>
        </SidebarMenuButton>
        <SidebarMenuBadge className="text-sidebar-muted-foreground">
          Soon
        </SidebarMenuBadge>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
        <Link href={item.href} aria-current={active ? 'page' : undefined}>
          <Icon aria-hidden />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
      {count > 0 && (
        <SidebarMenuBadge>
          {count}
          <span className="sr-only"> waiting</span>
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}
