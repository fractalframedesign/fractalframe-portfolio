# Showcase Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `/admin` area where Kiran sets each project's access level (Public / Unlocked / Admin), manages guests and their per-project grants, and handles access requests, backed by Neon Postgres, with no redeploys.

**Architecture:** Drizzle ORM over Neon's HTTP driver (PGlite in tests). Pure access logic in `src/lib/access/` (levels, decisions, tokens, passwords, expiry) is separated from repositories (`src/lib/access/repo/`) that take a `Db` argument, so both are tested without network. `src/proxy.ts` makes every allow / unlock / not-found decision; pages only filter lists through a tag-cached level map that admin actions invalidate. The admin UI is a third route group, `(admin)`, with its own root layout and stylesheet.

**Tech Stack:** Next.js 16 (App Router, `src/proxy.ts`, server actions), TypeScript, zod 4, drizzle-orm + drizzle-kit, `@neondatabase/serverless`, `@electric-sql/pglite` (tests), vitest, `@date-fns/tz`, shadcn/ui, Tailwind 4.

**Spec:** `docs/superpowers/specs/2026-10-31-showcase-admin-design.md`

All paths below are relative to `apps/portfolio/` unless they start with `docs/`.

## Global Constraints

- Follow repo `CLAUDE.md`: shadcn components from `src/components/ui`, semantic tokens only (no hex, no arbitrary colors), `&apos;` in JSX text, named exports for icons, default exports for components, semantic HTML, no Co-Authored-By in commits.
- Never import one route group's CSS from another; `(admin)` gets its own `admin.css`.
- zod validates every form and action input.
- Don't run `npm run build`; `npm run lint`, `npm run typecheck` and `npm test` must pass at the end of every task.
- Env vars: `DATABASE_URL` (exists, Production + Preview), `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (both Secret, Production + Preview). `SHOWCASE_ACCESS` and `RESEND_API_KEY` keep working unchanged.
- Nothing is ever sent to a visitor automatically.
- Fail closed: if the database is unreachable, no project becomes more visible than it is in the database.
- Times shown to Kiran and custom expiry input use `LOCATION.timeZone` (`'Asia/Tokyo'`) from `src/lib/constants.ts`.
- Expiry choices, exactly: `24h`, `48h`, `7d`, `30d`, `custom`, `never`.
- Preview deployments share the production database and run `db:migrate` on build, so every migration must be additive and backward-compatible (no drops or renames while `main` still uses them).
- Admin session lifetime: 12 hours. Level cache in the proxy: 10 seconds. Visit write: at most once per hour per grant.

## Review Focus

1. **Approving a request from an email that already belongs to a guest** — expected: no duplicate guest; the grant is added to the existing guest, a new password is issued for them, and the UI says their old password stopped working. (Task 4 test `approve reuses guest by email and rotates password`.)
2. **Custom expiry in the past or unparseable** — expected: field error "Pick a time in the future.", nothing saved. (Task 3 test `rejects custom expiry in the past`.)
3. **Password typed with capitals or surrounding spaces** (`  Amber-River-42 `) — expected: unlocks. (Task 3 test `normalizes password before lookup`.)
4. **Database down while a visitor submits the unlock form** — expected: "We can't check passwords right now. Please try again in a few minutes." instead of "That password isn't right", and `SHOWCASE_ACCESS` passwords still unlock. (Task 5 test `unlock reports outage, still accepts fallback`.)
5. **Database down while a visitor sends a request** — expected: the email still goes to Kiran and the visitor sees success; only if both save and email fail do they see an error. (Task 5 test `request succeeds when only one of save/email works`.)

---

## File Structure

```
apps/portfolio/
  drizzle.config.ts                     drizzle-kit config (schema path, out dir)
  drizzle/                              generated SQL migrations (committed)
  scripts/db-migrate.ts                 runs migrations + product seed; skips without DATABASE_URL
  vitest.config.ts
  src/lib/db/
    schema.ts                           tables + enums
    client.ts                           getDb(): Neon HTTP drizzle instance; type Db
    test-db.ts                          createTestDb(): PGlite + migrations (tests only)
  src/lib/access/
    levels.ts                           AccessLevel, DEFAULT_LEVELS, resolveLevel, seed list
    decide.ts                           decideAccess() pure decision
    crypto.ts                           hmac, safeEqual, passwordLookup, tokens
    passwords.ts                        generatePassword(), normalizePassword()
    words.ts                            word list (>= 512 lowercase words, 3-8 letters)
    expiry.ts                           expiryChoiceSchema, resolveExpiry, timeLeftLabel
    reply.ts                            copyReplyText()
    admin-session.ts                    cookie name/options, create/verify session
    cached-levels.ts                    getProductLevels() tag-cached for pages
    repo/products.ts                    getStoredLevels, setLevel, seedProducts
    repo/guests.ts                      guests + grants queries/mutations
    repo/requests.ts                    access request queries/mutations
    repo/rate-limit.ts                  failure counting + lockout
  src/lib/showcase-access.ts            (modify) keep SHOWCASE_ACCESS fallback only
  src/proxy.ts                          (modify) level + admin + guest decisions
  src/app/(showcase)/showcase/unlock/   (modify) actions.ts, request-access.ts, page.tsx
  src/app/(admin)/
    layout.tsx, admin.css
    admin/login/page.tsx, admin/login/actions.ts
    admin/page.tsx                      projects, inbox, guests per Unlocked project
    admin/guests/page.tsx               all guests
    admin/actions.ts                    all admin mutations (session-checked)
  src/components/admin/                 level-select, request-inbox, guest-table,
                                        add-guest-dialog, password-reveal, expiry-field
  listing changes: src/components/sections/selected-work.tsx, src/app/(site)/projects/page.tsx,
                   src/app/(site)/projects/[slug]/page.tsx, src/components/project-card.tsx,
                   src/app/(showcase)/showcase/page.tsx, src/app/sitemap.ts, src/app/robots.ts
