'use client';

import {
  AlertCircle,
  Camera,
  ChevronRight,
  Clock,
  FileText,
  Image as ImageIcon,
  MapPin,
  Mic,
  Play,
  SendHorizontal,
  UserRound,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { cn } from '@/lib/utils';

import { Avatar } from './Avatar';
import type { Contact, DayBlock, Message } from './data';
import { VoiceRecorder } from './VoiceRecorder';

const ATTACHMENTS = [
  { label: 'Camera', icon: Camera },
  { label: 'Photos', icon: ImageIcon },
  { label: 'File', icon: FileText },
  { label: 'Location', icon: MapPin },
  { label: 'Contact', icon: UserRound },
  { label: 'Schedule', icon: Clock },
];

const now = () =>
  new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

/** A small drawn map, standing in for a shared location */
const MapBubble = ({ place }: { place: string }) => (
  <span className="bg-surface border-surface-border block w-56 overflow-hidden rounded-2xl border">
    <span className="bg-accent-2-soft relative block h-32">
      <span className="bg-surface absolute inset-x-0 top-1/3 h-2" />
      <span className="bg-surface absolute inset-x-0 top-2/3 h-1" />
      <span className="bg-surface absolute inset-y-0 left-1/3 w-2" />
      <span className="bg-surface absolute inset-y-0 left-3/4 w-1" />
      <MapPin
        aria-hidden="true"
        className="fill-accent-1 text-accent-1-deep absolute top-1/2 left-1/2 size-7 -translate-x-1/2 -translate-y-full"
      />
    </span>
    <span className="text-ink block px-3 py-2 text-xs">{place}</span>
  </span>
);

const VoiceBubble = ({ seconds }: { seconds: number }) => (
  <span className="flex items-center gap-2">
    <Play aria-hidden="true" className="fill-ink size-4" />
    <span className="flex h-6 items-center gap-1" aria-hidden="true">
      {[3, 5, 8, 4, 6, 9, 5, 3, 7, 4, 6, 3].map((h, i) => (
        <span
          key={i}
          className="bg-ink-muted w-0.5 rounded-full"
          style={{ height: h * 2 }}
        />
      ))}
    </span>
    <span className="text-ink-muted text-xs tabular-nums">
      0:{String(seconds).padStart(2, '0')}
    </span>
    <span className="sr-only">Voice message, {seconds} seconds</span>
  </span>
);

const Bubble = ({
  message,
  contact,
}: {
  message: Message;
  contact: Contact;
}) => {
  const mine = message.from === 'me';
  const body =
    message.kind === 'text' ? (
      message.text
    ) : message.kind === 'location' ? (
      <MapBubble place={message.place} />
    ) : (
      <VoiceBubble seconds={message.seconds} />
    );

  return (
    <li className={cn('flex items-end gap-2', mine && 'flex-row-reverse')}>
      {!mine && <Avatar name={contact.name} size="sm" />}
      <span
        className={cn(
          'text-ink max-w-[75%] text-base leading-snug',
          message.kind === 'location'
            ? ''
            : cn(
                'rounded-2xl px-4 py-2',
                mine ? 'bg-accent-4' : 'bg-surface',
              ),
        )}
      >
        {body}
      </span>
      <span
        className={cn(
          'text-ink-muted shrink-0 text-xs leading-tight',
          mine && 'text-end',
        )}
      >
        {mine && message.seen && <span className="block">Seen</span>}
        {mine && !message.seen && <span className="block">Sent</span>}
        {message.time}
      </span>
    </li>
  );
};

/** Message list plus composer; contacts not on Link get the SMS hand-off instead */
export function ChatThread({
  contact,
  days,
  className,
}: {
  contact: Contact;
  days: DayBlock[];
  className?: string;
}) {
  const [recording, setRecording] = useState(false);
  const [sent, setSent] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [trayOpen, setTrayOpen] = useState(false);

  const allDays: DayBlock[] =
    sent.length > 0
      ? [
          ...days.filter((d) => d.date !== 'Today'),
          {
            date: 'Today',
            messages: [
              ...(days.find((d) => d.date === 'Today')?.messages ?? []),
              ...sent,
            ],
          },
        ]
      : days;

  const send = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setSent((prev) => [
      ...prev,
      { id: `s${prev.length}`, from: 'me', kind: 'text', text, time: now() },
    ]);
    setDraft('');
  };

  const sendVoice = (seconds: number) => {
    setSent((prev) => [
      ...prev,
      {
        id: `s${prev.length}`,
        from: 'me',
        kind: 'voice',
        seconds,
        time: now(),
      },
    ]);
    setRecording(false);
  };

  return (
    <div
      className={cn(
        'bg-canvas relative flex min-h-0 flex-1 flex-col',
        className,
      )}
    >
      {recording && (
        <VoiceRecorder
          recipient={contact.name}
          onCancel={() => setRecording(false)}
          onSend={sendVoice}
        />
      )}
      {!contact.onLink && (
        <p className="bg-accent-1-soft text-accent-1-deep flex items-center gap-3 px-4 py-3 text-sm">
          <AlertCircle aria-hidden="true" className="size-5 shrink-0" />
          Please send SMS from your device messaging app
        </p>
      )}

      <ol
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4"
        aria-label={`Messages with ${contact.name}`}
      >
        {allDays.map((day) => (
          <li key={day.date} className="space-y-3">
            <p className="flex justify-center">
              <span className="border-ink-muted/40 text-ink-muted rounded-full border px-3 py-1 text-xs">
                {day.date}
              </span>
            </p>
            <ul className="space-y-3">
              {day.messages.map((message) => (
                <Bubble key={message.id} message={message} contact={contact} />
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {contact.onLink ? (
        <div className="bg-surface border-surface-border border-t">
          {trayOpen && (
            <ul className="flex justify-around px-2 pt-3" aria-label="Attach">
              {ATTACHMENTS.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <button
                    type="button"
                    aria-label={label}
                    className="text-ink-muted hover:text-ink focus-visible:ring-accent-1 flex size-10 items-center justify-center rounded-full outline-none focus-visible:ring-2"
                  >
                    <Icon aria-hidden="true" className="size-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={send} className="flex items-center gap-2 px-3 py-3">
            <button
              type="button"
              aria-label={trayOpen ? 'Hide attachments' : 'Show attachments'}
              aria-expanded={trayOpen}
              onClick={() => setTrayOpen((open) => !open)}
              className="text-ink-muted hover:text-ink focus-visible:ring-accent-1 flex size-9 items-center justify-center rounded-full outline-none focus-visible:ring-2"
            >
              <ChevronRight
                aria-hidden="true"
                className={cn(
                  'size-5 transition-transform',
                  trayOpen && 'rotate-180',
                )}
              />
            </button>
            <input
              aria-label="Message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a message"
              className="text-ink placeholder:text-ink-muted min-w-0 flex-1 bg-transparent text-base outline-none"
            />
            {draft.trim() ? (
              <button
                type="submit"
                aria-label="Send"
                className="bg-accent-1 focus-visible:ring-accent-1 flex size-10 items-center justify-center rounded-full text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <SendHorizontal aria-hidden="true" className="size-5" />
              </button>
            ) : (
              <button
                type="button"
                aria-label="Record voice message"
                onClick={() => setRecording(true)}
                className="bg-accent-1 focus-visible:ring-accent-1 flex size-10 items-center justify-center rounded-full text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <Mic aria-hidden="true" className="size-5" />
              </button>
            )}
          </form>
        </div>
      ) : (
        <p className="bg-surface border-surface-border text-ink border-t px-4 py-3 text-sm">
          Open this device’s messaging application
          <span className="text-ink-muted block text-xs">
            ※SMS charges will apply
          </span>
        </p>
      )}
    </div>
  );
}
