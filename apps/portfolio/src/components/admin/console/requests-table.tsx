'use client';

import { Inbox } from 'lucide-react';
import { unstable_rethrow } from 'next/navigation';
import { useState, useTransition } from 'react';

import { declineRequest } from '@/app/(admin)/admin/actions';
import AddGuestDialog, {
  type GuestDefaults,
} from '@/components/admin/add-guest-dialog';
import { Badge } from '@/components/ui/badge';
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

import SectionCard from './section-card';

export type RequestRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  productSlug: string;
  projectName: string;
  /** Already formatted in Tokyo time */
  receivedLabel: string;
  /** Set when the email already belongs to a guest */
  existingGuest: { expiresAt: Date | null } | null;
};

type RequestsTableProps = { requests: RequestRow[] };

const DECLINE_ERROR = 'Couldn’t decline. Try again.';

export default function RequestsTable({ requests }: RequestsTableProps) {
  // Lives outside the table so the password stays on screen after the
  // approved request drops out of it.
  const [approving, setApproving] = useState<GuestDefaults>();
  const [open, setOpen] = useState(false);

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
                onApprove={() => {
                  setApproving({
                    name: request.name,
                    email: request.email,
                    requestId: request.id,
                    projectSlug: request.productSlug,
                    existingGuest: request.existingGuest ?? undefined,
                  });
                  setOpen(true);
                }}
              />
            ))}
          </TableBody>
        </Table>
      )}

      <AddGuestDialog open={open} onOpenChange={setOpen} defaults={approving} />
    </SectionCard>
  );
}

function RequestTableRow({
  request,
  onApprove,
}: {
  request: RequestRow;
  onApprove: () => void;
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
          {request.existingGuest && (
            <Badge variant="secondary">Already a guest</Badge>
          )}
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
          <Button size="sm" onClick={onApprove}>
            {request.existingGuest ? 'Resend access' : 'Approve'}
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
