'use client';

import { useState } from 'react';

import AddGuestDialog from '@/components/admin/add-guest-dialog';
import { Button } from '@/components/ui/button';

type InviteButtonProps = {
  label?: string;
  variant?: 'outline' | 'ghost';
};

export default function InviteButton({
  label = 'Invite',
  variant = 'outline',
}: InviteButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" variant={variant} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <AddGuestDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
