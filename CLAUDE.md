# Project Rules

## Styling

- always use shadcn components
- Use Tailwind CSS utility classes - prefer utilities over custom CSS
- Use `space-y-*` for vertical spacing instead of flex with gap when appropriate
- Use utility classes like `hero-padding`, `section-padding`, `container`, `bigger-container` defined in globals.css
- For grids, use shorthand `gap-*` when X and Y gaps are equal. Only use explicit `gap-x-*` and `gap-y-*` when they need to be different
- Never use arbitrary color values like `bg-[#09090b]` - always check globals.css first and use semantic tokens (`bg-foreground`, `bg-primary`, `bg-muted`, etc.)
- For custom utilities with `@apply`, use `@layer utilities { .class { @apply ... } }` - not `@utility` which only accepts raw CSS

## Components

- Button component has built-in tooltip support via `tooltip` and `tooltipSide` props
- Use `asChild` prop with Button when wrapping Link components
- Icons should be placed in `src/components/icons/` with proper SVG props typing:
  ```tsx
  export const IconName = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      ...
    </svg>
  );
  ```

## Structure

- Section components go in `src/components/sections/`
- Layout components go in `src/components/layout/`
- UI components go in `src/components/ui/`
- Constants and config values go in `src/lib/constants.ts`
- Images organized by page: `public/images/home/`, `public/images/about/`, etc.
- Project detail (case study) components go in `src/components/sections/project/`; their images go in `public/images/projects/<slug>/`
- Showcase code and assets live in their own folders, never in the site folders above (see "Project details vs showcase")

## Typography

- Fonts: Geist Sans for all UI, headings and short copy; Source Serif 4 (`font-serif`) only for long-form article body text
- Handwritten section titles use Caveat (`font-hand`), only through `SectionTitle` (`src/components/section-title.tsx`). Don't use it for anything else
- Monospace (`font-mono`, system stack) only for code and demo labels
- already font medium set in globals.css don't need to set it again
- Headings use `font-display` and `font-weight-display` utilities
- Body text uses `font-text` and `font-weight-text` utilities

## MDX / Articles

### Setup

- Use `@tailwindcss/typography` plugin - import with `@plugin "@tailwindcss/typography"` in globals.css
- Keep MDX component definitions in the article page file, not in separate files
- Exception: Client components (e.g., code block with copy button) must be in separate files with `'use client'`

### Container Width Patterns

- When different elements need different max-widths (e.g., text narrower, code blocks wider):
  - Wrap text elements (h2, p, ul) in a container div: `<div className="container"><p>...</p></div>`
  - Never apply container classes directly to semantic elements - it overrides prose margin styles
  - Use `not-prose` on elements that break out to wider containers
  - Prose wrapper needs `max-w-none` to allow children to control their own widths
- Don't use arbitrary Tailwind values for breakouts - use existing container utilities

### Styling

- Use prose element modifiers for customization: `prose-a:`, `prose-lead:`, `prose-headings:`, etc.
- Use `not-prose` class to exclude elements from typography plugin styling
- MDX components should pass through `className` prop to allow custom styling per article

## Architecture

### Monorepo

npm workspaces + Turborepo. Run `npm install` and the `dev`, `lint`, `typecheck`, `test` and `build` scripts from the repo root.

- `apps/<name>/`: anything deployable (a Next.js site, a Remotion video). `packages/<name>/`: code or config shared by apps, named `@kiran/<name>`.
- Node is pinned once in `.nvmrc` (24). CI reads it, and Vercel reads `engines` in the root `package.json`. Change both together.
- One lockfile at the root. Never add a `package-lock.json` inside an app.
- Turborepo only passes listed env vars to a build. A new variable goes in the app's `src/lib/env.ts`, its `.env.example` and `env` in `turbo.json`.
- The admin console stays inside `apps/portfolio`. If a second app ever needs the database or access code, move `src/lib/db` and `src/lib/access` into `packages/` then, not before.

To add a standalone app:

1. Create `apps/<name>/` with its own `package.json` (`"name": "<name>"`, `"private": true`) and the scripts it supports from `dev`, `lint`, `typecheck`, `test` and `build`.
2. Extend `@kiran/typescript-config/nextjs.json` (Next.js) or `base.json` (anything else) in its `tsconfig.json`, and add `"@kiran/typescript-config": "*"` to `devDependencies`.
3. Run `npm install` at the root, and add `dev:<name>` (`turbo dev --filter=<name>`) to the root scripts.
4. For a site, create a new Vercel project with Root Directory `apps/<name>` and a `vercel.json` like the portfolio's (`--filter=<name>`).

