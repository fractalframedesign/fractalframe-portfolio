import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

import ThemeToggle from './theme-toggle';

type TopBarProps = { title: string };

export default function TopBar({ title }: TopBarProps) {
  return (
    <header className="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-1 data-[orientation=vertical]:h-4"
      />
      <h1 className="truncate text-base font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        {/* Placeholder until the ⌘K command menu lands */}
        <Button
          variant="outline"
          size="sm"
          disabled
          className="text-muted-foreground"
        >
          <Search aria-hidden />
          <span className="sr-only sm:not-sr-only">Search</span>
          <kbd className="bg-muted hidden rounded px-1.5 font-mono text-xs sm:inline">
            ⌘K
          </kbd>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
