# One Password Per Person, Any Project Lockable — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Any project can be locked from the console; a locked `/projects/<slug>` shows a teaser; one password per email (a site-wide guest pass) opens every locked project, now and later; repeat requests get "Resend access".

**Architecture:** Access moves from per-project grants to a person-level pass stored on `guests` (additive columns). The proxy gate checks one `guest-pass` cookie (path `/`) for every `unlocked` project and rewrites locked `/projects/<slug>` to a `(site)` teaser route. The `grants` table stays untouched for future purchases.

**Tech Stack:** Next.js 16 (proxy, server actions), Drizzle + Neon / PGlite tests, vitest + Testing Library, shadcn (Radix), Tailwind 4.

**Spec:** `docs/superpowers/specs/2026-10-31-password-any-project-design.md`

## Global Constraints

- Migrations additive only: no `DROP`, no `RENAME` (Preview migrates the shared production DB).
- `grants` table, its `source` enum and its rows are kept; new code doesn't read them except the one-off carry-over SQL.
- Fail closed: database error never makes a project more visible.
- Full case study HTML must never be served to a visitor without access; gated responses get `Cache-Control: private, no-store, max-age=0`.
- `(site)`, `(showcase)`, `(admin)` CSS never cross-imported. Shared client components go in `src/components/access/`.
- Copy: "Add password", "Make public", "Already a guest", "Resend access", "Invite someone". Apostrophes `’` in TS strings, `&apos;` in JSX text. Single quotes. shadcn + semantic tokens only.
- Every admin page/action calls `requireAdmin()` first. Don't run `build`.
- Run from `apps/portfolio`: `npm test`, `npm run typecheck`, `npm run lint`. Format with `npx prettier --single-quote --write <file>` (no repo config exists).

## Review Focus

1. A guest cookie from **before** the switch (`showcase-guest-<slug>`) — must simply stop granting access, never error. Test in Task 2.
2. **New password / Remove guest / Pause** while the visitor has the pass cookie — next request is locked. Test in Task 2.
3. Same email typed with different case or spaces (`Ada@X.com ` vs `ada@x.com`) on request and invite — one guest, "Already a guest" detected. Test in Tasks 1 and 6.
4. `next` param on unlock pointing off-project or off-site (`//evil.com`, `/admin`) — falls back to the project page. Test in Task 3.
5. A project made public or hidden while a visitor sits on the teaser and submits the password — "doesn’t need a password" error, no cookie. Test in Task 3.

---

### Task 1: Person-level access on guests (schema, carry-over, repo)

**Files:**
- Modify: `src/lib/db/schema.ts` (guests table)
- Create: `drizzle/0002_guest_pass.sql` (via `npx drizzle-kit generate --name guest_pass`, then append carry-over SQL)
- Create: `src/lib/access/repo/guest-access.ts`, `src/lib/access/repo/guest-access.test.ts`
- Modify: `src/lib/db/schema.test.ts` (no new table; leave list) — only if generate changes it

**Interfaces — Produces:**
- Columns on `guests`: `accessStatus` (`grant_status`, not null, default `'active'`), `accessExpiresAt` (timestamptz null), `lastVisitAt` (timestamptz null), `visitCount` (int not null default 0).
- `type GuestAccess = { guestId: string; name: string; email: string | null; note: string; status: 'active'|'paused'; expiresAt: Date | null; lastVisitAt: Date | null; visitCount: number; createdAt: Date }`
- `isAccessActive(row: { status; expiresAt }, now: Date): boolean` (reuse `isGrantActive` from `../expiry`)
- `inviteGuest(db, { name, email?, note?, expiresAt }): Promise<{ guestId; password; existing: boolean }>` — email normalised trim+lowercase; existing email → new password, status active, new expiry, name/note updated if given; else insert.
- `findGuestByPassword(db, password, now): Promise<{ guestId; passwordLookup } | null>` — null unless active.
- `getGuestPass(db, guestId, now): Promise<{ passwordLookup; active: boolean } | null>`
- `setGuestStatus(db, guestId, status)`, `setGuestExpiry(db, guestId, expiresAt)`, `recordGuestVisit(db, guestId, now)` (same 1-hour throttle as `recordVisit`), `findGuestByEmail(db, email)`.
- Existing `resetPassword`, `deleteGuest`, `updateGuest` in `repo/guests.ts` stay as they are.

