# Admin console: dashboard layout

Date: 2026-11-01 · Branch: `feat/admin` · Status: approved by Kiran in chat

Builds on [2026-10-31-showcase-admin-design.md](2026-10-31-showcase-admin-design.md).
Nothing in the data model, access rules, passwords or the proxy changes.
This is a new shell and new screens over the existing repositories and
server actions.

## Why

Today `/admin` is one long page (Requests, a 17-row Projects table, then a
guest table per protected project). Kiran wants it to look and work like a
proper admin dashboard, specifically like
https://shadcnblocks-admin.vercel.app/ecommerce/dashboard-1, and to have room
for future sections (Analytics, then selling digital Products).

Two review findings also land here:
- Changing a project's access saves instantly with no feedback and no
  confirmation, so one slip can publish private work.
- Projects you can't change (no demo) take as much space as the three you can.

## Goals

1. A dashboard shell like the reference: a fixed **sidebar** with grouped
   navigation, the signed-in name and **Log out** at the bottom; a **top bar**
   with the page title, ⌘K search and a light/dark switch. The sidebar
   collapses to icons and becomes a sheet on small screens.
2. Pages, each its own route:
   - **Overview** `/admin`: four stat cards (Requests waiting · Protected
     projects · Active guests · Expiring this week), a "Waiting for you" card
     (pending requests with Approve), an "Expiring soon" card (active grants
     ending within 7 days), and a "Protected projects" card (name, guest
     count, Invite).
   - **Requests** `/admin/requests`: table of pending requests with Approve
     and Decline.
   - **Projects** `/admin/projects`: the three projects with a demo as cards
     first (access switch, guest count, Invite); every other project in a
     compact "Always public" list. JustOS-style hidden projects still show
     with their level so they can be switched back.
   - **Guests** `/admin/guests`: one table of all guests' grants, filterable
     by project and status, with the existing row menu (pause/resume, change
     expiry, new password, remove, delete guest, edit name/note). Replaces
     today's per-project tables and today's `/admin/guests` page.
3. Sidebar groups: **Manage** (Overview, Requests with a pending count badge,
   Projects, Guests) and **Coming later** (Analytics, Products) shown
   disabled with a "Soon" badge. Items come from one config list so a new
   section is one entry plus one route folder.
4. **Saving**: changes still save immediately and show a visible "Saved"
   (announced with `role="status"`). Switching a password-protected project
   to Public opens an `AlertDialog`: "Make {name} public? Anyone will be able
   to open it." with **Make public** / **Cancel**.
5. **⌘K**: a `Command` palette to jump to any page, project or guest.
6. **Light/dark** switch in the top bar using `next-themes`, scoped to the
   admin group. Default: light.
7. Wording: one verb, **Invite**, everywhere (button "Invite", dialog title
   "Invite someone", empty states "Invite someone, or approve a request").

## Non-goals

- Charts, trend percentages, analytics data (Analytics is a later section).
- Products, orders, payments.
- Any change to access rules, the database schema, passwords, the proxy or
  the public site.
- Multiple admins or roles.

## Look

- Follow the reference: neutral black/white surfaces, cards with an icon and
  a title in the card header, generous spacing, Geist Sans, numbers in
  `tabular-nums`.
- Colour only where it means something, using the tokens already in
  `(admin)/admin.css`: success = active, warning = paused, info = password
  protected, destructive = expired/errors, neutral = public/default. Sidebar
  uses the `--sidebar-*` tokens.
- shadcn components throughout: `Sidebar`, `Card`, `Badge`, `Table`,
  `DropdownMenu`, `Dialog`, `AlertDialog`, `Command`, `Select`, `Tooltip`,
  `Sheet`, `Separator`, `Skeleton`.

## Constraints

- Follow repo `CLAUDE.md` (shadcn, semantic tokens, no arbitrary colours,
  `&apos;`, default exports for components, single quotes) and keep the
  `(admin)` route group isolated (own layout and `admin.css`).
- Add shadcn components with `npx shadcn add <name> --dry-run` first: a
  dry run of `sidebar` wanted to install a junk `cn` package, overwrite 3
  existing components and write CSS variables into the site stylesheet.
  None of that is allowed; existing `src/components/ui/*` files must not be
  overwritten unless the change is reviewed, and admin CSS variables go only
  in `admin.css`.
- Every admin page and action keeps calling `requireAdmin()` first; the
  shared layout checks once, but pages and actions still check (actions can
  be posted to directly).
- Each page loads only its own data (per-page query helpers), and the
  dashboard must not issue one query per protected project.
- Lint, typecheck and tests pass; don't run `build`.

## Kiran's calls

- Layout and contents as in the sketch above, approved 2026-11-01.
- Two access choices only (Public / Password protected), from earlier.

## Claude's calls (Kiran may override)

- Default theme light; the switch remembers the choice per browser.
- "Expiring soon" = active grants ending within 7 days.
- Stat cards show counts only, no trends.
- Analytics and Products appear disabled with "Soon" rather than hidden, so
  the console's shape is visible now.
- Guests page filters live in the URL (shareable, survives reload).

## Left to the builder

Component file split under `src/components/admin/`, query helper names,
exact card icons (lucide), ⌘K result grouping, table column order, skeleton
and empty-state copy within the wording rule above, and tests.

## Settled after the builder check (Claude's calls)

1. **"Has a demo"** = `canBeUnlocked(slug)` (in `showcaseProjects`, `src/lib/showcase.ts`). Those projects always show as cards on Projects, whatever their level. Every other project goes in the "Always public" list; one that is currently hidden (e.g. JustOS) shows there with its level control so it can be switched back.
2. **⌘K search**: pages and projects are static lists in the layout; guests are searched lazily through a server action (`requireAdmin()` first) matching name and email, triggered after 2+ characters, max 8 results. No guest data loads in the layout.
3. **Counts** (one shared definition in the query helpers):
   - *Active guests* = distinct guests with at least one grant that is active and unexpired.
   - *Expiring this week* = active grants whose `expiresAt` falls within the next 7 days. Paused and never-expiring grants are excluded.
   - *Protected projects* = projects at level `unlocked`. *Requests waiting* = pending requests.
4. **`/admin/guests`** keeps its URL; the new page replaces its content. There were no per-guest URLs. Filters use `?project=<slug>&status=active|paused|expired`.
5. **Saving the access switch** waits for the server (not optimistic). Protected → Public opens the `AlertDialog` before any write; the switch shows a pending state, then "Saved", or reverts with an error.
6. **Theme**: `next-themes` (`attribute="class"`, default light) inside the admin layout only; its inline script prevents a flash, so localStorage is fine.
7. **Invite** buttons on Overview and Projects open the existing invite dialog with that project preselected; Who/Access sections unchanged.
