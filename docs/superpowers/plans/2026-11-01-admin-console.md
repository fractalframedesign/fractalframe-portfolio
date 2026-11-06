# Admin Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/admin` into a dashboard console like shadcnblocks-admin (sidebar, top bar, stat cards, one page per section) over the existing access data and actions.

**Architecture:** A nested route group `(admin)/admin/(console)/` gets a shared layout (shadcn `Sidebar` + top bar + `next-themes`); `/admin/login` stays outside it. Each page loads its own data through query helpers in `src/lib/access/admin-queries.ts`; mutations reuse `src/app/(admin)/admin/actions.ts`. Navigation comes from one config list.

**Tech Stack:** Next.js 16 App Router, shadcn/ui (new-york, Radix), Tailwind 4, Drizzle + PGlite tests, vitest, `next-themes`, `cmdk` (via shadcn `command`), lucide.

**Spec:** `docs/superpowers/specs/2026-11-01-admin-console-design.md`

Paths are relative to `apps/portfolio/` unless they start with `docs/`.

## Global Constraints

- Follow repo `CLAUDE.md`: shadcn components, semantic tokens only (no hex, no arbitrary colours), `&apos;` in JSX text, default exports for components, named exports for icons, single quotes, semantic HTML.
- Keep `(admin)` isolated: styles only in `src/app/(admin)/admin.css`; never import another group's CSS.
- Add shadcn components with `npx shadcn@latest add <names> --dry-run` first. Never install the `cn` package, never overwrite an existing `src/components/ui/*` file without listing the diff in the report, and never write CSS variables into `src/app/(site)/globals.css`. Admin sidebar tokens already exist in `admin.css` (`--sidebar`, `--sidebar-foreground`, `--sidebar-muted-foreground`, `--sidebar-primary(-foreground)`, `--sidebar-accent(-foreground)`, `--sidebar-border`, `--sidebar-ring`).
- Every admin page and every server action calls `await requireAdmin()` first (`src/lib/access/require-admin.ts`).
- Status colours: success = active, warning = paused, info = password protected, destructive = expired/errors, neutral (muted) = public/default. Badges use the `*-subtle` / `*-subtle-foreground` pairs.
- One verb: **Invite** (button "Invite", dialog title "Invite someone", empty states "Invite someone, or approve a request").
- Counts (spec "Settled" 3): Active guests = distinct guests with ≥1 grant `status = 'active'` and (`expiresAt` null or > now); Expiring this week = active grants with `now < expiresAt ≤ now + 7 days`; Protected projects = level `unlocked`; Requests waiting = status `pending`.
- Dates shown in `LOCATION.timeZone` via existing `formatAdminDate` / `lastVisitLabel` / `timeLeftLabel`; numbers `tabular-nums`.
- Lint 0 errors, `npm run typecheck`, `npm test` pass in `apps/portfolio`; never run `npm run build`. Stage only your files; never stage `videos/intro/*`; no Co-Authored-By.

## Review Focus

1. **A project switched Protected → Public by mistake** — the AlertDialog must appear before any write, and Cancel must leave the level unchanged. (Task 4 test `cancel keeps the project protected`.)
2. **A failed save on the access switch** — the switch returns to the old value and shows the error; "Saved" never appears. (Task 4 test `failed save reverts and shows the error`.)
3. **Guests filter URL with an unknown project or status** (`?project=nope&status=weird`) — ignored, full list shown, no crash. (Task 6 test `ignores unknown filters`.)
4. **⌘K guest search with one character or punctuation like `%`** — no query below 2 characters; `%`/`_` matched literally, not as wildcards. (Task 1 test `searchGuests treats % literally`.)
5. **Narrow screens** — sidebar becomes a sheet opened from a trigger in the top bar; nothing overflows horizontally at 375 px. (Task 2 manual check.)

---

## File Structure

