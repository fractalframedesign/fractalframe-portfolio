'use client';

import { FolderKanban, Search, User } from 'lucide-react';
import { unstable_rethrow, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  type GuestSearchResult,
  searchGuestsAction,
} from '@/app/(admin)/admin/search-actions';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ADMIN_NAV } from '@/lib/admin-nav';

const DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;

type CommandMenuProps = { projects: { slug: string; name: string }[] };

const pages = ADMIN_NAV.flatMap((group) => group.items).filter(
  (item) => !item.soon,
);

export default function CommandMenu({ projects }: CommandMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [guests, setGuests] = useState<GuestSearchResult[]>([]);
  // Only the latest search may write results; slower earlier ones are ignored
  const latestSearch = useRef(0);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const trimmed = query.trim();

  useEffect(() => {
    const searchId = ++latestSearch.current;
    if (trimmed.length < MIN_QUERY_LENGTH) return;
    const timer = setTimeout(async () => {
      try {
        const results = await searchGuestsAction(trimmed);
        if (searchId === latestSearch.current) setGuests(results);
      } catch (error) {
        unstable_rethrow(error);
        if (searchId === latestSearch.current) setGuests([]);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trimmed]);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setQuery('');
  }, []);

  const go = (href: string) => {
    handleOpenChange(false);
    router.push(href);
  };

  const visibleGuests = trimmed.length < MIN_QUERY_LENGTH ? [] : guests;
  const needle = trimmed.toLowerCase();
  const matches = (text: string) => text.toLowerCase().includes(needle);
  const visiblePages = pages.filter((page) => matches(page.title));
  const visibleProjects = projects.filter(
    (project) => matches(project.name) || matches(project.slug),
  );

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search aria-hidden />
        <span>Search…</span>
        <kbd className="bg-muted hidden rounded px-1.5 font-mono text-xs sm:inline">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Search"
        description="Jump to a page, project or guest."
        shouldFilter={false}
      >
        <CommandInput
          placeholder="Search pages, projects and guests…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {visiblePages.length > 0 && (
            <CommandGroup heading="Pages">
              {visiblePages.map((page) => (
                <CommandItem
                  key={page.href}
                  value={`page-${page.href}`}
                  onSelect={() => go(page.href)}
                >
                  <page.icon aria-hidden />
                  {page.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {visibleProjects.length > 0 && (
            <CommandGroup heading="Projects">
              {visibleProjects.map((project) => (
                <CommandItem
                  key={project.slug}
                  value={`project-${project.slug}`}
                  onSelect={() => go(`/admin/projects#${project.slug}`)}
                >
                  <FolderKanban aria-hidden />
                  {project.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {visibleGuests.length > 0 && (
            <CommandGroup heading="Guests">
              {visibleGuests.map((guest) => (
                <CommandItem
                  key={guest.guestId}
                  value={`guest-${guest.guestId}`}
                  onSelect={() => go(`/admin/guests#guest-${guest.guestId}`)}
                >
                  <User aria-hidden />
                  <span>{guest.name}</span>
                  {guest.email && (
                    <span className="text-muted-foreground truncate">
                      {guest.email}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
