import { ArrowRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
};

const ACTION_LABELS: Record<string, string> = {
  'Requests waiting': 'Review requests',
  'Protected projects': 'Manage projects',
  'Active guests': 'View guests',
  'Expiring this week': 'Review access',
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: StatCardProps) {
  const card = (
    <Card className="h-full gap-4 overflow-hidden border-border/70 bg-card py-0 shadow-sm transition-[border-color,box-shadow,transform] duration-200 group-hover/stat:-translate-y-0.5 group-hover/stat:border-border group-hover/stat:shadow-md">
      <CardHeader className="pt-6">
        <CardDescription className="text-sm font-medium">
          {label}
        </CardDescription>
        <CardAction>
          <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl">
            <Icon className="size-[18px]" aria-hidden />
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-4xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
      </CardContent>
      {href && (
        <CardFooter className="mt-1 justify-between border-t bg-muted/20 py-3 text-sm font-medium text-muted-foreground transition-colors group-hover/stat:text-foreground">
          <span>{ACTION_LABELS[label] ?? 'View details'}</span>
          <ArrowRight className="size-4" aria-hidden />
        </CardFooter>
      )}
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
