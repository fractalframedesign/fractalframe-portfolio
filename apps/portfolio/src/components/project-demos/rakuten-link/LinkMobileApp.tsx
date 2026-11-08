'use client';

import {
  BatteryFull,
  ChevronLeft,
  House,
  MessagesSquare,
  MoreHorizontal,
  Phone,
  Signal,
  Smartphone,
  Wallet,
  Wifi,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/components/project-demos/rakuten-link/lib/utils';

import { CallScreen } from './CallScreen';
import { CallsScreen } from './CallsScreen';
import { ChatThread } from './ChatThread';
import { ConversationList } from './ConversationList';
import { type Contact, contactById, CONVERSATIONS } from './data';
import { Dialer } from './Dialer';

type Tab = 'messages' | 'calls' | 'home' | 'raku' | 'wallet';

const TABS: { id: Tab; label: string; icon: typeof Phone }[] = [
  { id: 'messages', label: 'Messages', icon: MessagesSquare },
  { id: 'calls', label: 'Calls', icon: Phone },
  { id: 'home', label: 'Home', icon: House },
  { id: 'raku', label: 'my RakuMoba', icon: Smartphone },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
];

const unreadTotal = CONVERSATIONS.reduce((sum, c) => sum + (c.unread ?? 0), 0);

const StatusBar = ({ dark = false }: { dark?: boolean }) => (
  <div
    aria-hidden="true"
    className={cn(
      'flex h-11 shrink-0 items-center justify-between px-7 text-sm font-semibold',
      dark ? 'text-white' : 'text-ink',
    )}
  >
    <span>9:41</span>
    <span className="flex items-center gap-2">
      <Signal className="size-4" />
      <Wifi className="size-4" />
      <BatteryFull className="size-5" />
    </span>
  </div>
);

const TabBar = ({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (tab: Tab) => void;
}) => (
  <nav className="bg-surface border-surface-border shrink-0 border-t pb-5">
    <div role="tablist" aria-label="Rakuten Link" className="grid grid-cols-5">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={tab === id}
          onClick={() => onChange(id)}
          className={cn(
            'focus-visible:ring-accent-1 relative flex flex-col items-center gap-1 pt-2 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-inset',
            tab === id ? 'text-ink' : 'text-ink-muted',
          )}
        >
          <Icon
            aria-hidden="true"
            className={cn(
              'size-6',
              tab === id && id !== 'home' && 'fill-current',
            )}
          />
          {label}
          {id === 'messages' && unreadTotal > 0 && (
            <span className="bg-accent-1 absolute top-1 left-1/2 ms-1 rounded-full px-2 text-xs leading-4 text-white">
              {unreadTotal}
              <span className="sr-only"> unread</span>
            </span>
          )}
        </button>
      ))}
    </div>
  </nav>
);

/** The other tabs exist in the app but aren't part of this demo */
const PlaceholderTab = ({ label }: { label: string }) => (
  <div className="text-ink-muted flex flex-1 flex-col items-center justify-center gap-2 px-10 text-center">
    <p className="text-ink font-semibold">{label}</p>
    <p className="text-sm">Not part of this demo. Try Calls or Messages.</p>
  </div>
);

/** Rakuten Link on a phone: Calls, Messages, keypad, calling and voice messages */
export function LinkMobileApp({
  skipSplash = false,
}: {
  skipSplash?: boolean;
}) {
  const [splash, setSplash] = useState(!skipSplash);
  const [tab, setTab] = useState<Tab>('calls');
  const [chatId, setChatId] = useState<string | null>(null);
  const [keypad, setKeypad] = useState(false);
  const [call, setCall] = useState<{ name: string; phone: string } | null>(
    null,
  );

  useEffect(() => {
    if (!splash) return;
    const done = setTimeout(() => setSplash(false), 1200);
    return () => clearTimeout(done);
  }, [splash]);

  const startCall = (contact: Pick<Contact, 'name' | 'phone'>) => {
    setKeypad(false);
    setCall({ name: contact.name, phone: contact.phone });
  };

  const chatContact = chatId ? contactById(chatId) : null;
  const chatDays =
    CONVERSATIONS.find((c) => c.contactId === chatId)?.days ?? [];

  return (
    <div className="bg-surface border-ink relative mx-auto flex h-190 scheme-light w-full max-w-95 flex-col overflow-hidden rounded-[3rem] border-[10px] shadow-2xl">
      {splash ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-accent-1 text-3xl font-bold tracking-tight">
            Rakuten Link
          </p>
        </div>
      ) : (
        <>
          <StatusBar />
          {chatContact ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <header className="bg-surface border-surface-border flex h-14 shrink-0 items-center gap-2 border-b px-2">
                <button
                  type="button"
                  aria-label="Back"
                  onClick={() => setChatId(null)}
                  className="text-ink p-2"
                >
                  <ChevronLeft aria-hidden="true" className="size-6" />
                </button>
                <h2 className="text-ink min-w-0 flex-1 truncate text-lg font-bold">
                  {chatContact.name}
                  {!chatContact.onLink && (
                    <span className="text-ink-muted block text-xs font-normal">
                      SMS
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  aria-label={`Call ${chatContact.name}`}
                  onClick={() => startCall(chatContact)}
                  className="text-ink p-2"
                >
                  <Phone aria-hidden="true" className="size-5" />
                </button>
                <MoreHorizontal
                  aria-hidden="true"
                  className="text-ink me-2 size-6"
                />
              </header>
              <ChatThread contact={chatContact} days={chatDays} />
            </div>
          ) : (
            <>
              {tab === 'calls' && (
                <CallsScreen
                  onCall={startCall}
                  onOpenKeypad={() => setKeypad(true)}
                />
              )}
              {tab === 'messages' && (
                <div className="bg-surface min-h-0 flex-1 overflow-y-auto">
                  <h2 className="text-ink flex h-14 items-center justify-center text-lg font-semibold">
                    Messages
                  </h2>
                  <ConversationList
                    conversations={CONVERSATIONS}
                    onOpen={setChatId}
                  />
                </div>
              )}
              {tab !== 'calls' && tab !== 'messages' && (
                <PlaceholderTab
                  label={TABS.find((t) => t.id === tab)?.label ?? ''}
                />
              )}
              <TabBar tab={tab} onChange={setTab} />
            </>
          )}
          {keypad && (
            <Dialer
              onClose={() => setKeypad(false)}
              onCall={(number) => startCall({ name: number, phone: number })}
            />
          )}
          {call && (
            <CallScreen
              name={call.name}
              phone={call.phone}
              onEnd={() => setCall(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
