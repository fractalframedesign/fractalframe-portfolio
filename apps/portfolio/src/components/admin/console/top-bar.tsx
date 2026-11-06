import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { getAllProjects } from '@/lib/projects';

import CommandMenu from './command-menu';
import ThemeToggle from './theme-toggle';

type TopBarProps = { title: string };

export default async function TopBar({ title }: TopBarProps) {
  const projects = (await getAllProjects()).map(({ slug, name }) => ({
    slug,
    name,
  }));

  return (
    <header className="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-1 data-[orientation=vertical]:h-4"
      />
      <h1 className="truncate text-base font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <CommandMenu projects={projects} />
        <ThemeToggle />
      </div>
    </header>
  );
}
