import { cookies } from 'next/headers';

import AppSidebar from '@/components/admin/console/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { countPendingRequests } from '@/lib/access/admin-queries';
import { requireAdmin } from '@/lib/access/require-admin';
import { getDb } from '@/lib/db/client';

async function loadPendingCount(): Promise<number> {
  try {
    return await countPendingRequests(getDb());
  } catch (error) {
    console.error('Pending request count failed to load', error);
    return 0;
  }
}

export default async function ConsoleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  const [pendingRequests, cookieStore] = await Promise.all([
    loadPendingCount(),
    cookies(),
  ]);
  // Remember collapsed/expanded across reloads (cookie set by SidebarProvider)
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar pendingRequests={pendingRequests} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