```
src/lib/admin-nav.ts                         nav config (groups, items, soon flag)
src/lib/access/admin-queries.ts              getOverview, getProjectRows, getGuestRows, searchGuests, countPendingRequests
src/app/(admin)/layout.tsx                   (modify) ThemeProvider (admin only)
src/app/(admin)/admin/(console)/layout.tsx   sidebar + top bar shell
src/app/(admin)/admin/(console)/page.tsx     Overview      (moved from admin/page.tsx)
src/app/(admin)/admin/(console)/requests/page.tsx
src/app/(admin)/admin/(console)/projects/page.tsx
src/app/(admin)/admin/(console)/guests/page.tsx           (moved from admin/guests)
src/app/(admin)/admin/search-actions.ts      searchGuestsAction (server action)
src/components/admin/console/                app-sidebar, top-bar, theme-toggle, command-menu,
                                             stat-card, section-card, access-switch,
                                             protected-project-card, guests-table, guests-filters,
                                             requests-table
```
Existing `src/components/admin/*` (add-guest-dialog, expiry-field, password-reveal, copy-button, grant-status-badge, confirm-dialog, request-inbox, guest-table, guest-list, level-select, admin-header) are reused or removed where a task says so.

---

### Task 1: Query helpers

**Files:** Create `src/lib/access/admin-queries.ts`, `src/lib/access/admin-queries.test.ts`