```

`PROTECTED_SHOWCASE` in `src/lib/constants.ts` stays only as the seed source for `fintech-components = unlocked` and is no longer read at request time.

---

### Task 1: Test and database tooling

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`, `drizzle.config.ts`, `src/lib/db/schema.ts`, `src/lib/db/client.ts`, `src/lib/db/test-db.ts`, `drizzle/` (generated), `src/lib/db/schema.test.ts`

**Interfaces:**
- Produces:
  - Enums: `accessLevel = pgEnum('access_level', ['public','unlocked','admin'])`, `grantStatus = pgEnum('grant_status', ['active','paused'])`, `grantSource = pgEnum('grant_source', ['manual','request','purchase'])`, `requestStatus = pgEnum('request_status', ['pending','declined','approved'])`.
  - Tables (snake_case columns, `uuid` ids via `defaultRandom()`, `timestamptz` with `withTimezone: true`):
    - `products`: `slug text pk`, `kind text not null default 'project'`, `level access_level not null`, `createdAt`, `updatedAt`.
    - `guests`: `id`, `name text not null`, `email text unique null`, `note text not null default ''`, `passwordLookup text not null unique`, `createdAt`.
    - `grants`: `id`, `guestId → guests.id on delete cascade`, `productSlug → products.slug on delete cascade`, `status`, `source`, `expiresAt null`, `lastVisitAt null`, `visitCount int not null default 0`, `createdAt`; unique `(guestId, productSlug)`.
    - `accessRequests`: `id`, `name`, `email`, `message text not null default ''`, `productSlug text not null`, `status default 'pending'`, `createdAt`.
    - `loginAttempts`: `key text pk` (e.g. `admin:<ip>` / `unlock:<ip>`), `failures int not null`, `windowStart timestamptz not null`, `lockedUntil timestamptz null`.
  - `type Db` (a drizzle Postgres database type usable with both neon-http and pglite: `PgDatabase<any, typeof schema>`), `getDb(): Db` (throws `DatabaseUnavailableError` when `DATABASE_URL` is unset), `class DatabaseUnavailableError extends Error`.
  - `createTestDb(): Promise<Db>` — fresh in-memory PGlite with all migrations from `drizzle/` applied.
  - Scripts: `"test": "vitest run"`, `"db:generate": "drizzle-kit generate"`, `"db:migrate": "tsx scripts/db-migrate.ts"`.

- [ ] **Step 1: Install dependencies**

Run: `npm i drizzle-orm @neondatabase/serverless @date-fns/tz -w apps/portfolio && npm i -D drizzle-kit vitest @electric-sql/pglite tsx -w apps/portfolio` (from repo root).
Expected: installs without peer errors.

- [ ] **Step 2: Write the failing test** `src/lib/db/schema.test.ts`

```ts
test('migrations create all tables', async () => {
  const db = await createTestDb();
  const rows = await db.execute(sql`select table_name from information_schema.tables where table_schema = 'public'`);
  expect(rows.rows.map((r) => r.table_name).sort()).toEqual(
    ['access_requests', 'grants', 'guests', 'login_attempts', 'products'],
  );
});
test('grant is unique per guest and product', async () => { /* insert product, guest, two grants for same pair → second rejects */ });
```

