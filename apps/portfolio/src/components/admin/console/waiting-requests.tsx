'use client';

import { Inbox } from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  GuestStateBadge,
  replyLabel,
  type ReplyRequest,
  useRequestReply,
} from './request-reply';
import SectionCard from './section-card';

export type WaitingRequest = ReplyRequest & {
  projectName: string;
  /** Already formatted in Tokyo time */
  receivedLabel: string;
};

type WaitingRequestsProps = { requests: WaitingRequest[] };

export default function WaitingRequests({ requests }: WaitingRequestsProps) {
  const reply = useRequestReply();

  return (
    <SectionCard title="Waiting for you" icon={Inbox}>
      {requests.length === 0 ? (
        <p className="text-muted-foreground text-sm">No requests waiting.</p>
      ) : (
        <ul className="divide-y">
          {requests.map((request) => (
            <li
              key={request.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{request.name}</p>
                  <GuestStateBadge request={request} />
                </div>
                <p className="text-muted-foreground truncate text-sm">
                  {request.projectName} · {request.receivedLabel}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => reply.start(request)}
              >
                {replyLabel(request)}
              </Button>
            </li>
          ))}
        </ul>
      )}

      {reply.dialogs}
    </SectionCard>
  );
}