- [ ] **Step 1: Write failing tests** in `guest-access.test.ts` (PGlite `createTestDb`):
  - `inviteGuest creates one active guest and returns a password` → `existing: false`, `findGuestByPassword(pw)` returns its id.
  - `inviting the same email (any case/spaces) renews: new password, old one stops` → second call with `' ADA@x.com '` gives `existing: true`, same guestId, old password → null, new → guest.
  - `paused or expired guests are not found by password` and `getGuestPass(...).active === false`.
  - `recordGuestVisit counts at most once an hour`.
  - `carry-over`: after `createTestDb()`, insert guests and grants, then re-run the carry-over statements with `db.execute(sql.raw(stmt))` for each statement read from `drizzle/0002_guest_pass.sql` after the `-- carry-over` marker (split on `--> statement-breakpoint`). Assert: guest with one active unexpired grant (expires D) → active, D; guest with a grant without expiry → expiresAt null; guest with only paused unexpired grants → paused; guest with only expired grants → active with latest expiry (shows expired); guest with no grants → paused.
- [ ] **Step 2:** `npx vitest run src/lib/access/repo/guest-access.test.ts` → FAIL (module missing).
- [ ] **Step 3:** Add columns to `guests` in `schema.ts`; run `npx drizzle-kit generate --name guest_pass`; check the SQL is only `ALTER TABLE "guests" ADD COLUMN …`; append `--> statement-breakpoint` + `-- carry-over` + one `UPDATE guests g SET access_status=…, access_expires_at=… FROM (subquery over grants grouped by guest_id)` implementing the rules above (and a second `UPDATE` setting `access_status='paused'` for guests with no grants). Implement `guest-access.ts`.
- [ ] **Step 4:** Run the test file → PASS; `npm test` → all pass.
- [ ] **Step 5:** Commit `feat(access): person-level guest access with carry-over from grants`.

### Task 2: Guest pass token, cookie and gate

**Files:**
- Modify: `src/lib/access/passwords.ts` (add pass token fns), `src/lib/showcase-access.ts` (cookie names/options), `src/lib/access/gate.ts`, `src/proxy.ts`
- Test: `src/lib/access/passwords.test.ts`, `src/lib/access/gate.test.ts`

**Interfaces — Produces:**
- `GUEST_PASS_COOKIE = 'guest-pass'`; `guestPassCookieOptions()` → `{ httpOnly: true, secure: prod, sameSite: 'lax', path: '/' }` (session cookie, no maxAge, like today). `accessCookieOptions(slug)` path becomes `'/'` (fallback cookie must reach `/projects/<slug>`).
- `signGuestPass(guestId, lookup): Promise<string>` → `${guestId}.${hmac(secret, ['guest-pass', guestId, lookup].join(':'))}`; `verifyGuestPass(token, lookup)`; `parseGuestPass(token)` (same strictness as `parseGuestToken`).
- `GateDeps.getGuestPass(guestId, now): Promise<{ passwordLookup; active } | null>` replaces `getGrantForToken`.
- `GateResult`: `{ kind: 'unlock'; slug; section: 'projects' | 'showcase' }`; `{ kind: 'allow'; recordVisit?: string /* guestId */ }`.
- Gate rule for `/projects/<slug>` = same as `/showcase/<slug>` (public → next, admin level → 404 unless admin, unlocked → `decideAccess`), except `/projects` index (no slug) → next.
- Proxy: `unlock` + `projects` → `noStore(NextResponse.rewrite(new URL('/locked/' + slug, request.url)))`; `unlock` + `showcase` → redirect to `/showcase/unlock` as today. `allow` with guestId → `recordGuestVisit`.

- [ ] **Step 1: Failing tests** in `gate.test.ts` (extend existing style):
  - `/projects/<unlocked slug>` without cookies → `{ kind: 'unlock', slug, section: 'projects' }`.
  - valid pass cookie opens **two different** unlocked slugs (projects and showcase) → `allow` with `recordVisit: guestId`.
  - pass signed with an old lookup (after New password) → unlock; `getGuestPass` returns `active:false` (paused/expired/deleted→null) → unlock.
  - old `showcase-guest-<slug>` cookie alone → unlock (Review Focus 1).
  - admin session → allow; `admin` level → not-found for guests; DB down (`getLevels` throws) → unlock, never allow for pass-only.
  - public slug → next; `/projects` → next.
  - `passwords.test.ts`: `signGuestPass`/`verifyGuestPass` round-trip; tampered id or signature → false; `parseGuestPass('a.b.c')` → null.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement; remove `getGrantForToken`/`validGuestGrant` use from the gate; `getGuestPass` dep calls `repo/guest-access.getGuestPass`.
