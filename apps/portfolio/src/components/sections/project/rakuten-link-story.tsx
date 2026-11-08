'use client';

import '@/components/project-demos/rakuten-link/theme.css';

import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCheck,
  ChevronLeft,
  Clock,
  CreditCard,
  Info,
  Mail,
  MapPin,
  MessageSquareWarning,
  MoreHorizontal,
  Plus,
  RotateCw,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { Avatar } from '@/components/project-demos/rakuten-link/Avatar';
import { CallScreen } from '@/components/project-demos/rakuten-link/CallScreen';
import { ChatThread } from '@/components/project-demos/rakuten-link/ChatThread';
import { ConversationList } from '@/components/project-demos/rakuten-link/ConversationList';
import {
  contactById,
  CONVERSATIONS,
} from '@/components/project-demos/rakuten-link/data';
import { Dialer } from '@/components/project-demos/rakuten-link/Dialer';
import { linkFonts } from '@/components/project-demos/rakuten-link/fonts';
import { LinkDesktopApp } from '@/components/project-demos/rakuten-link/LinkDesktopApp';
import { LinkMobileApp } from '@/components/project-demos/rakuten-link/LinkMobileApp';
import { cn } from '@/lib/utils';

import RakutenLinkProcess from './rakuten-link-process';

// Rakuten Mobile foundation colours
const SWATCHES = [
  { label: 'Pink', role: 'Primary', hex: '#FF008C' },
  {
    label: 'Blue',
    role: 'Ground',
    hex: '#000033',
  },
  {
    label: 'UI blue',
    role: 'Functional',
    hex: '#3B3BA3',
  },
  {
    label: 'Yellow',
    role: 'Accent',
    hex: '#FFD900',
  },
  {
    label: 'Purple',
    role: 'Accent',
    hex: '#5C00CC',
  },
  {
    label: 'Link blue',
    role: 'Links',
    hex: '#007ACC',
  },
];

const ICONS = [
  ChevronLeft,
  ArrowLeft,
  X,
  Check,
  Plus,
  UserRound,
  Mail,
  Info,
  MapPin,
  CreditCard,
  Calendar,
  MessageSquareWarning,
  ShoppingCart,
  MoreHorizontal,
];

const DISPLAY = 'font-(family-name:--font-link-display)';

const noop = () => {};

/** A full-screen phone component at real phone size, scaled to fit a bento cell */
const PhoneScale = ({ children }: { children: ReactNode }) => (
  <div className="relative m-auto h-143 w-71 shrink-0">
    <div className="bg-card absolute top-0 left-0 h-190 w-95 origin-top-left scale-75 overflow-hidden rounded-[2rem]">
      {children}
    </div>
  </div>
);

const Bubble = ({
  mine = true,
  children,
  className,
}: {
  mine?: boolean;
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      'text-foreground max-w-[70%] rounded-2xl px-3 py-2 text-sm',
      mine ? 'bg-chart-2 self-end' : 'bg-card self-start',
      className,
    )}
  >
    {children}
  </span>
);

const Meta = ({
  children,
  tone = 'text-muted-foreground',
}: {
  children: ReactNode;
  tone?: string;
}) => (
  <span className={cn('flex items-center gap-1 self-end text-xs', tone)}>
    {children}
  </span>
);

/** Message states from the component library, with made-up names */
const ChatStates = () => (
  <div className="flex w-full flex-col gap-2 p-5">
    <Bubble mine={false}>
      <span className="text-primary block text-xs font-semibold">
        Maya Rao
      </span>
      Are you coming tonight too?
    </Bubble>
    <Bubble>👋 Hi Aiko</Bubble>
    <Meta>
      Seen{' '}
      <CheckCheck aria-hidden="true" className="text-chart-4 size-4" />{' '}
      10:38 AM
    </Meta>
    <Bubble>
      <span className="border-primary mb-1 block border-s-2 ps-2 text-xs">
        <span className="text-primary block font-semibold">Ben Ito</span>
        Yes, it will be fun.
      </span>
      Great!
    </Bubble>
    <Meta>
      Sending <Clock aria-hidden="true" className="size-3" />
    </Meta>
    <Bubble className="border-destructive bg-card border">
      Call me later.
    </Bubble>
    <Meta tone="text-primary">
      Retry <RotateCw aria-hidden="true" className="size-3" />
    </Meta>
    <Bubble className="text-muted-foreground italic">You deleted this message</Bubble>
    <Bubble>
      <span className="text-muted-foreground block text-xs">Forwarded</span>
      Meet at the east exit.
    </Bubble>
  </div>
);