**Interfaces:**
- Consumes: `Db`, tables in `src/lib/db/schema.ts`, `resolveLevel`, `canBeUnlocked`, `isGrantActive`, `getAllProjects()`.
- Produces:
  - `type OverviewStats = { requestsWaiting: number; protectedProjects: number; activeGuests: number; expiringThisWeek: number }`
  - `type ExpiringGrant = { grantId: string; guestName: string; projectSlug: string; expiresAt: Date }`
  - `type ProtectedProjectRow = { slug: string; name: string; guestCount: number }` (guestCount = active, unexpired grants)
  - `getOverview(db: Db, now: Date): Promise<{ stats: OverviewStats; waiting: PendingRequest[]; expiring: ExpiringGrant[]; protected: ProtectedProjectRow[] }>` — `waiting` max 5 newest, `expiring` max 5 soonest. Fixed number of queries (no per-project loop).
  - `type ProjectRow = { slug: string; name: string; level: AccessLevel; hasDemo: boolean; guestCount: number }`
  - `getProjectRows(db: Db, now: Date): Promise<{ demo: ProjectRow[]; other: ProjectRow[] }>` — `demo` = `canBeUnlocked`, MDX order.
  - `type GuestFilters = { project?: string; status?: 'active' | 'paused' | 'expired' }`
  - `parseGuestFilters(params: Record<string, string | string[] | undefined>, knownSlugs: string[]): GuestFilters` — unknown values dropped.
  - `getGuestRows(db: Db, filters: GuestFilters, now: Date): Promise<GrantView[]>` — one query; `expired` = expiresAt ≤ now regardless of status; `active` = active and unexpired.
  - `searchGuests(db: Db, query: string): Promise<Array<{ guestId: string; name: string; email: string | null }>>` — returns `[]` when `query.trim().length < 2`; case-insensitive match on name or email; `%` `_` `\` escaped; max 8.
  - `countPendingRequests(db: Db): Promise<number>`
  - `PendingRequest` = the row type `listPendingRequests` already returns (re-export it).
- [ ] **Step 1: Failing tests** (fresh `createTestDb()` + `seedProducts`; fixed `now = new Date('2026-11-01T00:00:00Z')`):
  - `stats count guests once across projects` — one guest with active grants on two unlocked projects → `activeGuests 1`.
  - `expiring this week excludes paused, never and 8-day grants` — grants expiring +3 d (active), +3 d (paused), null, +8 d → `expiringThisWeek 1`, `expiring.length 1`.
  - `protected projects list guest counts` — fintech with 2 active + 1 expired grant → `{ slug: 'fintech-components', guestCount: 2 }`.
  - `getProjectRows splits demo projects` — `demo` slugs equal the three `showcaseProjects` slugs; `other` contains `bloom`.
  - `getGuestRows filters by status expired` and `by project`.
  - `ignores unknown filters` — `parseGuestFilters({ project: 'nope', status: 'weird' }, slugs)` → `{}`.
  - `searchGuests treats % literally` — guests "50% off" and "Anna" → query `'%'` returns `[]` (length < 2), query `'0%'` returns only "50% off".
- [ ] **Step 2:** `npx vitest run src/lib/access/admin-queries.test.ts` → FAIL. **Step 3:** implement. **Step 4:** → PASS; full `npm test`, typecheck, lint.
- [ ] **Step 5: Commit** `feat(admin): console query helpers`

---

### Task 2: Console shell (sidebar, top bar, theme, nav config)

**Files:**
- Create: `src/lib/admin-nav.ts`, `src/lib/admin-nav.test.ts`, `src/app/(admin)/admin/(console)/layout.tsx`, `src/components/admin/console/app-sidebar.tsx`, `top-bar.tsx`, `theme-toggle.tsx`, `section-card.tsx`, `stat-card.tsx`
- Modify: `src/app/(admin)/layout.tsx` (wrap children in existing `ThemeProvider` from `@/components/providers/theme-provider` with `attribute="class" defaultTheme="light" enableSystem={false}`; add `suppressHydrationWarning` on `<html>`)
- Move: `src/app/(admin)/admin/page.tsx` → `(console)/page.tsx`, `src/app/(admin)/admin/guests/` → `(console)/guests/` (unchanged content for now; `/admin/login` stays where it is)
- Add shadcn: `sidebar sheet skeleton separator avatar` (dry run first; see Global Constraints)

**Interfaces:**
- Produces:
  - `type NavItem = { title: string; href: string; icon: LucideIcon; soon?: boolean; badge?: 'pendingRequests' }`; `type NavGroup = { label: string; items: NavItem[] }`; `export const ADMIN_NAV: NavGroup[]` = **Manage**: Overview `/admin` (LayoutDashboard), Requests `/admin/requests` (Inbox, badge pendingRequests), Projects `/admin/projects` (FolderKanban), Guests `/admin/guests` (Users); **Coming later**: Analytics `/admin/analytics` (ChartColumn, soon), Products `/admin/products` (Package, soon).
  - `isActiveNav(pathname: string, href: string): boolean` — `/admin` matches only exactly; others match prefix.
  - `AppSidebar({ pendingRequests }: { pendingRequests: number })` — header "Kiran · Admin"; groups from `ADMIN_NAV`; soon items rendered disabled (`aria-disabled`, no link) with a "Soon" badge; footer with name and a Log out form (`logout` from `@/app/(admin)/admin/login/actions`); `collapsible="icon"`; active item `aria-current="page"`.
  - `TopBar({ title }: { title: string })` — `SidebarTrigger`, page title (`h1`), slot for `CommandMenu` (Task 7; render a placeholder button until then), `ThemeToggle`.
  - `SectionCard({ title, icon, action?, children })` — shadcn `Card` with icon + title header (reference style).
  - `StatCard({ label, value, icon, href? })` — `Card`, value in `tabular-nums`.
  - Console layout: `await requireAdmin()`, `countPendingRequests` (catch → 0), `SidebarProvider` + `AppSidebar` + `SidebarInset` containing children. Page titles come from each page via `TopBar`.
- [ ] **Step 1: Failing tests** in `admin-nav.test.ts`: `isActiveNav('/admin','/admin')` true; `isActiveNav('/admin/guests','/admin')` false; `isActiveNav('/admin/guests?x=1'.split('?')[0],'/admin/guests')` true; Analytics and Products have `soon: true`; every non-soon href is unique.
- [ ] **Step 2–4:** FAIL → implement → PASS; typecheck, lint.
- [ ] **Step 5: Manual** (dev server, no DB is fine: pages show their error state): `/admin/login` renders without the sidebar; `/admin` (with a session) shows the sidebar, collapses to icons, becomes a sheet at 375 px with no horizontal scroll; theme toggle switches light/dark.
- [ ] **Step 6: Commit** `feat(admin): console shell with sidebar, top bar and theme`

---

### Task 3: Overview page

**Files:** Modify `src/app/(admin)/admin/(console)/page.tsx`; Create `src/components/admin/console/protected-project-card.tsx`

**Interfaces:**
- Consumes: `getOverview`, `StatCard`, `SectionCard`, `TopBar`, `AddGuestDialog` (`defaults.products?: string[]` preselect — add this optional field if missing), `GrantStatusBadge`.
- Page: `TopBar title="Overview"`; grid of 4 `StatCard`s (Requests waiting → `/admin/requests`, Protected projects → `/admin/projects`, Active guests → `/admin/guests?status=active`, Expiring this week → `/admin/guests?status=active`); two-column row: **Waiting for you** (name · project · date, Approve opens invite dialog prefilled as today's inbox does; empty "No requests waiting.") and **Expiring soon** (guest · project · `timeLeftLabel`; empty "Nothing expires this week."); **Protected projects** card listing rows with guest count and an **Invite** button opening the dialog with that project preselected. Database error → existing destructive Alert.
- [ ] **Step 1: Implement** (the data is covered by Task 1's tests; this page is layout only); typecheck, lint, `npm test`.
- [ ] **Step 3: Manual** (Preview, logged in): cards show correct counts for the existing "Test" guest; Invite preselects the project.
- [ ] **Step 4: Commit** `feat(admin): overview dashboard`

---

### Task 4: Projects page and access switch

**Files:** Create `src/app/(admin)/admin/(console)/projects/page.tsx`, `src/components/admin/console/access-switch.tsx`, `src/components/admin/console/access-switch.test.tsx`; add shadcn `alert-dialog`; Delete `src/components/admin/level-select.tsx` after its last use is gone.

**Interfaces:**
- Consumes: `getProjectRows`, `setProjectLevel(slug, level)` (existing action, returns `{ ok } | { ok: false, error }`), `ProtectedProjectCard` pattern.
- Produces: `AccessSwitch({ slug, name, level, hasDemo, onSave? })` client component. Options: Public, Password protected (only when `hasDemo`), Hidden (only when current level is `admin`). Waits for the server (no optimistic change): disabled + "Saving…" while pending, then `<p role="status">Saved</p>` for 2 s, or reverts and shows `role="alert"` error. Protected → Public first opens `AlertDialog`: title "Make {name} public?", description "Anyone will be able to open it. People you invited keep their passwords for later.", actions **Make public** / **Cancel**. `onSave` defaults to `setProjectLevel` (injectable for tests).
- Page: `TopBar title="Projects"`; demo projects as `SectionCard`s in a grid (name, `AccessSwitch`, guest count, info badge "Password protected" when unlocked, **Invite** when unlocked); **Always public** `SectionCard` listing other projects in a compact list (name + muted "Public", or `AccessSwitch` when level is `admin`).
- [ ] **Step 1: Failing tests** (`@testing-library/react` + `jsdom` — add as devDeps and a per-file `// @vitest-environment jsdom` comment):
  - `cancel keeps the project protected` — level unlocked → choose Public → dialog shown → Cancel → `onSave` not called, value still "Password protected".
  - `confirm makes it public and shows Saved` — Make public → `onSave('fintech-components','public')` called once → status text "Saved".
  - `failed save reverts and shows the error` — `onSave` resolves `{ ok: false, error: 'Couldn’t save. Try again.' }` → value back to previous, alert text shown, no "Saved".
  - `public to protected saves without asking`.
