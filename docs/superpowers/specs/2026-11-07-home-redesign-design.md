# Home page redesign

Status: approved by Kiran, 2026-11-07

Calls Claude made (check these while reading):

- Role under the name in place of "Tokyo, Japan", since the pill already says Tokyo.
- "Hi, I'm Kiran" is dropped; the name row already says who it is.
- What I do: icons and tags removed, sentences shortened.
- Highlights: cover images, no year, opens in a new tab.
- Caveat as the handwriting font.

## Intent

The home page reads like a marketing page: a big centred headline, two buttons, a services grid, then long blocks of essay text. Kiran wants it to feel personal and calm, like a person talking, and to show work they have made, not only describe what they do.

The inspiration is a single-column personal site (a dark, narrow column; a small photo + name row; short paragraphs with key words in white; handwritten section titles; a row of illustrated highlight cards; plain lists for writing and work). We borrow its structure and restraint, never its words or its owner's identity.

## Goals

- A visitor understands who Kiran is, where they work and how they think within the first screen, in their own voice.
- Kiran's real work (the showcase projects) is visible on the home page. Today it isn't.
- Every section is calm: fewer boxes, fewer tags, more white space, one reading column.
- Works in light and dark mode and at phone width (390 px).

## Non-goals

- The About page. It is a separate piece of work, designed after this one.
- New content (new articles, new projects, new case studies).
- Changes to the navbar, footer, `/projects`, `/articles` or the showcase.

## Anti-goals (a failure even if it works)

- Copying the reference's wording or look so closely that it reads as someone else's site.
- Clutter coming back: tag clouds, icon badges, cards inside cards, long paragraphs on the home page.
- Text that sounds generated: long dashes, filler adjectives, claims Kiran wouldn't say out loud.

## Page order

1. Intro (hero)
2. What I do
3. Highlights
4. Writing
5. Work

Removed from the home page:

- **Principles.** Already shown on the About page (`about.tsx`), so the home copy was a duplicate.
- **Design to motivate** (with the pyramid). It is the article `design-to-motivate`. It becomes a row in Writing instead.

## Shared look (Kiran's decisions)

- **One reading column**, left-aligned, the same left edge for every section. Highlights is the only part wider than the column.
- **Handwritten section titles** ("What I do", "Highlights", "Writing", "Work") in Caveat (Google Fonts, weight 500), loaded with `next/font` as `--font-caveat` and exposed as the `font-hand` Tailwind utility. Caveat is used only for these titles. All other text stays Geist, per CLAUDE.md.
- Key words in body text are `text-foreground`; the rest is `text-muted-foreground`.
- Semantic tokens only (no hex), shadcn components where one fits, existing `container` / `section-padding` / `link-underline` utilities.

## 1. Intro (hero): decided

From top to bottom:

1. The **Tokyo local-time pill**, exactly as it is today (`LocalTime`).
2. A **name row**: Kiran's small rounded-square photo, "Kiran Pingle", and under it "Product Design Director, Rakuten". (Claude's call: role in place of "Tokyo, Japan", because the pill already says Tokyo.)
3. **Three short paragraphs**, Kiran's chosen copy, verbatim:
   - "I lead product design at **Rakuten**. I work across **strategy**, **interaction**, **design systems**, and **frontend**, because good products need all four to agree."
   - "Before Rakuten I was at **Reliance Jio**, where design had to work for hundreds of millions of people. That taught me that clarity comes from systems, not screens."
   - "I write about what I learn on [Articles](/articles), and share my work on [Projects](/projects)."

Removed: the centred layout, the big headline, both buttons, "👋 Hi! I am Kiran Pingle", the role line and the "Rakuten · Jio" footnote.

Keep the existing gentle stagger-in on load and respect reduced motion.

## 2. What I do: decided (option "C-b")

- Title "What I do" (handwritten), then the existing line: "Design, systems, and code for products where clarity is non-negotiable."
- A **2 × 2 grid of tiles** inside the column (one column on phones).
- Each tile: a small, quiet drawing on top, then the title and one sentence at the bottom. No icons, no tags.

| Tile | Drawing | Sentence |
|---|---|---|
| Product design | three small screens linked left to right, the last one highlighted | From research and flows to an interface people get at first glance. |
| Design systems | a 3 × 2 grid of colour swatches using the theme's own tokens | Tokens and components that let design and engineering scale together. |
| Design leadership | four overlapping round avatars | Teams and partners aligned, so strong work ships consistently. |
| Frontend engineering | a short line of code, e.g. `<Card tone="calm" />` | I build what I design, so the details survive to production. |

The drawings are built in markup with theme tokens (no images), so they follow light and dark mode. The component is shared with the About page, so About gets the new tiles too.

## 3. Highlights: decided in outline

- Title "Highlights" (handwritten).
- A row of **three cards** for the showcase projects: Fintech Components, Finance Dashboard, Smart Home Dashboard (all in `content/projects/`, category `upcoming`).
- The row is **wider than the reading column**, like the reference; it stacks or scrolls on phones.
- Each card shows the project's existing cover image (`image` in its frontmatter, 1600 × 900), cropped to the card. (Claude's call, delegated by Kiran: real work over new drawings.)
- Under each card: the project name, and one short line from its `description` below. No year: projects have no date field and all three are still `upcoming`. (Claude's call, delegated by Kiran.)
- Each card opens the project's `liveUrl` (`/showcase/<slug>`) in a new tab, the same way the showcase already opens. (Claude's call.) Locked projects keep working as today through the existing access flow.
- The list of three slugs lives in `src/lib/constants.ts`; name, description, image and URL come from the project content, so nothing is duplicated.

## 4. Writing: decided in outline

- Title "Writing" (handwritten).
- A plain list, each row: the article's thumbnail on the left, title, one line of description, an arrow on the right, a thin divider between rows.
- Same five articles as today's "Recent stories", in the same order (`design-to-motivate` first), plus a "Read all" link to `/articles`.

## 5. Work: decided in outline

- Title "Work" (handwritten).
- Simple rows, divided by thin lines: company on the first line, role underneath in grey, period on the right.
- Same four jobs as today's `experience.tsx`: Rakuten Mobile, Rakuten Inc., Reliance Jio, Winjit Technologies.
- The skills list in today's Experience section is not shown on the home page.

## Constraints

- Next.js 16 app in `apps/portfolio`, `(site)` route group; follow `CLAUDE.md`.
- Section components in `src/components/sections/`; constants in `src/lib/constants.ts`.
- Must pass `npm run lint`, `npm run typecheck`, `npm test`.
- No hard-coded colours; must look right in light and dark mode.

## Left to the builder

- Exact sizes, spacing and breakpoints, within the existing utilities.
- How the Highlights row behaves on phones (stack or horizontal scroll), as long as nothing is cut off awkwardly.
- Motion details (stagger timings), as long as reduced motion is respected.
- Whether the Writing and Work sections are new components or reworked versions of `latest-writing.tsx` and `experience.tsx`, as long as other pages that use them keep working.