/** Dialog styles and the snackbar from the component library */
const Dialogs = () => (
  <div className="m-auto flex w-full flex-col items-center gap-5 p-5">
    <div className="bg-card w-full max-w-60 rounded-xl shadow-lg">
      <p className="text-foreground px-4 pt-4 text-center text-sm font-semibold">
        Clear chat
      </p>
      <p className="text-muted-foreground px-4 pt-2 pb-4 text-center text-xs leading-relaxed">
        Delete all messages and shared content between you and Maya Rao?
      </p>
      <div className="border-border grid grid-cols-2 border-t text-xs font-semibold">
        <span className="text-foreground py-3 text-center">CANCEL</span>
        <span className="text-primary border-border border-s py-3 text-center">
          CLEAR
        </span>
      </div>
    </div>
    <span className="bg-foreground rounded-md px-4 py-2 text-xs text-background">
      Muted successfully
    </span>
  </div>
);

/** One bento cell: a live component that can't be clicked, with its name and a line under it */
const Specimen = ({
  title,
  note,
  className,
  children,
}: {
  title: string;
  note: string;
  className?: string;
  children: ReactNode;
}) => (
  <li
    className={cn(
      'bg-card border-border flex flex-col overflow-hidden rounded-2xl border',
      className,
    )}
  >
    <div
      inert
      className="bg-background relative flex min-h-0 flex-1 overflow-hidden"
    >
      {children}
    </div>
    <div className="px-4 py-3">
      <h3 className="text-foreground text-sm font-semibold">{title}</h3>
      <p className="text-muted-foreground text-xs">{note}</p>
    </div>
  </li>
);