- [ ] **Step 2–4:** FAIL → implement → PASS; full checks.
- [ ] **Step 5: Commit** `feat(admin): projects page with confirmed access changes`

---

### Task 5: Requests page

**Files:** Create `src/app/(admin)/admin/(console)/requests/page.tsx`, `src/components/admin/console/requests-table.tsx`; reuse/retire `request-inbox.tsx` (move its approve-dialog wiring into `requests-table.tsx`; delete `request-inbox.tsx` once unused).
- Page: `TopBar title="Requests"`; `SectionCard` with a `Table`: Name (+ email muted), Project, Message (line-clamp 2, full text in a tooltip), Received, actions **Approve** (opens invite dialog prefilled, `requestId` set) and **Decline** (`declineRequest`). Empty state with inbox icon: "No requests waiting. New requests from the unlock page appear here."
- [ ] **Step 1: Implement**; typecheck, lint, tests.
- [ ] **Step 2: Manual** (Preview): send a request from the unlock page, see it here and in the sidebar badge; Approve creates the invite and the row disappears.
- [ ] **Step 3: Commit** `feat(admin): requests page`

---

### Task 6: Guests page

**Files:** Modify `src/app/(admin)/admin/(console)/guests/page.tsx`; Create `src/components/admin/console/guests-table.tsx`, `guests-filters.tsx`; delete `guest-table.tsx` / `guest-list.tsx` once unused (move their row menu, expiry dialog, edit dialog and delete confirm into `guests-table.tsx` or small sibling files).

