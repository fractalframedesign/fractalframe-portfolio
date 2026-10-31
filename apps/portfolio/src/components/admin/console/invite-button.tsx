'use client';

import { useState } from 'react';

import AddGuestDialog, {
  type ProjectOption,
} from '@/components/admin/add-guest-dialog';
import { Button } from '@/components/ui/button';

type InviteButtonProps = {
  /** The project to preselect; none when left out */
  slug?: string;
  /** Unlocked projects only */
  projects: ProjectOption[];
  label?: string;
  variant?: 'outline' | 'ghost';
};

export default function InviteButton({
  slug,
  projects,
  label = 'Invite',
  variant = 'outline',
}: InviteButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" variant={variant} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <AddGuestDialog
        open={open}
        onOpenChange={setOpen}
        projects={projects}
        defaults={slug ? { products: [slug] } : undefined}
      />
    </>
  );
}
