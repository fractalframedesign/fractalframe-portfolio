import { Lock } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import RequestAccessDialog from '@/components/access/request-access-dialog';
import UnlockForm from '@/components/access/unlock-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { offersUnlock } from '@/lib/access/gate';
import { getStoredLevels } from '@/lib/access/repo/products';
import { getDb } from '@/lib/db/client';
import { getShowcaseProject } from '@/lib/showcase';

export const metadata: Metadata = {
  title: 'Password required',
  robots: { index: false, follow: false },
};

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; next?: string }>;
}) {
  const { project, next } = await searchParams;
  const slug = project ?? '';
  const showcase = getShowcaseProject(slug);
  if (!showcase || !(await offersUnlock(slug, () => getStoredLevels(getDb()))))
    notFound();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Lock className="text-muted-foreground size-5" aria-hidden />
          <CardTitle>
            <h1 className="text-lg font-semibold">{showcase.name}</h1>
          </CardTitle>
          <CardDescription>
            This project is private. Enter the password to view it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnlockForm project={slug} next={next ?? `/showcase/${slug}`} />
        </CardContent>
        <CardFooter className="text-muted-foreground gap-1 text-sm">
          Don&apos;t have a password?
          <RequestAccessDialog project={{ slug, name: showcase.name }} />
        </CardFooter>
      </Card>
    </main>
  );
}
