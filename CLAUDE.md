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

## Typography

- Font: Funnel Sans (weights: 300-800)
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

### Two isolated apps in one Next.js project

`apps/portfolio/src/app` has two route groups, each with its **own root layout and stylesheet**, so themes never leak between them:

- `(site)/` is the portfolio (home, about, articles, projects). Styles: `(site)/globals.css`.
- `(showcase)/showcase/` is the component showcase that opens in a new window. Styles: `(showcase)/showcase.css`.

Moving between the groups is a full page load. Never import one group's CSS from the other.

### Content

- MDX lives in `apps/portfolio/content/{articles,projects}/`. The file name is the slug.
- Frontmatter is validated with zod in `src/lib/schemas.ts` via the generic loader in `src/lib/content.ts`. Invalid frontmatter, or a `slug` that differs from the file name, fails the build with the file and field named.
- Add a frontmatter field in the schema first; the TypeScript types are derived from it (`src/lib/types.ts`).
- `src/app/sitemap.ts` and `robots.ts` are generated from the same content, so nothing needs registering by hand.

### Showcase projects

To add a showcase project:

1. Components go in `src/components/project-demos/<slug>/`. Use only the semantic tokens (`canvas`, `surface`, `surface-border`, `ink`, `ink-muted`, `accent-1..4`), never hex values.
2. Create `src/app/(showcase)/showcase/<slug>/` with `layout.tsx`, `page.tsx`, `docs/page.tsx`, `case-study/page.tsx` and `theme.css` (copy an existing project).
3. In `theme.css`, define the token values under `[data-project='<scope>']` only. No global `body` or `html` rules, no `@theme`.
4. Register the project in `src/lib/showcase.ts`.
5. Add the portfolio card as `content/projects/<slug>.mdx` with `category: upcoming`, `liveUrl: /showcase/<slug>` and `sourceUrl: /showcase/<slug>/docs`.

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