/** Rakuten Link's page body: What I did, Try it, then the shared components */
export default function RakutenLinkStory({
  role,
  highlights,
}: {
  role: string;
  highlights: string[];
}) {
  const aiko = contactById('aiko');
  const aikoDays =
    CONVERSATIONS.find((c) => c.contactId === 'aiko')?.days.slice(-1) ?? [];

  return (
    <div className="space-y-24 pb-24">
      <section aria-labelledby="what-i-did" className="container">
        <div className="mx-auto max-w-2xl space-y-5">
          <h2 id="what-i-did" className="text-2xl">
            What I did
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {role}
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 ps-5 text-lg leading-relaxed">
            {highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </div>
      </section>

      <RakutenLinkProcess />

      <section aria-labelledby="try-it" className="space-y-8">
        <div className="container">
          <div className="mx-auto max-w-2xl space-y-2">
            <h2 id="try-it" className="text-2xl">
              Try it
            </h2>
            <p className="text-muted-foreground">
              Call someone, send a message or record a voice note. The contacts
              are made up and nothing is really sent.
            </p>
          </div>
        </div>
        <div
          data-project="rakuten-link"
          data-preview="rakuten-link"
          className={cn(linkFonts, 'bigger-container space-y-10')}
        >
          <div className="bg-background rounded-3xl p-6 md:p-10">
            <LinkMobileApp />
          </div>
          <div className="bg-background rounded-3xl p-4 md:p-8">
            <LinkDesktopApp />
          </div>
        </div>
      </section>

      <section aria-labelledby="screens" className="space-y-8">
        <div className="container">
          <div className="mx-auto max-w-2xl space-y-2">
            <h2 id="screens" className="text-2xl">
              Screens
            </h2>
            <p className="text-muted-foreground">
              The phone screens people use most, at a glance.
            </p>
          </div>
        </div>
        <ul
          data-project="rakuten-link"
          data-preview="rakuten-link"
          className={cn(
            linkFonts,
            'bigger-container grid grid-cols-1 gap-4 md:grid-cols-6',
          )}
        >
          <Specimen
            title="Call screen"
            note="Calling via Rakuten Link, then a timer"
            className="h-170 md:col-span-2"
          >
            <PhoneScale>
              <CallScreen
                name="Farah Khan"
                phone="070-1234-5606"
                onEnd={noop}
              />
            </PhoneScale>
          </Specimen>
          <Specimen
            title="Keypad"
            note="Round keys and one big call button"
            className="h-170 md:col-span-2"
          >
            <PhoneScale>
              <Dialer onCall={noop} onClose={noop} />
            </PhoneScale>
          </Specimen>
          <Specimen
            title="Conversation list"
            note="Last message, time and unread count"
            className="h-170 md:col-span-2"
          >
            <div className="bg-card w-full overflow-hidden">
              <ConversationList conversations={CONVERSATIONS} onOpen={noop} />
            </div>
          </Specimen>
          <Specimen
            title="Chat thread"
            note="Days, Seen receipts, voice and the composer"
            className="h-96 md:col-span-6"
          >
            <ChatThread contact={aiko} days={aikoDays} />
          </Specimen>
        </ul>
      </section>

      <section aria-labelledby="design-system" className="space-y-8">
        <div className="container">
          <div className="mx-auto max-w-2xl space-y-2">
            <h2 id="design-system" className="text-2xl">
              Design system
            </h2>
            <p className="text-muted-foreground">
              One system, two apps: the same colours, type, icons and components
              build the phone and desktop apps.
            </p>
          </div>
        </div>
        <ul
          data-project="rakuten-link"
          data-preview="rakuten-link"
          className={cn(
            linkFonts,
            'bigger-container grid grid-cols-1 gap-4 md:grid-cols-6',
          )}
        >
          <Specimen
            title="Colours"
            note="Shared by both apps"
            className="md:col-span-6"
          >
            <ul className="grid w-full grid-cols-3 gap-4 p-6 sm:grid-cols-6">
              {SWATCHES.map((swatch) => (
                <li key={swatch.label} className="space-y-2">
                  <span
                    className="outline-foreground/10 block h-14 rounded-xl outline -outline-offset-1"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <span className="text-foreground block text-xs font-semibold">
                    {swatch.label}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {swatch.role} ·{' '}
                    <span className="tabular-nums">{swatch.hex}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Specimen>
          <Specimen
            title="Type"
            note="Rubik for display and numbers, Noto Sans for text"
            className="md:col-span-2"
          >
            <div className="text-foreground m-auto flex flex-col items-center gap-6 p-6">
              <div className="text-center">
                <p className={cn(DISPLAY, 'flex gap-3 text-5xl')}>
                  <span className="font-light">00</span>
                  <span className="font-medium">00</span>
                  <span className="font-bold">00</span>
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                  Rubik · Light, Medium, Bold
                </p>
              </div>
              <div className="text-center">
                <p className="text-5xl">
                  Aa <span className="font-bold">Aa</span>
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                  Noto Sans · Medium, Bold
                </p>
              </div>
            </div>
          </Specimen>
          <Specimen
            title="Icons"
            note="Reduced to the simplest form, readable at small sizes"
            className="md:col-span-2"
          >
            <ul className="text-foreground m-auto grid grid-cols-5 gap-3 p-6">
              {ICONS.map((Icon, i) => (
                <li
                  key={i}
                  className="bg-card flex size-10 items-center justify-center rounded-lg"
                >
                  <Icon
                    aria-hidden="true"
                    className="size-5"
                    strokeWidth={1.5}
                  />
                </li>
              ))}
            </ul>
          </Specimen>
          <Specimen
            title="Avatar and Link badge"
            note="Pink R marks contacts who use Link"
            className="md:col-span-2"
          >
            <div className="m-auto grid grid-cols-2 gap-6">
              <Avatar name="Aiko Tanaka" onLink size="lg" />
              <Avatar name="Chika Mori" size="lg" />
              <Avatar name="Farah Khan" onLink size="lg" />
              <Avatar name="Ben Ito" onLink size="lg" />
            </div>
          </Specimen>
          <Specimen
            title="Chat states"
            note="Sending, failed, deleted, forwarded and replies"
            className="md:col-span-4"
          >
            <ChatStates />
          </Specimen>
          <Specimen
            title="Dialogs"
            note="Confirmations and the snackbar"
            className="md:col-span-2"
          >
            <Dialogs />
          </Specimen>
        </ul>
      </section>
    </div>
  );
}
