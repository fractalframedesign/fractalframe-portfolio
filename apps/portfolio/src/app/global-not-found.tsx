// Handles every unmatched URL. The app has two root layouts ((site) and
// (showcase)), so a 404 can't be composed from either; this page renders on
// its own and brings the site's styles and font itself.
import './(site)/globals.css';

import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import Link from 'next/link';

import { ThemeProvider } from '@/components/providers/theme-provider';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Page not found | Kiran Pingle',
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`flex min-h-screen flex-col antialiased ${GeistSans.variable}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
        >
          <main className="hero-padding flex-1">
            <div className="container space-y-6">
              <div className="space-y-5">
                <p className="text-muted-foreground text-sm">404</p>
                <h1 className="text-3xl md:text-4xl">
                  This page doesn&apos;t exist
                </h1>
                <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
                  The link may be old, or the page has moved. Try the home page
                  or browse the projects and articles.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/">Go home</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/projects">See projects</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/articles">Read articles</Link>
                </Button>
              </div>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