### Isolated apps in one Next.js project

`apps/portfolio/src/app` has three route groups, each with its **own root layout and stylesheet**, so themes never leak between them:

- `(site)/` is the portfolio (home, about, articles, projects). Styles: `(site)/globals.css`.
- `(showcase)/showcase/` is the component showcase that opens in a new window. Styles: `(showcase)/showcase.css`.
- `(admin)/` is the admin area for the showcase. Styles: `(admin)/admin.css`.
  - The console lives in `(admin)/admin/(console)/` with a shared sidebar layout; `/admin/login` sits outside it.
  - Add a section with one entry in `src/lib/admin-nav.ts` and one route folder.

Moving between the groups is a full page load. Never import one group's stylesheet (`globals.css`, `showcase.css`, `admin.css`) from another group. A showcase project's own `theme.css` is not a group stylesheet: it belongs to that project, and a project detail page that embeds the demo imports it.

### Access levels and database

- Project access levels (Public / Unlocked / Admin) live in the database (Neon Postgres via Drizzle). Code is in `src/lib/db` and `src/lib/access`. Any project can be Unlocked, demo or not; the console row menu says **Add password** / **Make public**.
- Guests are people: one password per email opens every Unlocked project (case studies and demos, including ones locked later). Status and expiry live on `guests`; the proxy checks one `guest-pass` cookie (path `/`). The per-project `grants` table is kept, unused, for selling products later.
- A locked `/projects/<slug>` is rewritten by the proxy to the `(site)/locked/[slug]` teaser, so the full case study is never sent without access. Unlock and request actions live in `src/lib/access/actions/` and are shared by the teaser and `/showcase/unlock`.
- `SEED_LEVELS` in `src/lib/access/levels.ts` is only the initial seed, not the source of truth.
- The admin password is changed in the console (Settings) and stored as a scrypt hash in `admin_account`. `ADMIN_PASSWORD` in Vercel only works while that table is empty. Changing it signs out every older session. Forgotten password: run `DELETE FROM admin_account;` in the Neon SQL editor, then log in with `ADMIN_PASSWORD`.
- Migrations in `apps/portfolio/drizzle/` must be additive (no drops or renames), because Preview builds migrate the shared database.
- `npm test` (vitest) runs from the repo root or `apps/portfolio`.
- `npm run build` in the portfolio runs `env:check` first. On a production deploy a missing required variable stops the build; everywhere else it only warns.

### References (`/references/`)

`references/` at the repo root holds cloned repos and design notes kept for inspiration and learning. It is gitignored and is not part of the project.

- Read it for ideas only. Never import from it, link to its files, or copy its code in as-is.
- Anything taken from it must be rewritten to follow this file: shadcn components, semantic tokens (no hex values), the folder structure and the code style above.
- When a reference and these rules disagree, these rules win.
- Don't edit files in `references/` unless asked.

### Content

- MDX lives in `apps/portfolio/content/{articles,projects}/`. The file name is the slug.
- Frontmatter is validated with zod in `src/lib/schemas.ts` via the generic loader in `src/lib/content.ts`. Invalid frontmatter, or a `slug` that differs from the file name, fails the build with the file and field named.
- Add a frontmatter field in the schema first; the TypeScript types are derived from it (`src/lib/types.ts`).
- `src/app/sitemap.ts` and `robots.ts` are generated from the same content, so nothing needs registering by hand.

### Project details vs showcase

These are two different things. Do not call one by the other's name in code, comments or UI.

- **Project details** (case studies) are portfolio content. They are the cards on `/projects` and the pages at `(site)/projects/[slug]`.
  - Content: `content/projects/<slug>.mdx`. Components: `src/components/sections/project/`. Images: `public/images/projects/<slug>/` (cover and case-study images only).
  - They use the site's tokens and styles.
- **Showcase** projects are independent mini-projects (component sets with their own functions and visual style) that open in a new window at `(showcase)/showcase/<slug>`.
  - Each one is self-contained, like a small package inside the monorepo (rules below).