- [ ] **Step 3: Run it to verify it fails** — `npm test -w apps/portfolio` → FAIL (`createTestDb` missing).

- [ ] **Step 4: Implement** `vitest.config.ts` (node environment, `@` alias to `src`), `schema.ts`, `client.ts` (`drizzle(neon(process.env.DATABASE_URL))` from `drizzle-orm/neon-http`), `drizzle.config.ts` (`dialect: 'postgresql'`, `schema: './src/lib/db/schema.ts'`, `out: './drizzle'`), run `npm run db:generate -w apps/portfolio`, then `test-db.ts` using `drizzle-orm/pglite` + `migrate` from `drizzle-orm/pglite/migrator`.

- [ ] **Step 5: Run tests** → PASS. Also `npm run typecheck -w apps/portfolio` and `npm run lint -w apps/portfolio` → clean.

- [ ] **Step 6: Commit** — `feat(admin): add drizzle schema, migrations and test db`

---

### Task 2: Levels, seeding and the migrate script

**Files:**
- Create: `src/lib/access/levels.ts`, `src/lib/access/repo/products.ts`, `scripts/db-migrate.ts`, `src/lib/access/levels.test.ts`, `src/lib/access/repo/products.test.ts`

**Interfaces:**
- Consumes: `Db`, `products` table, `createTestDb()`.
- Produces:
  - `type AccessLevel = 'public' | 'unlocked' | 'admin'`
  - `SEED_LEVELS: Record<string, AccessLevel>` — every slug in `content/projects/` as of today (`bloom`, `cactus-plant`, `charter`, `echo-ui`, `echo`, `finance-dashboard`, `fintech-components`, `happy-stats`, `justos`, `neobase`, `plasma`, `relative`, `scalar`, `smart-home-dashboard`, `sonic`, `stellar`, `streamline`) = `'public'`, except `fintech-components` = `'unlocked'`. Also seed `finance-dashboard` and `smart-home-dashboard` showcase slugs (same slugs, already listed).
  - `resolveLevel(slug: string, stored: ReadonlyMap<string, AccessLevel>): AccessLevel` — stored value, else `'admin'` (unknown = new project = private).
  - `canBeUnlocked(slug: string): boolean` — true only for slugs in `showcaseProjects`.
  - `getStoredLevels(db: Db): Promise<Map<string, AccessLevel>>`
  - `setLevel(db: Db, slug: string, level: AccessLevel): Promise<void>` — upsert; throws `Error('Only showcase projects can be Unlocked')` when `level === 'unlocked' && !canBeUnlocked(slug)`.
  - `seedProducts(db: Db): Promise<number>` — inserts `SEED_LEVELS` with `onConflictDoNothing`, returns rows inserted.
  - `scripts/db-migrate.ts`: if `DATABASE_URL` unset, log `DATABASE_URL not set, skipping migrations` and exit 0; else run neon-http migrator on `drizzle/`, then `seedProducts`.

- [ ] **Step 1: Write failing tests**