- [ ] **Step 4:** `npx vitest run src/lib/access` → PASS.
- [ ] **Step 5:** Commit `feat(access): one guest pass cookie opens every locked project`.

### Task 3: Shared unlock and request actions

**Files:**
- Move: `src/app/(showcase)/showcase/unlock/actions.ts` → `src/lib/access/actions/unlock.ts`; `request-access.ts` → `src/lib/access/actions/request-access.ts` (and their tests); update imports in `src/components/showcase/{unlock-form,request-access-dialog}.tsx` and the unlock page.
- Move: `src/components/showcase/{unlock-form,request-access-dialog}.tsx` → `src/components/access/` (no CSS imports; semantic tokens exist in both stylesheets).

**Interfaces:**
- `unlock(state, formData)`: form fields unchanged (`project`, `password`, `next`). On match: `findGuestByPassword` → set `GUEST_PASS_COOKIE` = `signGuestPass(...)`, `recordGuestVisit`, redirect `safeNext(slug, next)`. Fallback `SHOWCASE_ACCESS` path unchanged except cookie options.
- `safeNext(slug, next)`: accepts `/showcase/<slug>…` **and** `/projects/<slug>` (exact, or followed by `?`/`#`); default `/projects/<slug>` when the project has no showcase demo (`getShowcaseProject(slug)` falsy), else `/showcase/<slug>`.
- `requestAccess`: project = any slug from `getAllProjects()` whose level is `unlocked` (`offersUnlock`); `projectName` from content; drop `getShowcaseProject`.

- [ ] **Step 1: Failing tests** (move existing tests, then add):
  - correct guest password on `/projects`-only slug → cookie `guest-pass` set with path `/`, redirect to `/projects/<slug>`.
  - `next` = `//evil.com`, `/admin`, `/projects/other-slug` → redirect to the default (Review Focus 4).
  - slug now public → `{ error: 'This project doesn’t need a password.' }`, no cookie (Review Focus 5).
  - `requestAccess` for a case-study-only locked slug saves the request with that `productSlug`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `refactor(access): shared unlock and request actions for any locked project`.

### Task 4: Locked case study teaser

**Files:**
- Create: `src/app/(site)/locked/[slug]/page.tsx`, `src/components/sections/locked-project.tsx`
- Test: `src/components/sections/locked-project.test.tsx` (jsdom)

**Interfaces:** Page: `dynamic = 'force-dynamic'`, `metadata.robots = { index: false, follow: false }`, title = project name; `notFound()` unless the slug exists in content **and** `offersUnlock(slug)`. Renders `<LockedProject project={frontmatter} slug next={'/projects/' + slug} />`: cover image (`frontmatter.image`, `next/image`), name (`h1`, `font-display`), one-line `description`, then a Card with `UnlockForm` and a "Request access" button opening `RequestAccessDialog`. Use `section-padding` / `container` utilities from `(site)/globals.css`.

- [ ] **Step 1: Failing test**: renders name, description, image alt, a password field labelled "Password", and a "Request access" button; renders **no** case-study body text (pass a frontmatter fixture with a distinctive body-only string the component never receives).
- [ ] **Step 2–4:** Run FAIL → implement → PASS.
- [ ] **Step 5:** Commit `feat(site): locked case study teaser`.

### Task 5: Admin actions on people

**Files:** Modify `src/app/(admin)/admin/actions.ts`, `src/lib/access/reply.ts`, `src/lib/access/repo/products.ts`, `src/lib/access/levels.ts`; tests alongside (`actions.test.ts`, `reply.test.ts`, `products.test.ts`).

**Interfaces:**
- `setProjectLevel(slug, level)`: no demo restriction (remove `canBeUnlocked` checks here and in `products.setLevel`; delete `canBeUnlocked` if unused after Task 7).
- `addGuest(formData)`: fields `name`, `email`, `note`, `expiry`, `expiryCustom`, `requestId?` (no `products`). Calls `inviteGuest`; approves request if given. Returns `PasswordResult = ActionResult<{ password; renewed: boolean; reply }>`.
- `setGuestAccessStatus(guestId, status)`, `changeGuestExpiry(guestId, formData)`, `newPassword(guestId)` (existing, reply updated), `deleteGuest(guestId)`, `updateGuest(...)` unchanged. Remove grant-level actions (`setGrantStatus`, `changeExpiry`, `removeGrant`) once Task 7 stops using them.
- `copyReplyText({ name, password, expiresAt })` → text says the password opens Kiran's locked case studies and demos, keeps expiry line and "asked again after you close your browser".

