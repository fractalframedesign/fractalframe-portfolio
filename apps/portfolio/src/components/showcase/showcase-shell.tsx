'use client';

import {
  BookOpen,
  Boxes,
  FileText,
  LayoutGrid,
  Moon,
  Sun,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

import { useIsDark } from '@/components/showcase/use-is-dark';
import { Button } from '@/components/ui/button';
import { getComponentCount, type ShowcaseProject } from '@/lib/showcase';

type ShowcaseShellProps = {
  project: ShowcaseProject;
  children: React.ReactNode;
};

const tabs = [
  { label: 'Components', path: '', icon: LayoutGrid },
  { label: 'Docs', path: '/docs', icon: BookOpen },
  { label: 'Case study', path: '/case-study', icon: FileText },
];

export function ShowcaseShell({ project, children }: ShowcaseShellProps) {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const isDark = useIsDark();
  const base = `/showcase/${project.slug}`;

  return (
    <div className="min-h-screen">
      <header className="bg-background/80 border-border sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 md:gap-4 md:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 font-medium"
          >
            <span className="relative size-9 shrink-0 overflow-hidden rounded-full">
              <Image
                src="/images/home/avatar-sm.png"
                alt="Kiran Pingle"
                fill
                unoptimized
                className="object-cover"
              />
            </span>
            <span className="text-sm whitespace-nowrap">Kiran Pingle</span>
          </Link>

          <span aria-hidden="true" className="text-muted-foreground shrink-0">
            /
          </span>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-mx-1 shrink-0 md:-mx-2"
          >
            <Link href="/projects">Projects</Link>
          </Button>

          <span aria-hidden="true" className="text-muted-foreground shrink-0">
            /
          </span>

          <span
            aria-current="page"
            className="min-w-0 truncate text-sm font-medium"
          >
            {project.name}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="ml-auto shrink-0"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            {isDark ? <Sun /> : <Moon />}
          </Button>
        </div>
      </header>

      <main
        data-project={project.scope}
        className="mx-auto max-w-7xl space-y-10 px-4 py-10 md:px-8 md:py-14"
      >
        <section className="border-border bg-card relative isolate overflow-hidden rounded-3xl border px-6 py-10 md:px-12 md:py-16">
          {/* Project-coloured glow and dot grid, driven by the scoped tokens */}
          <div
            aria-hidden="true"
            className="bg-accent-1/30 pointer-events-none absolute -top-32 -right-24 -z-10 size-112 rounded-full blur-3xl"
          />
          <div
            aria-hidden="true"
            className="bg-accent-2/20 pointer-events-none absolute -bottom-40 left-1/4 -z-10 size-96 rounded-full blur-3xl"
          />
          <div
            aria-hidden="true"
            className="bg-dots pointer-events-none absolute inset-0 -z-10 opacity-60 mask-[linear-gradient(to_bottom,black,transparent_85%)]"
          />

          <div className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 space-y-6 duration-700">
            <p className="border-border bg-background/60 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium backdrop-blur">
              <span
                aria-hidden="true"
                className="bg-accent-2 size-2 rounded-full"
              />
              {project.eyebrow}
            </p>

            <h1 className="from-foreground to-foreground/55 bg-linear-to-b bg-clip-text text-5xl leading-[1.02] font-semibold tracking-tight text-balance text-transparent md:text-7xl">
              {project.name}
            </h1>

            <p className="text-muted-foreground max-w-2xl text-lg text-pretty md:text-xl">
              {project.description}
            </p>

            <ul className="flex flex-wrap items-center gap-2 text-sm">
              <li className="border-border bg-background/60 flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium backdrop-blur">
                <Boxes className="text-accent-1 size-4" />
                {getComponentCount(project)} components
              </li>
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="border-border bg-background/60 text-muted-foreground rounded-full border px-3 py-1.5 backdrop-blur"
                >
                  {tag}
                </li>
              ))}
            </ul>

            <nav
              aria-label="Project sections"
              className="flex flex-wrap gap-2 pt-2"
            >
              {tabs.map((tab) => {
                const href = `${base}${tab.path}`;
                const active = pathname === href;
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.label}
                    asChild
                    size="lg"
                    variant={active ? 'default' : 'outline'}
                    className="rounded-full"
                  >
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon />
                      {tab.label}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>
        </section>

        {children}
      </main>
    </div>
  );
}