- One project can have both: a card or case study in the site, and a showcase. The only link between them is the frontmatter (`liveUrl: /showcase/<slug>`, `sourceUrl: /showcase/<slug>/docs`).
- Dependency direction: a showcase never imports from the site. A project detail page may embed a demo, and then imports that demo's components and its `theme.css`. `ShowcaseShell` is the only shared showcase chrome.

### Showcase projects

Each showcase project owns everything it uses:

```
src/components/project-demos/<slug>/   the project
  *.tsx                 its components
  ui/                   its own primitives (copied from shadcn, not imported from components/ui)
  lib/utils.ts          its own cn helper, plus any data or token builders it needs
  theme.css             its palette (see below)
src/app/(showcase)/showcase/<slug>/    routes only: layout, page, docs, case-study
public/showcase/<slug>/                assets its components use
```

- **Independence.** Files in `project-demos/<slug>/` import only npm packages and their own folder. Nothing from `@/components/ui`, `@/lib`, `@/components/showcase` or the site. Need a shared part? Copy it into the project's `ui/` or `lib/` and change it freely.
- **Tokens.** Use the standard shadcn names: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`, `border`, `input`, `ring`, `chart-1..5`. No hex values, palette names (`bg-blue-600`) or `white`/`black` utilities in components. Exceptions: third-party brand marks (Visa, Starbucks) and fixed illustrations (a camera feed picture), which stay literal.
- **One brand input.** `theme.css` puts the brand colours in `[data-project='<scope>']` as `--brand-primary` and similar. A `[data-preview='<scope>']` block then defines the standard tokens from them, and derives tints with relative colours (`--accent: oklch(from var(--primary) 0.94 0.03 h)`). Dark values go in `[data-preview='<scope>'].dark, .dark [data-preview='<scope>']`.
- **Check.** In the browser, set only `--brand-primary` on the `[data-project]` element. Everything in the demo should recolour. Anything still the old colour is an orphan value.
- **No global rules.** No `body` or `html` rules and no `@theme` in `theme.css`.

To add a showcase project:

1. Create `src/components/project-demos/<slug>/` with its components, `ui/`, `lib/utils.ts` and `theme.css` (copy `smart-home-dashboard` as the pattern).
2. Create `src/app/(showcase)/showcase/<slug>/` with `layout.tsx` (imports the project's `theme.css`), `page.tsx` (wraps the demo in `data-preview='<scope>'`), `docs/page.tsx` and `case-study/page.tsx`.
3. Put the demo's images in `public/showcase/<slug>/`.
4. Register the project in `src/lib/showcase.ts`. For a project with many components, set `layout: 'sections'` and build the page as a `ComponentGallery` (see `fintech-components`) or from `ComponentSection` bands.
5. Add the portfolio card as `content/projects/<slug>.mdx` (a project detail, not showcase) with `category: upcoming`, `liveUrl: /showcase/<slug>` and `sourceUrl: /showcase/<slug>/docs`.

Status: all four projects (`fintech-components`, `finance-dashboard`, `smart-home-dashboard`, `rakuten-link`) follow these rules. The one remaining literal set is Rakuten's brand-colour swatches on its project detail page, which document the real brand hex values on purpose.

A `[data-preview]` scope covers only the demo, never the page chrome around it (headings and captions use the showcase's own tokens). A project's `[data-project]` can appear twice on a page (layout wrapper and `ShowcaseShell`); the inner one wins, so test brand changes on the element closest to the demo.

### Checks

`npm run lint`, `npm run typecheck` and `npm run build` all run in CI on PRs to `staging` and `main`.

## Code Style

- Use `&apos;` for apostrophes in JSX text
- Prefer named exports for icons, default exports for components
- Keep components clean and focused
- No Co-Authored-By in commits
- Don't run build unless explicitly asked
- Use semantic HTML elements whenever possible (`ul`/`li` for lists, `section` for sections, `nav` for navigation, etc.)
- When refactoring components to be reusable, preserve the original layout structure (flex direction, alignment, spacing) - only add props for configurability
- Use nested object structures for constants with related properties:

  ```tsx
  // Good
  const items = [
    {
      image: { src: '', alt: '', classname: '' },
      emoji: { text: '', classname: '' },
    },
  ];

  // Bad
  const items = [
    {
      src: '',
      alt: '',
      className: '',
      emoji: '',
      emojiClassName: '',
    },
  ];
  ```
