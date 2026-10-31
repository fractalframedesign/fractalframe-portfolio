'use client';

import { useState, useTransition } from 'react';

import { declineRequest } from '@/app/(admin)/admin/actions';
import { Button } from '@/components/ui/button';

import AddGuestDialog, {
  type GuestDefaults,
  type ProjectOption,
} from './add-guest-dialog';

export type InboxRequest = {
  id: string;
  name: string;
  email: string;
  message: string;
  productSlug: string;
  projectName: string;
  /** Already formatted in Tokyo time */
  receivedLabel: string;
};

type RequestInboxProps = {
  requests: InboxRequest[];
  /** Unlocked projects, for the approve dialog */
  projects: ProjectOption[];
};

export default function RequestInbox({
  requests,
  projects,
}: RequestInboxProps) {
  // Lives outside the list so the password stays on screen after the
  // approved request drops out of it.
  const [approving, setApproving] = useState<GuestDefaults>();
  const [open, setOpen] = useState(false);

  return (
    <>
      {requests.length === 0 ? (
        <p className="text-muted-foreground text-sm">No requests waiting.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {requests.map((request) => (
            <RequestItem
              key={request.id}
              request={request}
              onApprove={() => {
                setApproving({
                  name: request.name,
                  email: request.email,
                  products: [request.productSlug],
                  requestId: request.id,
                });
                setOpen(true);
              }}
            />
          ))}
        </ul>
      )}

      <AddGuestDialog
        open={open}
        onOpenChange={setOpen}
        projects={projects}
        defaults={approving}
      />
    </>
  );
}

function RequestItem({
  request,
  onApprove,
}: {
  request: InboxRequest;
  onApprove: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function decline() {
    startTransition(async () => {
      const result = await declineRequest(request.id);
      if (!result.ok) setError(result.error ?? 'Couldn’t decline. Try again.');
    });
  }

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="font-medium">
          {request.name}{' '}
          <span className="text-muted-foreground font-normal">
            {request.email}
          </span>
        </p>
        <p className="text-muted-foreground text-sm">
          {request.projectName} · {request.receivedLabel}
        </p>
        {request.message && (
          <p className="text-sm break-words whitespace-pre-line">
            {request.message}
          </p>
        )}
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" onClick={onApprove}>
          Approve
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
    </li>
  );
}
