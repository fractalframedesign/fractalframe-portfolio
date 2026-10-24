'use client';

import {
  BookOpen,
  Boxes,
  FileText,
  LayoutGrid,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SiteHeader } from '@/components/layout/site-header';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { getComponentCount, type ShowcaseProject } from '@/lib/showcase';
import { cn } from '@/lib/utils';

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
  const base = `/showcase/${project.slug}`;
  const currentSection = tabs.find(
    (tab) => tab.path && pathname === `${base}${tab.path}`,
  );
  // Only the Components page uses full-width bands; Docs and Case study stay in the container
  const fullBleed = project.layout === 'sections' && !currentSection;

  return (
    <div className="min-h-screen">
      <SiteHeader
        activePath="/projects"
        themeToggle={<ThemeToggle />}
        className="sticky top-0"
      />

      <main data-project={project.scope}>
        <div
          className={cn(
            'mx-auto max-w-7xl space-y-10 px-4 pt-6 md:px-8 md:pt-8',
            fullBleed ? 'pb-16 md:pb-20' : 'pb-10 md:pb-14',
          )}
        >
        <div className="space-y-6 md:space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/projects">Projects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              {currentSection ? (
                <BreadcrumbLink asChild>
                  <Link href={base}>{project.name}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{project.name}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {currentSection && (
              <>
                <BreadcrumbSeparator>/</BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentSection.label}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

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
        </div>

        {!fullBleed && children}
        </div>
        {fullBleed && children}
      </main>
    </div>
  );
}
