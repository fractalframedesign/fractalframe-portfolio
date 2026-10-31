'use client';

import { Inbox } from 'lucide-react';
import { useState } from 'react';

import AddGuestDialog, {
  type GuestDefaults,
  type ProjectOption,
} from '@/components/admin/add-guest-dialog';
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
};

type WaitingRequestsProps = {
  requests: WaitingRequest[];
  /** Unlocked projects, for the invite dialog */
  projects: ProjectOption[];
};

export default function WaitingRequests({
  requests,
  projects,
}: WaitingRequestsProps) {
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
                <p className="truncate text-sm font-medium">{request.name}</p>
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
                    products: [request.productSlug],
                    requestId: request.id,
                  });
                  setOpen(true);
                }}
              >
                Approve
              </Button>
            </li>
          ))}
        </ul>
      )}

      <AddGuestDialog
        open={open}
        onOpenChange={setOpen}
        projects={projects}
        defaults={approving}
      />
    </SectionCard>
  );
}
