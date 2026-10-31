# Showcase admin: access levels, people and requests

Date: 2026-10-31 · Branch: `feat/admin` · Status: implemented on feat/admin, pending manual check and merge

## Why

Private showcase projects are protected by one Vercel secret, `SHOWCASE_ACCESS`
(`name:password:projects`, comma separated). Every change means editing a
write-only value Kiran can't read back, then redeploying. One wrong character
(a password on its own, a space after a colon) silently breaks access, which
cost several rounds on 2026-10-31.

Kiran shares private work only with people they approve, one by one. The admin
page makes that a two-click job on the live site, with no Vercel editing and no
redeploys.

## Goals

1. Kiran logs in to `/admin` with their own password.
2. Every project has one access level: **Public**, **Unlocked** or **Admin**.
3. Each Unlocked project has a list of people who can open it. Kiran can add,
   pause, resume and remove people.
4. Access requests from the unlock page land in an admin inbox (as well as
   Gmail). Approve creates the guest, a grant and a password; Decline drops it.
5. After approving or adding, a **Copy reply** button copies a ready message
   with the password, for Kiran to paste into a Gmail reply.
6. Per guest and project: note, how long access lasts (24 h, 48 h, 7 days, 30 days, custom date-time, or never), last visit and visit count.
7. Changes take effect within seconds.

## Non-goals

- Sending passwords or any email to visitors automatically. Kiran replies
  from Gmail. (Anti-goal: anything that grants access without Kiran.)
- Multiple admins, roles, passkeys, 2FA.
- One-click magic links, admin activity history (possible later).
- Editing project content from admin. Content stays in MDX.

## Access levels

| Level | Who can open `/showcase/<slug>/**` | Project card and `/projects/<slug>` |
|---|---|---|
| Public | everyone | shown |
| Unlocked | people on that project's list, and Kiran when logged in | shown, with a lock icon |
| Admin | only Kiran when logged in | hidden: card not listed, `/projects/<slug>` and `/showcase/<slug>/**` return 404 for everyone else; Kiran sees an "Admin only" label |

