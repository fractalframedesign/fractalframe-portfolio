import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';

type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: StatCardProps) {
  const card = (
    <Card className="h-full gap-3 transition-colors group-hover/stat:bg-muted/50">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardAction>
          <Icon className="text-muted-foreground size-4" aria-hidden />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      className="group/stat focus-visible:ring-ring/50 block rounded-3xl outline-none focus-visible:ring-[3px]"
    >
      {card}
    </Link>
  );
}
