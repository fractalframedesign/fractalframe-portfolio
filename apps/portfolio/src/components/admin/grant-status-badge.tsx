import { Badge } from '@/components/ui/badge';
import { grantStatusLabel } from '@/lib/access/admin-format';
import { cn } from '@/lib/utils';

const STYLES = {
  Active: 'bg-success text-success-foreground border-transparent',
  Paused: 'bg-warning text-warning-foreground border-transparent',
  Expired: 'text-muted-foreground',
};

type GrantStatusBadgeProps = {
  grant: { status: 'active' | 'paused'; expiresAt: Date | null };
  now: Date;
};

export default function GrantStatusBadge({ grant, now }: GrantStatusBadgeProps) {
  const label = grantStatusLabel(grant, now);
  return (
    <Badge variant="outline" className={cn(STYLES[label])}>
      {label}
    </Badge>
  );
}