- Which projects: all MDX projects in `content/projects/` can be Public or
  Admin. **Unlocked** is only offered for projects with a showcase route
  (`src/lib/showcase.ts`), since there's nothing to unlock otherwise.
  *(Claude's call.)*
- Seeding: on first run, write a level for every slug that exists now
  (`fintech-components` = Unlocked, everything else = Public), so nothing
  changes on deploy. Any slug with no stored level after that is a new
  project and is treated as **Admin**. *(Claude's call, Kiran may override.)*
- Switching a level never changes anyone's password or list membership.
  Admin blocks everyone except Kiran, including people with a password, until
  switched back.
- Sitemap and robots: only Public projects are listed/allowed. Since these are
  generated at build time, they may lag until the next deploy; that's
  acceptable. *(Claude's call.)*

## People

A **guest** is someone outside the site who is given access: id, name,
email (from the request, optional when added by hand), note, password hash,
created date. Access itself lives in **grants**: one row per guest per
project, with status (`active` | `paused`), optional expiry date and time,
source (`manual` | `request`, later `purchase`), created date, last visit and
visit count. A guest with access to three projects has three grants. Guests
are accounts without sign-up: they never create a login, they just hold a
password Kiran gave them.

- **Add**: name, projects, optional note, and how long access lasts:
  24 hours, 48 hours, 7 days, 30 days, a custom date and time, or never.
  Custom date-time is picked and shown in Kiran's time zone (the site's
  `timeZone` in `src/lib/constants.ts`). Kiran can change it later for an
  existing person (extend or shorten) without changing their password. The page generates a readable password (e.g. `amber-river-42`),
  shows it once with **Copy** and **Copy reply**, and stores only a hash.
- **Pause / Resume** a grant: that guest is locked out of that project
  immediately; their other projects are unaffected. Resuming restores access
  with the same password.
- **Remove** from a project: deletes that grant. **Delete guest** removes the
  guest and all their grants. Either way, open sessions stop working on the
  next request.
- **New password** for one person: generates a new one, old one stops working.
- **Expiry** (per grant): past the date and time, the guest is locked out on their next
  request and shown as "Expired" in the list, with a time-left label
  (e.g. "Expires in 5 h") while still active.
- **Last visit**: updated when the person unlocks or loads a protected page,
  at most once per hour per person to limit writes.

The admin page shows a list per Unlocked project (the main view) and a way to
see all people.

## Requests

The existing "Request access" form saves the request first, then emails
Kiran via Resend as a best effort (a failed email no longer loses the
request). It saves (name, email, message, project, date). The admin inbox
lists pending requests with **Approve** (opens Add with name, email and
project filled in) and **Decline** (deletes it). Nothing is sent to the
visitor either way.

## Admin login

- `ADMIN_PASSWORD` env var (Secret, Production), set once by Kiran.
  Should be long; the admin page controls all access.
- Login sets an httpOnly, secure, signed session cookie that expires after
  12 hours. Signing secret: `ADMIN_SESSION_SECRET` env var.
- Wrong attempts: fixed delay per attempt, plus a lockout after repeated
  failures from one IP, tracked in storage. *(Builder picks thresholds.)*
- Every admin server action re-checks the session; the page alone is not the
  guard.
- `/admin` is `noindex`, excluded in robots, and has its own route group
  `(admin)` with its own layout, following the existing two-group pattern.

## Storage

**Postgres on Neon**, added through Vercel → Storage → Marketplace (free
tier), which injects `DATABASE_URL` into the project. Accessed with the Neon
serverless driver (works in the proxy runtime) and **Drizzle ORM**, with
schema and migrations in the repo.

Why Postgres, not Redis or Global Config: Kiran may later sell digital
products to guests. That needs related records (guests, products, grants,
orders) with constraints and queries across them, which a relational
database does well and a key-value store does badly. Global Config was ruled
out because writing to it needs a Vercel API token with power over the whole
account and Hobby includes only 100 writes a month.

Tables for this version: `products` (one row per project, with its access
level), `guests`, `grants`, `access_requests`, `login_attempts`. Passwords
are stored only as hashes. *(Builder chooses column details and hash scheme;
hashing must run in the proxy runtime.)*

## Built to grow: selling digital products (not in this version)

The model is chosen so selling later is additive, not a rewrite:

- A project is one kind of **product**. A future product kind (template,
  file download, course) is a new `kind` value plus its delivery pages.
- A purchase becomes an **order** row plus a **grant** with
  `source = purchase`. Access checks don't change: they already only ask
  "does this guest have an active, unexpired grant for this product?"
- A payment provider (e.g. Stripe Checkout) would call a webhook that creates
  the guest, order and grant. That's the one place selling breaks the
  "nothing reaches visitors automatically" rule, and only for paid
  products. Kiran decides that when selling is built.
- Not built now: orders, payments, prices, product kinds beyond projects,
  guest self-service (password reset, "my purchases").

## Checking access

`src/proxy.ts` already guards `/showcase/:path*`. It extends to:

- read the project's level;
- Admin: allow only with a valid admin session, otherwise 404;
- Unlocked: allow with a valid admin session or a valid guest cookie;
  otherwise redirect to `/showcase/unlock` as today;
- also guard `/projects/<slug>` for Admin-level projects.

Database reads: project levels may be cached in the proxy for up to 10
seconds; guests and grants are read fresh, so Remove and Pause act on the next
request. *(Claude's call, to stay inside the free tier.)*

Guest cookies stay per project and session-only (asked again after the
browser closes), as today. A cookie must stop working when the guest or grant is
removed, paused, expired, gets a new password, or the project leaves
Unlocked.

**Fallback**: entries in `SHOWCASE_ACCESS` keep unlocking Unlocked projects,
so Kiran's current `kiran:…:*` password works throughout.

If the database is unreachable, fail closed: every `/showcase/<slug>/**` route
needs a `SHOWCASE_ACCESS` password, and approved guests wait until the database is
back. Hidden projects must never become visible during an outage.
*(Claude's call, explained to Kiran: a hidden project leaking is worse than
a short wait for approved people.)*

## Where project levels show up

Every place projects are listed (`src/lib/projects.ts` consumers: home
`selected-work`, `/projects`, "more projects" on detail pages; and the
`/showcase` index, `[widget]` pages and other showcase routes) filters out
Admin projects for visitors and shows a lock on Unlocked ones. These pages
are statically built today. After a level change, the admin action
revalidates the affected paths so they update within seconds without a
redeploy. *(Builder call: on-demand revalidation; how Kiran sees Admin
projects in lists while logged in is left to the builder, e.g. a small
client-side addition or only via the admin page.)*

## Constraints

- Follow `CLAUDE.md`: shadcn components (`src/components/ui`), semantic
  tokens, folder structure, named icon exports, `&apos;` in JSX.
- Next.js 16 with `src/proxy.ts`; zod for all input validation.
- Hobby plan limits.
- Don't run `build` unless Kiran asks; `lint` and `typecheck` must pass.

## Kiran's setup steps (to give as numbered steps)

1. Vercel → Storage → Marketplace → Neon (Postgres) → connect to
   `fractalframe-portfolio`, Production.
2. Add `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` (Secret, Production).
3. Merge the PR; Vercel deploys.

## Left to the builder

Key layout, hash and token scheme, password word list, login lockout
thresholds, admin page layout within shadcn, exact copy for "Copy reply",
and tests.

## Change after testing (2026-10-31)

Kiran asked for two choices only. The admin page offers **Public** and
**Password protected** (the `unlocked` level); projects without a demo just
show "Public". The `admin` (hidden) level stays in code only as the safe
default for unknown slugs, and a project already hidden can still be switched
back. New projects are seeded as Public on deploy instead of hidden.