```ts
test('unknown slug resolves to admin', () => expect(resolveLevel('new-thing', new Map())).toBe('admin'));
test('stored level wins', () => expect(resolveLevel('bloom', new Map([['bloom', 'public']]))).toBe('public'));
test('seed is idempotent and keeps changed levels', async () => {
  const db = await createTestDb();
  expect(await seedProducts(db)).toBe(17);
  await setLevel(db, 'bloom', 'admin');
  expect(await seedProducts(db)).toBe(0);
  expect((await getStoredLevels(db)).get('bloom')).toBe('admin');
  expect((await getStoredLevels(db)).get('fintech-components')).toBe('unlocked');
});
test('only showcase projects can be unlocked', async () => {
  const db = await createTestDb();
  await expect(setLevel(db, 'bloom', 'unlocked')).rejects.toThrow('Only showcase projects can be Unlocked');
});
test('SEED_LEVELS covers every MDX project', async () => {
  expect(Object.keys(SEED_LEVELS).sort()).toEqual((await getProjectSlugs()).sort());
});
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.

- [ ] **Step 5: Wire migrations into deploys** — `package.json` `"build": "npm run db:migrate && next build"` (the script skips when `DATABASE_URL` is absent, so CI keeps building).

- [ ] **Step 6: Commit** — `feat(admin): product access levels with seed`

---

### Task 3: Pure access core (decision, crypto, passwords, expiry, reply)

**Files:**
- Create: `src/lib/access/decide.ts`, `crypto.ts`, `passwords.ts`, `words.ts`, `expiry.ts`, `reply.ts`, `admin-session.ts`, and a `*.test.ts` next to each.

**Interfaces:**
- Produces:
  - `decideAccess(input: { level: AccessLevel | 'unknown-db-down'; isAdmin: boolean; hasGuestAccess: boolean; hasFallbackAccess: boolean }): 'allow' | 'unlock' | 'not-found'`
    - `public` → allow; `admin` → allow if isAdmin else not-found; `unlocked` → allow if isAdmin or hasGuestAccess or hasFallbackAccess, else unlock; `unknown-db-down` → allow if isAdmin or hasFallbackAccess, else unlock.
  - `hmac(secret: string, message: string): Promise<string>` (hex, Web Crypto HMAC-SHA256), `safeEqual(a: string, b: string): boolean` (move the existing one from `showcase-access.ts`).
  - `passwordLookup(password: string): Promise<string>` — `hmac(secret, 'password:' + normalizePassword(password))` with `secret = process.env.ADMIN_SESSION_SECRET` (throws if unset). Deterministic so the unlock form can look a guest up by it; safe because passwords are random and the key is server-only. Document in a comment: rotating `ADMIN_SESSION_SECRET` invalidates every guest password.
  - `signGuestToken(grantId: string, slug: string, passwordLookup: string): Promise<string>` → `${grantId}.${hmac(secret, ['guest', grantId, slug, passwordLookup].join(':'))}`; `parseGuestToken(token: string): { grantId: string; signature: string } | null`. Verification (Task 5) recomputes with the grant's current guest `passwordLookup`, so a new password invalidates old cookies.
  - `generatePassword(random?: () => number): string` — 3 distinct words from `WORDS` + a 2-digit number 10–99, joined by `-`, e.g. `amber-river-42`. `WORDS.length >= 512`.
  - `normalizePassword(input: string): string` — trim + lowercase.
  - `expiryChoiceSchema = z.enum(['24h','48h','7d','30d','custom','never'])`
  - `resolveExpiry(choice: ExpiryChoice, now: Date, customLocal?: string): { ok: true; expiresAt: Date | null } | { ok: false; error: string }` — `customLocal` is a `datetime-local` value (`YYYY-MM-DDTHH:mm`) interpreted in `LOCATION.timeZone` via `TZDate`. Errors: `'Pick a date and time.'` (missing/unparseable), `'Pick a time in the future.'` (≤ now).
  - `timeLeftLabel(expiresAt: Date | null, now: Date): string` — `'No expiry'`, `'Expired'`, `'Expires in 45 min'`, `'Expires in 5 h'`, `'Expires in 3 days'`.
  - `isGrantActive(grant: { status: 'active'|'paused'; expiresAt: Date | null }, now: Date): boolean`
  - `copyReplyText(input: { name: string; projectNames: string[]; password: string; expiresAt: Date | null }): string` — exact copy:
    ```
    Hi {first name},

    Thanks for your interest. Here's your password for {project names joined with ", " and " and "}:

    {password}

    {"It works until {date in Asia/Tokyo, e.g. 'Nov 2, 2026, 18:00 JST'}." | omitted when no expiry}
    Open the project, enter the password, and you're in. It's asked again after you close your browser.

    Kiran
    ```
  - `ADMIN_COOKIE = 'admin-session'`; `adminCookieOptions(): { httpOnly: true; secure: production; sameSite: 'lax'; path: '/'; maxAge: 43200 }`; `createAdminSession(now: Date): Promise<string>` → `${expiresAtMs}.${hmac(secret, 'admin:' + expiresAtMs)}`; `verifyAdminSession(token: string | undefined, now: Date): Promise<boolean>`; `checkAdminPassword(input: string): boolean` (constant-time against `ADMIN_PASSWORD`; false when unset).

- [ ] **Step 1: Write failing tests** (one file per module). Required cases:

```ts
// decide.test.ts — table test over all level × flag combinations from the rules above, including
expect(decideAccess({ level: 'admin', isAdmin: false, hasGuestAccess: true, hasFallbackAccess: true })).toBe('not-found');
expect(decideAccess({ level: 'unknown-db-down', isAdmin: false, hasGuestAccess: false, hasFallbackAccess: false })).toBe('unlock');
// passwords.test.ts
test('normalizes password before lookup', async () => {
  expect(await passwordLookup('  Amber-River-42 ')).toBe(await passwordLookup('amber-river-42'));
});
test('generated password format', () => expect(generatePassword()).toMatch(/^[a-z]+-[a-z]+-[a-z]+-[1-9]\d$/));
// expiry.test.ts (now = 2026-10-31T00:00:00Z)
expect(resolveExpiry('24h', now)).toEqual({ ok: true, expiresAt: new Date('2026-11-01T00:00:00Z') });
expect(resolveExpiry('never', now)).toEqual({ ok: true, expiresAt: null });
expect(resolveExpiry('custom', now, '2026-11-02T18:00')).toEqual({ ok: true, expiresAt: new Date('2026-11-02T09:00:00Z') }); // JST
test('rejects custom expiry in the past', () =>
  expect(resolveExpiry('custom', now, '2026-10-30T10:00')).toEqual({ ok: false, error: 'Pick a time in the future.' }));