- [ ] **Step 1: Failing tests**: `addGuest` without products creates an active guest; same email again → `renewed: true`, old password no longer found; `setProjectLevel('cactus-plant','unlocked')` → ok; reply text contains password, first name, expiry, and no project list.
- [ ] **Step 2–4:** FAIL → implement → PASS (`npm test`).
- [ ] **Step 5:** Commit `feat(admin): guests are people; any project can be locked`.

### Task 6: Admin queries for the person model

**Files:** Modify `src/lib/access/admin-queries.ts` (+ test).

**Interfaces:**
- `getOverview` → `stats.activeGuests` = active unexpired guests; `stats.expiringThisWeek` = active guests whose `accessExpiresAt` within 7 days; `expiring: { guestId; guestName; expiresAt }[]`; `protected: { slug; name }[]` (no guestCount).
- `getGuestRows(db, { status? }, now): Promise<GuestAccess[]>` ordered by name; `parseGuestFilters` drops `project`.
- `listRequestsWithGuests(db): Promise<Array<PendingRequest & { existingGuest: { guestId; expiresAt: Date | null } | null }>>` — match on lower(trim(email)) (Review Focus 3).
- `getProjectRows` → `ProjectRow = { slug; name; level }` (no hasDemo/guestCount).

- [ ] **Step 1: Failing tests**: counts are of people (one guest, many locked projects → `activeGuests: 1`); expiring list per person; request from `ADA@x.com` matches guest `ada@x.com`; status filter active/paused/expired.
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5:** Commit `feat(admin): overview, guests and requests read person-level access`.

### Task 7: Console UI for the person model

**Files:** Modify `src/components/admin/add-guest-dialog.tsx`, `password-reveal.tsx`, `console/{invite-button,requests-table,waiting-requests,guests-table,guests-filters,expiry-dialog,project-access-menu,projects-list,protected-project-card,command-menu}.tsx`, pages under `src/app/(admin)/admin/(console)/`; their tests.

**Interfaces / behaviour:**
- Add-guest dialog: no project picker; title "Invite someone"; in resend mode (`defaults.existingGuest`) title "Resend access to {name}", helper "This makes a new password. Their old one stops working.", expiry prefilled from current expiry (custom when set, "No end" when null), submit "Make new password". Reveal: when `renewed`, alert "{name}’s old password no longer works."
- Requests table + waiting card: when `existingGuest`, show `Badge` "Already a guest" next to the name and primary button "Resend access" (instead of "Approve"); Decline unchanged.
- Guests table: one row per person — name/email, status badge (active/paused/expired), expiry, last visit, row menu (Pause/Resume, Change expiry, New password, Edit, Remove). Filters: status only.
- Project access menu: plain items — public: "Add password"; unlocked: "Make public" (AlertDialog confirm kept); admin (hidden): both. Saving/Saved status and error/redirect handling kept. Drop `hasDemo`.
- Projects list "Copy password" → `InviteButton` with no project props. Overview "Protected projects" card lists names only; Expiring card per person.
- `InviteButton({ label?, variant? })` — no `slug`/`projects`.

- [ ] **Step 1: Failing tests** (jsdom): menu shows "Add password" for public and "Make public" (with confirm) for protected; requests table shows "Already a guest" + "Resend access" for an existing guest and "Approve" otherwise; add-guest dialog in resend mode shows the warning copy and has no project checkboxes.
- [ ] **Step 2–4:** FAIL → implement → PASS; `npm run typecheck` clean; delete now-unused grant helpers/actions/tests.
- [ ] **Step 5:** Commit `feat(admin): console manages people, Resend access, Add password`.

### Task 8: Docs, interface review, verification

**Files:** `CLAUDE.md` (Access section), spec status line, `docs/TODO.md` if relevant.

- [ ] **Step 1:** Update CLAUDE.md: any project lockable; one guest pass per person (`guest-pass`, path `/`); grants kept for future purchases; teaser at `(site)/locked/[slug]` reached only by proxy rewrite.
- [ ] **Step 2:** Run `/better-interface` (full mode) over the teaser, request dialog, Requests, Guests, invite dialog and Projects menu; fix HIGH/MEDIUM findings; re-run tests.
- [ ] **Step 3:** `npm test`, `npm run typecheck`, `npm run lint` → all pass, 0 lint errors.
- [ ] **Step 4:** Commit `docs: person-based access` (and `fix(ui): …` for review fixes).
