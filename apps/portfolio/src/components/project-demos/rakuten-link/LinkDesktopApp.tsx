'use client';

import { MessagesSquare, Phone, Search } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { CallScreen } from './CallScreen';
import { ChatThread } from './ChatThread';
import { ConversationList } from './ConversationList';
import { contactById, CONVERSATIONS } from './data';

/** Rakuten Link Desktop: a window with the conversation list beside the open chat */
export function LinkDesktopApp() {
  const [activeId, setActiveId] = useState(CONVERSATIONS[0].contactId);
  const [calling, setCalling] = useState(false);

  const contact = contactById(activeId);
  const days = CONVERSATIONS.find((c) => c.contactId === activeId)?.days ?? [];

  return (
    <div className="bg-surface border-surface-border mx-auto flex h-155 scheme-light w-full max-w-5xl flex-col overflow-hidden rounded-2xl border shadow-2xl">
      {/* Window title bar */}
      <div
        className="bg-canvas border-surface-border flex h-9 shrink-0 items-center gap-2 border-b px-4"
        aria-hidden="true"
      >
        <span className="bg-destructive/70 size-3 rounded-full" />
        <span className="bg-ink-muted/40 size-3 rounded-full" />
        <span className="bg-ink-muted/40 size-3 rounded-full" />
        <span className="text-ink-muted flex-1 text-center text-xs">
          Rakuten Link
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Rail */}
        <nav
          aria-label="Sections"
          className="bg-ink flex w-16 shrink-0 flex-col items-center gap-2 py-4"
        >
          <span
            className="text-accent-1 mb-4 text-xs font-bold"
            aria-hidden="true"
          >
            Link
          </span>
          {[
            { label: 'Messages', icon: MessagesSquare, active: true },
            { label: 'Calls', icon: Phone, active: false },
          ].map(({ label, icon: Icon, active }) => (
            <span
              key={label}
              title={label}
              className={cn(
                'flex size-11 items-center justify-center rounded-xl',
                active ? 'bg-white/15 text-white' : 'text-white/60',
              )}
            >
              <Icon aria-hidden="true" className="size-5" />
              <span className="sr-only">{label}</span>
            </span>
          ))}
        </nav>

        {/* Conversation list */}
        <aside className="border-surface-border flex w-72 shrink-0 flex-col border-e max-md:hidden">
          <div className="p-3">
            <label className="bg-canvas text-ink-muted flex items-center gap-2 rounded-lg px-3 py-2">
              <Search aria-hidden="true" className="size-4" />
              <input
                aria-label="Search messages"
                placeholder="Search"
                className="text-ink min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ConversationList
              conversations={CONVERSATIONS}
              activeId={activeId}
              onOpen={setActiveId}
            />
          </div>
        </aside>

        {/* Open chat */}
        <section
          aria-label={`Chat with ${contact.name}`}
          className="relative flex min-w-0 flex-1 flex-col"
        >
          <header className="border-surface-border flex h-14 shrink-0 items-center justify-between border-b px-5">
            <h2 className="text-ink font-bold">
              {contact.name}
              {!contact.onLink && (
                <span className="text-ink-muted ms-2 text-xs font-normal">
                  SMS
                </span>
              )}
            </h2>
            <button
              type="button"
              aria-label={`Call ${contact.name}`}
              onClick={() => setCalling(true)}
              className="text-accent-1 focus-visible:ring-accent-1 flex size-10 items-center justify-center rounded-full outline-none focus-visible:ring-2"
            >
              <Phone aria-hidden="true" className="size-5 fill-current" />
            </button>
          </header>
          <ChatThread key={contact.id} contact={contact} days={days} />
          {calling && (
            <CallScreen
              name={contact.name}
              phone={contact.phone}
              onEnd={() => setCalling(false)}
            />
          )}
        </section>
      </div>
    </div>
  );
}