expect(timeLeftLabel(new Date('2026-10-31T05:00:00Z'), now)).toBe('Expires in 5 h');
// crypto.test.ts: token for grant A does not verify after passwordLookup changes; tampered signature fails
// admin-session.test.ts: session valid at +11h59m, invalid at +12h01m, invalid when tampered
// reply.test.ts: snapshot of copyReplyText for one project with expiry and for two projects without
```

Tests set `process.env.ADMIN_SESSION_SECRET` and `ADMIN_PASSWORD` in a `beforeEach`.

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** — `feat(admin): access decisions, tokens, passwords and expiry`

---

### Task 4: Repositories (guests, grants, requests, rate limit)

**Files:**
- Create: `src/lib/access/repo/guests.ts`, `repo/requests.ts`, `repo/rate-limit.ts`, and tests beside them.

**Interfaces:**
- Consumes: `Db`, tables, `passwordLookup`, `generatePassword`, `isGrantActive`.
- Produces (`repo/guests.ts`):
  - `type GrantView = { grantId; guestId; name; email: string | null; note; productSlug; status; expiresAt: Date | null; lastVisitAt: Date | null; visitCount: number; createdAt }`
  - `createGuest(db, input: { name; email?: string; note?: string; products: string[]; expiresAt: Date | null; source: 'manual' | 'request' }): Promise<{ guestId: string; password: string; rotated: boolean }>` — if `email` matches an existing guest, reuse it, upsert grants for the listed products, rotate its password and return `rotated: true`; otherwise create. All products must have level `unlocked` (throw `Error('Project isn't Unlocked')`). Runs in a transaction.
  - `findGrantByPassword(db, slug: string, password: string): Promise<{ grantId: string; passwordLookup: string } | null>` — only returns an active, unexpired grant for that slug.
  - `getGrantForToken(db, grantId: string, slug: string): Promise<{ passwordLookup: string; active: boolean } | null>`
  - `listGrantsByProduct(db, slug: string): Promise<GrantView[]>`, `listGuests(db): Promise<Array<{ guestId; name; email; note; createdAt; grants: GrantView[] }>>`
  - `setGrantStatus(db, grantId, status)`, `setGrantExpiry(db, grantId, expiresAt: Date | null)`, `addGrant(db, guestId, slug, expiresAt)`, `removeGrant(db, grantId)`, `deleteGuest(db, guestId)`, `updateGuest(db, guestId, { name?, note? })`
  - `resetPassword(db, guestId): Promise<string>` — new password, returns plaintext once.
  - `recordVisit(db, grantId, now: Date): Promise<void>` — single `UPDATE ... SET visit_count = visit_count + 1, last_visit_at = now WHERE id = $1 AND (last_visit_at IS NULL OR last_visit_at < now - interval '1 hour')`.
- Produces (`repo/requests.ts`): `saveRequest(db, input: { name; email; message; productSlug })`, `listPendingRequests(db)`, `setRequestStatus(db, id, 'approved' | 'declined')`.
- Produces (`repo/rate-limit.ts`): `isLocked(db, key: string, now: Date): Promise<boolean>`, `recordFailure(db, key, now): Promise<void>` (5 failures within 15 min → `lockedUntil = now + 15 min`; window resets after 15 min), `clearFailures(db, key)`.

- [ ] **Step 1: Write failing tests** (each on a fresh `createTestDb()` + `seedProducts`). Required:
  - `createGuest returns a password that findGrantByPassword accepts`
  - `findGrantByPassword ignores paused, expired and other-project grants`
  - `approve reuses guest by email and rotates password` — second `createGuest` with same email for `finance-dashboard` (after setting it unlocked) → same `guestId`, `rotated: true`, old password returns null, new one finds both grants.
  - `pausing one grant leaves the guest's other grants active`
  - `resetPassword invalidates the old password`
  - `recordVisit counts at most once per hour` — calls at t, t+30min, t+61min → `visitCount` 2.
  - `deleteGuest removes their grants`
  - `rate limit locks after 5 failures for 15 minutes and resets after`
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** — `feat(admin): guest, grant, request and rate-limit repositories`

---

### Task 5: Proxy, unlock and request flow

**Files:**
- Modify: `src/proxy.ts`, `src/lib/showcase-access.ts`, `src/app/(showcase)/showcase/unlock/actions.ts`, `request-access.ts`, `page.tsx`
- Create: `src/lib/access/gate.ts`, `src/lib/access/gate.test.ts`, `src/app/(showcase)/showcase/unlock/actions.test.ts`

**Interfaces:**
- Consumes: Tasks 2–4.
- Produces:
  - `gateRequest(input: { pathname: string; cookies: { get(name: string): string | undefined }; deps: GateDeps }): Promise<{ kind: 'next' } | { kind: 'allow'; recordVisit?: string /* grantId */ } | { kind: 'unlock'; slug: string } | { kind: 'not-found' }>`
    - Routes: `/showcase/unlock` → `next`; `/showcase/<slug>/**` → full decision; `/projects/<slug>` → only `admin` level is gated (others `next`); `/admin/**` except `/admin/login` → `not-found`-free redirect handled in proxy: no admin session → redirect to `/admin/login`.
    - `GateDeps = { getLevels(): Promise<Map<string, AccessLevel>>; getGrantForToken(...); now(): Date }`; any thrown error from `getLevels` → level `'unknown-db-down'`; from `getGrantForToken` → `hasGuestAccess = false`.
  - `getProxyLevels(db): Promise<Map<...>>` — module-level cache, 10 s TTL.
  - `showcase-access.ts` keeps `tokenForPassword` / `hasAccess` for `SHOWCASE_ACCESS` (fallback cookie `showcase-access-<slug>`), drops `getProtectedSlug` and `PROTECTED_SHOWCASE` use; guest cookie name `showcase-guest-<slug>`, same options as today's `accessCookieOptions`.
  - Proxy: `matcher: ['/showcase/:path*', '/projects/:path*', '/admin/:path*']`; `not-found` → `NextResponse.rewrite(new URL('/__not-found', request.url))` with status 404 (renders `global-not-found`); `unlock` → existing redirect with `project` and `next`; `allow` → `Cache-Control: private, no-store, max-age=0` as today, and `event.waitUntil(recordVisit(...))` when `recordVisit` is set.
  - `unlock(state, formData)` order: slug must resolve to level `unlocked` (else existing "doesn't need a password" error); rate limit key `unlock:<ip>` (locked → "Too many tries. Try again in 15 minutes."); try `findGrantByPassword` → set guest cookie + `recordVisit`; else try `SHOWCASE_ACCESS` fallback → set fallback cookie; DB error and no fallback match → `"We can't check passwords right now. Please try again in a few minutes."`; otherwise record failure and `"That password isn’t right. Try again."`.
  - `requestAccess`: validate as today; `saveRequest` and the Resend email both attempted; success if either works; error `"Your request didn’t send. Please try again."` only if both fail. Missing `RESEND_API_KEY` counts as an email failure, not an early return.

- [ ] **Step 1: Write failing tests** with fake `GateDeps` (no DB): public allows; admin level without session → not-found, with valid admin cookie → allow; unlocked with valid guest token → allow + `recordVisit`; guest token after password reset (lookup changed) → unlock; `getLevels` throws + fallback cookie → allow; `getLevels` throws + nothing → unlock; `/projects/bloom` with level admin → not-found; `/projects/bloom` public → next.
  Action tests (`actions.test.ts`, mocking `next/headers` cookies and the db module to a `createTestDb()` instance): `unlock reports outage, still accepts fallback`; `request succeeds when only one of save/email works` (mock `fetch` for Resend); `unlock locks after 5 wrong passwords`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS; `npm run typecheck`, `npm run lint` clean.
- [ ] **Step 5: Manual check** — `npm run dev`, without `DATABASE_URL` locally: `/showcase/fintech-components` redirects to unlock; Kiran's `SHOWCASE_ACCESS` value from `.env.local` unlocks (fail-closed path).
- [ ] **Step 6: Commit** — `feat(admin): proxy gates by access level, guest passwords and saved requests`

---

### Task 6: Lists respect access levels

**Files:**
- Create: `src/lib/access/cached-levels.ts`, `src/lib/access/visible.ts`, `src/lib/access/visible.test.ts`
- Modify: `src/components/sections/selected-work.tsx`, `src/app/(site)/projects/page.tsx`, `src/app/(site)/projects/[slug]/page.tsx` (more projects), `src/components/project-card.tsx`, `src/app/(showcase)/showcase/page.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`

**Interfaces:**
- Produces:
  - `LEVELS_TAG = 'product-levels'`; `getProductLevels(): Promise<Map<string, AccessLevel>>` — `unstable_cache` with `tags: [LEVELS_TAG]`; when `DATABASE_URL` is unset returns `SEED_LEVELS` (dev/CI); when set and the query fails, it throws, so a failed revalidation keeps serving the last good page (fail closed).
  - `visibleProjects<T extends { slug: string }>(items: T[], levels: Map<string, AccessLevel>): Array<T & { locked: boolean }>` — drops `admin` (incl. unknown slugs via `resolveLevel`), `locked = level === 'unlocked'`.
  - `ProjectCard` and the `selected-work` card show a `Lock` icon (lucide, `aria-label="Password protected"`) when `locked`.
  - Sitemap: only `public` projects and `public` showcase slugs. Robots: disallow `/admin`, `/showcase/unlock`, and `/showcase/<slug>` for every non-public slug.
- [ ] **Step 1: Failing tests** for `visibleProjects`: admin and unknown slugs removed; unlocked kept with `locked: true`; order preserved.
- [ ] **Step 2–4:** Run → FAIL, implement, run → PASS.
- [ ] **Step 5: Manual check** — `npm run dev`: home, `/projects`, `/showcase` render; fintech card shows the lock.
- [ ] **Step 6: Commit** — `feat(admin): hide Admin projects and mark Unlocked ones in lists`

---

### Task 7: Admin route group and login

**Files:**
- Create: `src/app/(admin)/layout.tsx`, `src/app/(admin)/admin.css`, `src/app/(admin)/admin/login/page.tsx`, `src/app/(admin)/admin/login/actions.ts`, `src/app/(admin)/admin/login/actions.test.ts`, `src/lib/access/require-admin.ts`
- Add shadcn components as needed: `npx shadcn@latest add table select radio-group alert` (run in `apps/portfolio`).

**Interfaces:**
- Produces:
  - Root layout: `<html>`/`<body>` with Geist Sans, `metadata.robots = { index: false, follow: false }`, title template `%s | Admin`. `admin.css` imports Tailwind, `tw-animate-css`, `@tailwindcss/typography` is not needed; define the shadcn token set (`--background`, `--foreground`, `--card`, `--muted`, `--border`, `--primary`, `--destructive`, … dark values) mirroring `(site)/globals.css` values without importing it.
  - `requireAdmin(): Promise<void>` — reads `ADMIN_COOKIE` via `cookies()`, `verifyAdminSession`, else `redirect('/admin/login')`. Every admin page and every admin action calls it first.
  - `login(state: { error?: string }, formData: FormData)` — rate limit key `admin:<ip>` (from `x-forwarded-for`, first entry); locked → "Too many tries. Try again in 15 minutes."; wrong → `recordFailure`, 1 s delay, "That password isn’t right."; right → `clearFailures`, set cookie, `redirect('/admin')`. `logout()` clears the cookie and redirects to `/admin/login`.
  - Login page: shadcn `Card` with password `Input`, `Button` "Log in", same structure as the unlock page.
- [ ] **Step 1: Failing tests**: right password sets cookie and redirects; wrong password returns error and counts; 6th try within 15 min is locked even with the right password.
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5: Manual check** — `ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET` in `.env.local`; `/admin` redirects to login; login works; logout works.
- [ ] **Step 6: Commit** — `feat(admin): admin route group with login`

---

### Task 8: Admin dashboard

**Files:**
- Create: `src/app/(admin)/admin/page.tsx`, `src/app/(admin)/admin/guests/page.tsx`, `src/app/(admin)/admin/actions.ts`, `src/app/(admin)/admin/actions.test.ts`, `src/components/admin/level-select.tsx`, `request-inbox.tsx`, `guest-table.tsx`, `add-guest-dialog.tsx`, `expiry-field.tsx`, `password-reveal.tsx`

**Interfaces:**
- Consumes: everything above.
- `actions.ts` imports repositories as namespaces (`import * as guestsRepo from '@/lib/access/repo/guests'`) because several action names match repository function names.
- Produces (`actions.ts`, each starts with `await requireAdmin()`, validates with zod, returns `{ ok: true, ... } | { ok: false, error?: string, fieldErrors?: Record<string, string[]> }`):
  - `setProjectLevel(slug, level)` → `setLevel`, then `updateTag(LEVELS_TAG)` and `revalidatePath('/')`, `revalidatePath('/projects')`, `revalidatePath('/projects/' + slug)`, `revalidatePath('/showcase')`.
  - `addGuest(formData)` fields: `name` (1–100), `email` (optional email), `note` (≤ 500), `products` (≥ 1 Unlocked slug), `expiry` (`expiryChoiceSchema`), `expiryCustom` (when `custom`), `requestId` (optional; marks request approved). Returns `{ ok: true, password, rotated, reply: copyReplyText(...) }`.
  - `declineRequest(id)`, `setGrantStatus(grantId, 'active' | 'paused')`, `changeExpiry(grantId, expiry, expiryCustom?)`, `removeGrant(grantId)`, `deleteGuest(guestId)`, `newPassword(guestId)` → `{ ok: true, password, reply }`, `updateGuest(guestId, { name, note })`, `logout()`.
- UI (`/admin`):
  1. Header: "Admin", link "All guests", button "View analytics" is **not** added here (TODO item), `Log out`.
  2. **Requests** (`request-inbox`): pending requests (name, email, project, message, date in JST) with **Approve** (opens `add-guest-dialog` prefilled; `source: 'request'`) and **Decline**. Empty state: "No requests waiting."
  3. **Projects** (`level-select`): every MDX project with a shadcn `Select` of Public / Unlocked / Admin; Unlocked disabled for non-showcase projects with tooltip "Only projects with a demo can be Unlocked."
  4. For each Unlocked project, **guest-table**: name, note, status badge (Active / Paused / Expired), `timeLeftLabel`, last visit ("Never" or relative), visits; row menu (`DropdownMenu`): Pause/Resume, Change expiry, New password, Remove from project. "Add guest" button per project.
- `add-guest-dialog`: name, email, note, project checkboxes (Unlocked only), `expiry-field` (`RadioGroup` 24 hours / 48 hours / 7 days / 30 days / Custom / Never; Custom shows `<Input type="datetime-local">` labelled "Date and time (Tokyo time)").
- `password-reveal`: shown once after add/new password: the password in `font-mono`, **Copy** and **Copy reply** buttons (clipboard), and when `rotated`, an `Alert`: "{name} already had a password. It has been replaced, so their old one no longer works."
- `/admin/guests`: every guest with their grants across projects; Delete guest (confirm dialog) and edit name/note.

- [ ] **Step 1: Failing action tests** (db mocked to `createTestDb()`, `requireAdmin` real with a test cookie): unauthenticated call → redirect to login and no change; `addGuest` with `expiry: 'custom'` in the past → `fieldErrors.expiryCustom = ['Pick a time in the future.']`; `addGuest` with a non-Unlocked project → error; `addGuest` with `requestId` marks the request approved; `setProjectLevel('bloom','unlocked')` → error; `setProjectLevel` calls `updateTag(LEVELS_TAG)` (mock `next/cache`).
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5: Manual check** (dev server, local DB per Task 9 step 1): add a guest with 24 hours, copy reply, unlock fintech as that guest in a private window, pause them → next page load goes to unlock; set fintech to Admin → private window gets 404; set back to Unlocked.
- [ ] **Step 6: Commit** — `feat(admin): dashboard for levels, requests and guests`

---

### Task 9: Env, docs and hand-off

**Files:**
- Modify: `.env.example`, `docs/TODO.md`, `docs/superpowers/specs/2026-10-31-showcase-admin-design.md` (status → implemented), `CLAUDE.md` (Architecture: third route group `(admin)`; access levels live in the database, not `PROTECTED_SHOWCASE`)

- [ ] **Step 1: Local database for development** — in the Neon console create a branch `dev` of `fractalframe-db`; put its connection string in `apps/portfolio/.env.local` as `DATABASE_URL` (Kiran pastes it; never committed); run `npm run db:migrate -w apps/portfolio` → prints migrations applied and `17` seeded.
- [ ] **Step 2:** `.env.example` gains `DATABASE_URL=`, `ADMIN_PASSWORD=`, `ADMIN_SESSION_SECRET=` with one-line comments (secret: 32+ random characters; never change it, or every guest password stops working).
- [ ] **Step 3:** Run `npm test`, `npm run lint`, `npm run typecheck` in `apps/portfolio` → all clean.
- [ ] **Step 4:** Write Kiran's numbered setup steps (to give in chat, not a file): add `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in Vercel (Production + Preview), open the PR from `feat/admin`, check the Preview deployment, merge.
- [ ] **Step 5: Commit** — `docs(admin): env vars, architecture notes and setup`
