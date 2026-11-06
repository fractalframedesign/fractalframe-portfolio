'use client';

import { Inbox } from 'lucide-react';
import { unstable_rethrow } from 'next/navigation';
import { useState, useTransition } from 'react';

import { declineRequest } from '@/app/(admin)/admin/actions';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  GuestStateBadge,
  replyLabel,
  type ReplyRequest,
  useRequestReply,
} from './request-reply';
import SectionCard from './section-card';

export type RequestRow = ReplyRequest & {
  message: string;
  projectName: string;
  /** Already formatted in Tokyo time */
  receivedLabel: string;
};

type RequestsTableProps = { requests: RequestRow[] };

const DECLINE_ERROR = 'Couldn’t decline. Try again.';

export default function RequestsTable({ requests }: RequestsTableProps) {
  const reply = useRequestReply();

  return (
    <SectionCard title="New and pending requests" icon={Inbox}>
      {requests.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No requests waiting. New requests from the unlock page appear here.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Asked from</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <RequestTableRow
                key={request.id}
                request={request}
                onReply={() => reply.start(request)}
              />
            ))}
          </TableBody>
        </Table>
      )}

      {reply.dialogs}
    </SectionCard>
  );
}

function RequestTableRow({
  request,
  onReply,
}: {
  request: RequestRow;
  onReply: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function decline() {
    setError(undefined);
    // Inside a transition so a thrown redirect (session expired) reaches
    // Next's RedirectBoundary instead of being shown as a failed decline
    startTransition(async () => {
      try {
        const result = await declineRequest(request.id);
        if (!result.ok) setError(result.error ?? DECLINE_ERROR);
      } catch (caught) {
        unstable_rethrow(caught);
        setError(DECLINE_ERROR);
      }
    });
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{request.name}</p>
          <GuestStateBadge request={request} />
        </div>
        <p className="text-muted-foreground text-sm">{request.email}</p>
      </TableCell>
      <TableCell>{request.projectName}</TableCell>
      <TableCell className="max-w-64 whitespace-normal">
        {request.message ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <p tabIndex={0} className="line-clamp-2 text-sm break-words">
                {request.message}
              </p>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm whitespace-pre-line">
              {request.message}
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-muted-foreground">No message</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {request.receivedLabel}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button size="sm" onClick={onReply}>
            {replyLabel(request)}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={decline}
            disabled={pending}
          >
            {pending ? 'Declining…' : 'Decline'}
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-destructive mt-1 text-right text-sm">
            {error}
          </p>
        )}
      </TableCell>
    </TableRow>
  );
}
