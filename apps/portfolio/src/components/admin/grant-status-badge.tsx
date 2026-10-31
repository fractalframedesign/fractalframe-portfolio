import { Badge } from '@/components/ui/badge';
import { grantStatusLabel } from '@/lib/access/admin-format';
import { cn } from '@/lib/utils';

// Subtle tones keep small badge text readable (see admin.css)
const STYLES = {
  Active: 'bg-success-subtle text-success-subtle-foreground border-transparent',
  Paused: 'bg-warning-subtle text-warning-subtle-foreground border-transparent',
  Expired:
    'bg-destructive-subtle text-destructive-subtle-foreground border-transparent',
};

type GrantStatusBadgeProps = {
  grant: { status: 'active' | 'paused'; expiresAt: Date | null };
  now: Date;
};

export default function GrantStatusBadge({
  grant,
  now,
}: GrantStatusBadgeProps) {
  const label = grantStatusLabel(grant, now);
  return (
    <Badge variant="outline" className={cn(STYLES[label])}>
      {label}
    </Badge>
  );
}
