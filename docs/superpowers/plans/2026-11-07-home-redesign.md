# Home Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the home page as one calm reading column: Intro, What I do, Highlights, Writing, Work, with handwritten section titles.

**Architecture:** Each section is its own component in `src/components/sections/`. Server data (projects, articles) is loaded in `src/app/(site)/page.tsx` and passed down as props; section components stay presentational. A shared `SectionTitle` gives every section the same handwritten heading.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, motion, vitest + Testing Library (jsdom per file).

**Spec:** `docs/superpowers/specs/2026-11-07-home-redesign-design.md`

## Global Constraints

- All work in `apps/portfolio`, branch `feat/home-redesign`. Follow `CLAUDE.md` (semantic tokens only, no hex; `&apos;` in JSX text; default exports for components; constants in `src/lib/constants.ts`).
- Handwriting font: Caveat, weight 500, via `next/font/google`, CSS variable `--font-caveat`, Tailwind token `--font-hand` → utility `font-hand`. Used only by `SectionTitle`.
- Body text: key words `text-foreground`, the rest `text-muted-foreground`. No long dashes in any copy.
- One reading column: every section inside `container`, content `max-w-2xl`, left-aligned, same left edge. Only Highlights is wider (`bigger-container`).
- Must work in light and dark mode and at 390 px wide; respect reduced motion (content visible without animation).
- Component tests start with `// @vitest-environment jsdom` (vitest default is `node`), use `cleanup` in `afterEach`, like `locked-project.test.tsx`.
- Checks: `npm run lint`, `npm run typecheck`, `npm test` from `apps/portfolio`. Don't run `build`.

## Review Focus

