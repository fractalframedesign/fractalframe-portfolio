import { cn } from '@/components/project-demos/rakuten-link/lib/utils';

import { Avatar } from './Avatar';
import { contactById, type Conversation } from './data';

const lastPreview = (conversation: Conversation) => {
  const last = conversation.days.at(-1)?.messages.at(-1);
  if (!last) return { text: '', time: '' };
  const text =
    last.kind === 'text'
      ? last.text
      : last.kind === 'location'
        ? 'Shared a location'
        : 'Voice message';
  return {
    text,
    time:
      conversation.days.at(-1)?.date === 'Today'
        ? last.time
        : (conversation.days.at(-1)?.date ?? ''),
  };
};

/** Conversations, newest first; used by the phone's Messages tab and the desktop sidebar */
export function ConversationList({
  conversations,
  activeId,
  onOpen,
}: {
  conversations: Conversation[];
  activeId?: string;
  onOpen: (contactId: string) => void;
}) {
  return (
    <ul className="divide-border divide-y">
      {conversations.map((conversation) => {
        const contact = contactById(conversation.contactId);
        const preview = lastPreview(conversation);
        return (
          <li key={conversation.contactId}>
            <button
              type="button"
              onClick={() => onOpen(contact.id)}
              aria-current={activeId === contact.id ? 'true' : undefined}
              className={cn(
                'hover:bg-background focus-visible:ring-primary flex w-full items-center gap-3 px-4 py-3 text-start outline-none focus-visible:ring-2 focus-visible:ring-inset',
                activeId === contact.id && 'bg-background',
              )}
            >
              <Avatar name={contact.name} onLink={contact.onLink} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-foreground truncate font-semibold">
                    {contact.name}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {preview.time}
                  </span>
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground truncate text-sm">
                    {contact.onLink ? preview.text : `SMS · ${preview.text}`}
                  </span>
                  {conversation.unread ? (
                    <span className="bg-primary shrink-0 rounded-full px-2 text-xs leading-5 font-semibold text-primary-foreground">
                      {conversation.unread}
                      <span className="sr-only"> unread</span>
                    </span>
                  ) : null}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
