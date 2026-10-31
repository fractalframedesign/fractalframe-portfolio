'use client';

import { useState } from 'react';

import AddGuestDialog, {
  type ProjectOption,
} from '@/components/admin/add-guest-dialog';
import { Button } from '@/components/ui/button';

type InviteButtonProps = {
  /** The project to preselect */
  slug: string;
  /** Unlocked projects only */
  projects: ProjectOption[];
};

export default function InviteButton({ slug, projects }: InviteButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Invite
      </Button>
      <AddGuestDialog
        open={open}
        onOpenChange={setOpen}
        projects={projects}
        defaults={{ products: [slug] }}
      />
    </>
  );
}
