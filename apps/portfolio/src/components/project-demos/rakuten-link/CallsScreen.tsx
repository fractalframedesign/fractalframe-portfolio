'use client';

import {
  Grid3x3,
  Phone,
  Plus,
  Search,
  Star,
  UserPlus,
  Voicemail,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/components/project-demos/rakuten-link/lib/utils';

import { Avatar } from './Avatar';
import { type Contact, CONTACTS, GROUPS } from './data';

const SectionHeader = ({
  title,
  action,
}: {
  title: React.ReactNode;
  action?: string;
}) => (
  <div className="flex items-center justify-between px-4 pt-5 pb-3">
    <h3 className="text-ink text-lg font-bold">{title}</h3>
    {action && <span className="text-accent-2 text-sm">{action}</span>}
  </div>
);

/** Calls tab: favourites, contact groups and the All / Link contact list */
export function CallsScreen({
  onCall,
  onOpenKeypad,
}: {
  onCall: (contact: Contact) => void;
  onOpenKeypad: () => void;
}) {
  const [filter, setFilter] = useState<'all' | 'link'>('all');
  const [query, setQuery] = useState('');

  const contacts = CONTACTS.filter(
    (c) =>
      (filter === 'all' || c.onLink) &&
      c.name.toLowerCase().includes(query.toLowerCase()),
  ).sort((a, b) => a.name.localeCompare(b.name));
  const letters = [...new Set(contacts.map((c) => c.name[0]))];

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <header className="bg-surface px-4 pt-2 pb-3">
        <div className="relative flex h-11 items-center justify-center">
          <h2 className="text-ink text-lg font-semibold">Calls</h2>
          <span className="text-accent-2 absolute end-0 flex gap-4">
            <Voicemail aria-label="Voicemail" className="size-6" />
            <UserPlus aria-label="Add contact" className="size-6" />
          </span>
        </div>
        <label className="bg-canvas text-ink-muted mt-2 flex items-center gap-2 rounded-xl px-3 py-2">
          <Search aria-hidden="true" className="size-4" />
          <input
            aria-label="Search contacts"
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="text-ink placeholder:text-ink-muted min-w-0 flex-1 bg-transparent text-base outline-none"
          />
        </label>
      </header>

      <div className="bg-surface min-h-0 flex-1 overflow-y-auto pb-24">
        {!query && (
          <>
            <SectionHeader
              title={
                <span className="flex items-center gap-2">
                  <Star aria-hidden="true" className="fill-ink size-4" />{' '}
                  Favorite
                </span>
              }
              action="View all"
            />
            <ul className="flex gap-4 overflow-x-auto px-4">
              {CONTACTS.filter((c) => c.favorite).map((c) => (
                <li key={c.id} className="w-16 shrink-0 text-center">
                  <Avatar name={c.name} size="lg" />
                  <span className="text-ink mt-1 block truncate text-xs">
                    {c.name.split(' ')[0]}
                  </span>
                </li>
              ))}
            </ul>

            <SectionHeader title="Contact group" action="View all" />
            <ul className="flex gap-4 overflow-x-auto px-4">
              {GROUPS.map((g) => (
                <li key={g.name} className="w-16 shrink-0 text-center">
                  <span className="bg-accent-2-soft text-ink-muted flex size-16 items-center justify-center rounded-full">
                    <UserPlus aria-hidden="true" className="size-6" />
                  </span>
                  <span className="text-ink mt-1 block truncate text-xs">
                    {g.name}
                  </span>
                  <span className="text-ink-muted block text-xs">
                    ({g.count})
                  </span>
                </li>
              ))}
              <li className="w-16 shrink-0 text-center">
                <span className="border-ink-muted/40 text-ink-muted flex size-16 items-center justify-center rounded-full border">
                  <Plus aria-hidden="true" className="size-6" />
                </span>
                <span className="text-ink mt-1 block text-xs">Create</span>
              </li>
            </ul>
          </>
        )}

        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <h3 className="text-ink text-lg font-bold">
            Contacts ({contacts.length})
          </h3>
          <div role="tablist" aria-label="Show contacts" className="flex gap-4">
            {(['all', 'link'] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={filter === value}
                onClick={() => setFilter(value)}
                className={cn(
                  'text-lg',
                  filter === value ? 'text-ink font-bold' : 'text-ink-muted',
                )}
              >
                {value === 'all' ? 'All' : 'Link'}
              </button>
            ))}
          </div>
        </div>

        {letters.map((letter) => (
          <section key={letter} aria-label={letter}>
            <p className="bg-canvas text-ink-muted px-4 py-1 text-sm">
              {letter}
            </p>
            <ul>
              {contacts
                .filter((c) => c.name[0] === letter)
                .map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <Avatar name={c.name} onLink={c.onLink} />
                    <span className="text-ink flex-1 truncate text-base">
                      {c.name}
                    </span>
                    <button
                      type="button"
                      aria-label={`Call ${c.name}`}
                      onClick={() => onCall(c)}
                      className="text-accent-1 focus-visible:ring-accent-1 flex size-10 items-center justify-center rounded-full outline-none focus-visible:ring-2"
                    >
                      <Phone
                        aria-hidden="true"
                        className="size-5 fill-current"
                      />
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>

      <button
        type="button"
        aria-label="Open keypad"
        onClick={onOpenKeypad}
        className="bg-accent-2 focus-visible:ring-accent-2 absolute end-4 bottom-4 flex size-16 items-center justify-center rounded-full text-white shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <Grid3x3 aria-hidden="true" className="size-7" />
      </button>
    </div>
  );
}