- **A highlight slug that no longer exists** (renamed or deleted project file): the section shows the remaining projects, never crashes. Test in Task 4.
- **An article without `image`** (it's optional in the schema): its Writing row renders with no broken image. Test in Task 5.
- **Light mode:** the What I do drawings and tile backgrounds use tokens, so they stay visible on a white page. Checked in Task 7.
- **Phone width (390 px):** the Highlights row and Work rows don't overflow sideways. Checked in Task 7.
- **Reduced motion:** sections that animate in on scroll are visible with `prefers-reduced-motion: reduce`. Checked in Task 7.

---

### Task 1: Handwriting font and `SectionTitle`

**Files:**
- Modify: `src/app/(site)/layout.tsx` (add Caveat next to `Source_Serif_4`)
- Modify: `src/app/(site)/globals.css` (`@theme inline`: add `--font-hand: var(--font-caveat, cursive);`)
- Create: `src/components/section-title.tsx`
- Test: `src/components/section-title.test.tsx`

**Interfaces:**
- Produces: `export default function SectionTitle({ children, className }: { children: React.ReactNode; className?: string })` renders `<h2 className="font-hand text-4xl leading-none …">`.

- [ ] **Step 1: Write the failing test** `renders a level-2 heading in the handwriting font`: render `<SectionTitle>Writing</SectionTitle>`; expect `getByRole('heading', { level: 2, name: 'Writing' })` to exist and its `className` to contain `font-hand`; with `className="mt-4"` the class is also present.
- [ ] **Step 2: Run** `npx vitest run src/components/section-title.test.tsx`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement.** Caveat: `subsets: ['latin']`, `weight: ['500']`, `variable: '--font-caveat'`, `display: 'swap'`; add `${caveat.variable}` to the `<body>` class list. `SectionTitle` merges `className` with `cn`.
- [ ] **Step 4: Run the test.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(home): handwritten section titles with Caveat`.

### Task 2: Intro (hero)

**Files:**
- Modify: `src/components/sections/hero.tsx` (full rewrite, keep default export `Hero`)
- Test: `src/components/sections/hero.test.tsx`

**Interfaces:**
- Consumes: `LocalTime` from `@/components/local-time` (unchanged).
- Produces: `Hero` (no props), used by `page.tsx`.

- [ ] **Step 1: Write the failing tests:**
  - `shows the name row`: image with alt `Kiran Pingle` (src `/images/home/avatar-sm.png`), text `Kiran Pingle`, text `Product Design Director, Rakuten`.
  - `shows the three intro paragraphs`: `getByText(/good products need all four to agree/)`, `getByText(/clarity comes from systems, not screens/)`.
  - `links to articles and projects in the last paragraph`: `getByRole('link', { name: 'Articles' })` has `href="/articles"`, `getByRole('link', { name: 'Projects' })` has `href="/projects"`.
  - `has no buttons, and the name is the only h1`: `queryAllByRole('button')` is empty; `getAllByRole('heading', { level: 1 })` has length 1 with text `Kiran Pingle`.
- [ ] **Step 2: Run** `npx vitest run src/components/sections/hero.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement.** Keep the `hero-padding` section, existing stagger-in and scroll fade. Inside `container` → `max-w-2xl`: `LocalTime`; name row (`next/image` 48×48, `rounded-xl`; name as `<h1 className="text-base">Kiran Pingle</h1>`, role in `text-muted-foreground`); three `<p>` in `text-muted-foreground text-lg leading-relaxed space-y-4`, key words in `<strong className="text-foreground font-medium">`. Copy verbatim from the spec, section 1. Links use `link-underline text-foreground`.
- [ ] **Step 4: Run the tests.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(home): personal intro with name row and three paragraphs`.

### Task 3: What I do tiles

**Files:**
- Modify: `src/components/sections/what-i-do.tsx` (keep named export `WhatIDo({ className })`; also used by `about.tsx`)
- Create: `src/components/sections/what-i-do-art.tsx` (the four drawings)
- Test: `src/components/sections/what-i-do.test.tsx`

**Interfaces:**
- Consumes: `SectionTitle` (Task 1).
- Produces: `WhatIDo({ className }: { className?: string })`, unchanged signature. `what-i-do-art.tsx` exports `FlowArt`, `SwatchArt`, `TeamArt`, `CodeArt` (no props, `aria-hidden="true"` on the root).

- [ ] **Step 1: Write the failing tests:**
  - `shows the title and intro line`: heading level 2 `What I do`; text `Design, systems, and code for products where clarity is non-negotiable.`
  - `shows four tiles in order`: `getAllByRole('heading', { level: 3 }).map(h => h.textContent)` equals `['Product design', 'Design systems', 'Design leadership', 'Frontend engineering']`.
  - `each tile has its one sentence`: e.g. `getByText('Tokens and components that let design and engineering scale together.')`.
  - `has no tags`: `queryByText('Figma')` and `queryByText('TypeScript')` are null.
- [ ] **Step 2: Run** the test. Expected: FAIL.
- [ ] **Step 3: Implement.** Data array in the file: `{ title, description, Art }`, using the four sentences from the spec table, verbatim. Layout: `ul` with `grid grid-cols-1 gap-3 sm:grid-cols-2`; each `li` is a shadcn `Card` (`bg-muted/40`, fixed `min-h-56`, flex column; art fills the top, `h3` + `p` at the bottom). Drawings from the spec table, built from `div`s with `border-border`, `bg-background`, `bg-foreground`, `bg-muted-foreground`, `bg-success` (swatches) etc. No icons, no `Badge`. Keep the existing `whileInView` rise.
- [ ] **Step 4: Run the tests.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(home): What I do as four illustrated tiles`.

### Task 4: Highlights

**Files:**
- Modify: `src/lib/constants.ts` (add `HIGHLIGHT_PROJECT_SLUGS`)
- Modify: `src/lib/projects.ts` (add `getProjectsBySlugs`)
- Create: `src/components/sections/highlights.tsx`
- Test: `src/lib/projects.test.ts`, `src/components/sections/highlights.test.tsx`

**Interfaces:**
- Consumes: `getProjectBySlug`, `ProjectFrontmatter`, `SectionTitle`.
- Produces:
  - `export const HIGHLIGHT_PROJECT_SLUGS = ['fintech-components', 'finance-dashboard', 'smart-home-dashboard'] as const;`
  - `export async function getProjectsBySlugs(slugs: readonly string[]): Promise<ProjectFrontmatter[]>`: frontmatter in the given order, unknown slugs skipped.
  - `export default function Highlights({ projects }: { projects: ProjectFrontmatter[] })`

- [ ] **Step 1: Write the failing tests:**
  - `projects.test.ts` › `returns projects in the order asked`: `getProjectsBySlugs(HIGHLIGHT_PROJECT_SLUGS)` → names `['Fintech Components', 'Finance Dashboard', 'Smart Home Dashboard']`.
  - `projects.test.ts` › `skips a slug that does not exist`: `getProjectsBySlugs(['fintech-components', 'no-such-project'])` → length 1. (Review Focus.)
  - `highlights.test.tsx` › `links each card to its showcase in a new tab`: render with two fake projects (`name`, `description`, `image`, `liveUrl: '/showcase/a'`); each link has `href` = `liveUrl`, `target="_blank"`, `rel` containing `noopener`; the image has alt = `name`; the description text shows; no year text (`queryByText(/20\d\d/)` is null).
  - `highlights.test.tsx` › `renders nothing when there are no projects`: `container.firstChild` is null.
- [ ] **Step 2: Run** both tests. Expected: FAIL.
- [ ] **Step 3: Implement.** `getProjectsBySlugs`: `Promise.all(slugs.map(getProjectBySlug))`, keep non-null `.frontmatter`. `Highlights`: `section` with `SectionTitle` in the reading column, then a `ul` in `bigger-container` with `grid gap-4 sm:grid-cols-3`; each card a `Link` around `next/image` (`aspect-video`, `object-cover`, `rounded-xl`, `border`), name in `text-foreground`, description in `text-muted-foreground`. Phone: one column (no horizontal scroll).
- [ ] **Step 4: Run the tests.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(home): Highlights row of showcase projects`.

### Task 5: Writing list

**Files:**
- Modify: `src/lib/constants.ts` (add `HOME_ARTICLE_SLUGS`, the five slugs now hard-coded in `page.tsx`, same order)
- Create: `src/components/sections/writing.tsx`
- Test: `src/components/sections/writing.test.tsx`

**Interfaces:**
- Consumes: `ArticleFrontmatter`, `SectionTitle`.
- Produces: `export const HOME_ARTICLE_SLUGS = ['design-to-motivate', 'stop-bringing-more-options-to-the-meeting', 'nature-shipped-it-first', 'stop-making-users-read-your-dashboard', 'proactive-ux'] as const;` and `export default function Writing({ articles }: { articles: ArticleFrontmatter[] })`.

- [ ] **Step 1: Write the failing tests:**
  - `links each row to its article`: two fake articles → links with `href` `/articles/<slug>`, title and description visible.
  - `shows a thumbnail only when the article has an image`: article A with `image`, B without → exactly one `img` (alt = A's title). (Review Focus.)
  - `links to all articles`: `getByRole('link', { name: /read all/i })` has `href="/articles"`.
- [ ] **Step 2: Run** the test. Expected: FAIL.
- [ ] **Step 3: Implement.** `SectionTitle` "Writing", then `ul` with `divide-y border-y`; each row a `Link` (flex: 80×56 `next/image` `rounded-lg` when present, title `text-foreground`, description `text-muted-foreground line-clamp-2`, `ArrowRight` aria-hidden at the end). "Read all" under the list with `link-underline`. Leave `latest-writing.tsx` untouched (the articles pages use it).
- [ ] **Step 4: Run the tests.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(home): Writing list`.

### Task 6: Work rows

**Files:**
- Modify: `src/components/sections/experience.tsx` (only used by the home page; rewrite, keep default export `Experience`)
- Test: `src/components/sections/experience.test.tsx`

**Interfaces:**
- Consumes: `SectionTitle`.
- Produces: `Experience` (no props).

- [ ] **Step 1: Write the failing tests:**
  - `shows the four jobs in order with their periods`: companies `['Rakuten Mobile', 'Rakuten Inc.', 'Reliance Jio', 'Winjit Technologies']` in document order; text `Product Design Director`, `2022 - Present`, `2008 - 2015`.
  - `has the Work title and no skills list`: heading level 2 `Work`; `queryByText('Stakeholder Management')` is null.
- [ ] **Step 2: Run** the test. Expected: FAIL.
- [ ] **Step 3: Implement.** Keep the existing `experiences` data (company, href, role, period); delete `skills` and the per-job skill indexes. `ul` with `divide-y border-y`; each `li` flex `justify-between`: company (a link to `href`, new tab, `link-underline`) over role in grey; period on the right in `text-muted-foreground tabular-nums`.
- [ ] **Step 4: Run the tests.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(home): Work as simple rows`.

### Task 7: Assemble the page and check it

**Files:**
- Modify: `src/app/(site)/page.tsx`
- Delete: `src/components/sections/design-motivation.tsx` (only the home page used it; the article stays)

**Interfaces:**
- Consumes: everything above, `getAllArticles`, `getProjectsBySlugs`, `HIGHLIGHT_PROJECT_SLUGS`, `HOME_ARTICLE_SLUGS`.

- [ ] **Step 1: Rewrite `page.tsx`.** Load `projects = await getProjectsBySlugs(HIGHLIGHT_PROJECT_SLUGS)` and pick articles by `HOME_ARTICLE_SLUGS` (same `flatMap` lookup as today). Render, each in its own `section-padding` block with `container` → `max-w-2xl` except Highlights: `<Hero />`, `<WhatIDo />`, `<Highlights projects={projects} />`, `<Writing articles={articles} />`, `<Experience />`. Remove `Principles`, `DesignMotivation`, the commented `BrandsScroll` import and the `border-b` dividers between sections.
- [ ] **Step 2: Delete `design-motivation.tsx`.** Run `grep -rn "design-motivation'" src`. Expected: no imports left.
- [ ] **Step 3: Run checks** from `apps/portfolio`: `npm run lint && npm run typecheck && npm test`. Expected: all pass.
- [ ] **Step 4: Look at it.** On `http://localhost:3000/`, take screenshots at 1280 px in dark and light mode, and at 390 px in dark mode, with reduced motion on. Expected:
  - every section shares one left edge, and only Highlights is wider
  - the handwritten titles render in Caveat
  - the drawings are visible in light mode
  - nothing scrolls sideways at 390 px
  - all sections are visible with reduced motion
- [ ] **Step 5: Commit** `feat(home): new page order; Principles and Design to motivate leave the home page`.