**Interfaces:**
- Consumes: `parseGuestFilters`, `getGuestRows`, existing actions `setGrantStatus`, `changeExpiry`, `newPassword`, `removeGrant`, `deleteGuest`, `updateGuest`.
- Page reads `searchParams`, `TopBar title="Guests"`, filters bar (`Select` Project: All + unlocked projects; `Select` Status: All/Active/Paused/Expired) writing to the URL, **Invite** button (dialog with no preselection), `SectionCard` with `Table`: Guest (name, email), Project, Status badge, Time left, Last visit, Visits (`tabular-nums`), row `DropdownMenu` (first row per guest carries `id="guest-<guestId>"` for the command menu): Pause/Resume, Change expiry, New password, Edit name & note, Remove from project (confirm), Delete guest (confirm, `AlertDialog`). Empty: "No one has access yet. Invite someone, or approve a request." / filtered empty: "No guests match these filters. Clear filters" (link to `/admin/guests`).
- [ ] **Step 1: Failing test** (jsdom) `guests-filters.test.tsx`: changing Status to Paused calls the router with `?status=paused` keeping `project`; "All" removes the param.
- [ ] **Step 2–4:** FAIL → implement → PASS; full checks.
- [ ] **Step 5: Commit** `feat(admin): guests page with filters`

---

### Task 7: ⌘K command menu

**Files:** Create `src/app/(admin)/admin/search-actions.ts`, `src/components/admin/console/command-menu.tsx`; add shadcn `command`; Modify `top-bar.tsx` to render `CommandMenu`.

**Interfaces:**
- `searchGuestsAction(query: string): Promise<Array<{ guestId: string; name: string; email: string | null }>>` — `'use server'`, `await requireAdmin()` first, zod `z.string().max(100)`, then `searchGuests(getDb(), query)`; errors → `[]` (logged).
- `CommandMenu({ projects }: { projects: { slug: string; name: string }[] })` — opens on ⌘K / Ctrl+K and from the top-bar button (label "Search…" with `⌘K` kbd); groups **Pages** (from `ADMIN_NAV`, non-soon), **Projects** (→ `/admin/projects#<slug>`), **Guests** (debounced 250 ms server search, only from 2 chars; selecting one navigates to `/admin/guests#guest-<guestId>`; Task 6's table gives each guest's first row `id="guest-<guestId>"` and `scroll-mt-20`). Projects list passed from the console layout (`getAllProjects` names only).
- [ ] **Step 1: Failing test** `search-actions.test.ts`: without an admin session it redirects (mock `requireAdmin` to throw `NEXT_REDIRECT`) and never queries; with a session and query `'a'` returns `[]`.
- [ ] **Step 2–4:** FAIL → implement → PASS; full checks.
- [ ] **Step 5: Commit** `feat(admin): command menu`

---

### Task 8: Clean-up and docs

- Remove `admin-header.tsx` and any component left unused (grep for imports first); make all copy follow the Invite wording; confirm no file imports `level-select`, `request-inbox`, `guest-table`, `guest-list`.
- Update `CLAUDE.md` Architecture: admin console lives in `(admin)/admin/(console)/` with a shared sidebar layout; add a section = one entry in `src/lib/admin-nav.ts` + one route folder; access levels shown to Kiran are Public / Password protected.
- Update `docs/TODO.md` (console done, pending merge) and the spec status.
- [ ] Run `npm test`, `npm run lint`, `npm run typecheck` → clean.
- [ ] **Commit** `docs(admin): console architecture notes`
