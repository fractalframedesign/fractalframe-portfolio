import { Lock } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import SignInCard from '@/components/access/sign-in-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { offersUnlock } from '@/lib/access/gate';
import { getStoredLevels } from '@/lib/access/repo/products';
import { emailParam, takeEmail } from '@/lib/access/sign-in-params';
import { getDb } from '@/lib/db/client';
import { getShowcaseProject } from '@/lib/showcase';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; next?: string; email?: string }>;
}) {
  const { project, next, email } = await searchParams;
  const slug = project ?? '';
  const showcase = getShowcaseProject(slug);
  if (!showcase || !(await offersUnlock(slug, () => getStoredLevels(getDb()))))
    notFound();

  // The button in the code email links to the demo with ?email=, which the
  // proxy hands over inside `next`
  const from = takeEmail(typeof next === 'string' ? next : '');

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Lock className="text-muted-foreground size-5" aria-hidden />
          <CardTitle>
            <h1 className="text-lg font-semibold">
              Sign in to view {showcase.name}
            </h1>
          </CardTitle>
          <CardDescription>
            Enter your email. If you&apos;re on my guest list, a 6-digit code
            arrives in seconds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInCard
            project={{ slug, name: showcase.name }}
            next={from.next || `/showcase/${slug}`}
            initialEmail={emailParam(email) ?? from.email}
          />
        </CardContent>
      </Card>
    </main>
  );
}
