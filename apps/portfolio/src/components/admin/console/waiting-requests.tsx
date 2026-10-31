'use client';

import { Inbox } from 'lucide-react';
import { useState } from 'react';

import AddGuestDialog, {
  type GuestDefaults,
} from '@/components/admin/add-guest-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import SectionCard from './section-card';

export type WaitingRequest = {
  id: string;
  name: string;
  email: string;
  productSlug: string;
  projectName: string;
  /** Already formatted in Tokyo time */
  receivedLabel: string;
  /** Set when the email already belongs to a guest */
  existingGuest: { expiresAt: Date | null } | null;
};

type WaitingRequestsProps = { requests: WaitingRequest[] };

export default function WaitingRequests({ requests }: WaitingRequestsProps) {
  // Lives outside the list so the password stays on screen after the
  // approved request drops out of it.
  const [approving, setApproving] = useState<GuestDefaults>();
  const [open, setOpen] = useState(false);

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
                  {request.existingGuest && (
                    <Badge variant="secondary">Already a guest</Badge>
                  )}
                </div>
                <p className="text-muted-foreground truncate text-sm">
                  {request.projectName} · {request.receivedLabel}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setApproving({
                    name: request.name,
                    email: request.email,
                    requestId: request.id,
                    existingGuest: request.existingGuest ?? undefined,
                  });
                  setOpen(true);
                }}
              >
                {request.existingGuest ? 'Resend access' : 'Approve'}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <AddGuestDialog open={open} onOpenChange={setOpen} defaults={approving} />
    </SectionCard>
  );
}
