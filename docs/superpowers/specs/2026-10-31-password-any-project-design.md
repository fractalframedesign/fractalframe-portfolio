# One password per person, any project lockable

Date: 2026-10-31 · Branch: `feat/admin` · Status: implemented on feat/admin, pending review and manual check

Builds on [2026-10-31-showcase-admin-design.md](2026-10-31-showcase-admin-design.md)
and [2026-11-01-admin-console-design.md](2026-11-01-admin-console-design.md).
Changes the guest model described there.

## Why

Kiran wants to lock any project from the console, and to manage **people,
not projects**: one request from a visitor, one approval, one password per
email that opens every locked project. Kiran said: "create one password for
one email id and unlock all locked case studies, simple to manage".

Today:
- Only the 3 projects with a live demo (`/showcase/<slug>`) can be locked.
  The other 14 case studies at `/projects/<slug>` are always open, even at
  level `unlocked`; the console says "Needs a demo" for them.
- Access is per project: a guest has one grant per project, each with its own
  status and expiry, and a new grant for an existing email replaces their
  password.

## User flow (agreed with Kiran)

1. **Kiran**: Projects → a public project → **…** → **Add password**. It
   locks straight away and appears under the Password Protected filter.
2. **Visitor**: the card still shows on the portfolio, with the existing lock
   marker.
3. **Visitor** opens a locked `/projects/<slug>` and gets a **teaser**: name,
   cover image and one-line description, then a password box and **Request
   access** (name, email, note). The case study body, details, stack and links
   are not sent.
4. **Visitor** sends the request (no project choices: it's for everything
   locked) and sees the existing thank-you message. Kiran gets the existing
   request email, which says which page they asked from.
5. **Kiran**: the Requests badge goes up. **Approve** opens the invite dialog
   prefilled with name and email, plus expiry (24h, 48h, custom, no end); no
   project picker. Saving creates the guest with **one password**, lists them
   in **Guests**, and shows the ready reply to copy into Kiran's own email.
   Nothing is emailed automatically.
6. **Kiran**: **Decline** removes the request. The visitor isn't told.
7. **Visitor** enters the password on any locked project (teaser or showcase
   unlock page) and from then on opens **every locked project**, case studies
   and live demos, until Kiran pauses or removes them or their access ends.
8. **Kiran** locks another project later: every approved guest can open it
   too.

## Access rule

A visitor may open a locked (`unlocked` level) project when **any** of:
- they have Kiran's admin session;
- they have a valid guest pass: the guest exists, their access is active and
  not expired, and the cookie was issued for their current password;
- the existing `SHOWCASE_ACCESS` fallback password matches.

Hidden (`admin` level) projects stay admin-only (404 for everyone else).
Database down: nothing becomes more visible (fail closed, as `decideAccess`
does today).

## Guests (Kiran's call)

- One guest per email, one password, one status (active / paused) and one
  expiry, all on the person. No per-project choices anywhere in the UI.
- **Repeat requests** (Kiran: "resend access"): a request from an email
  that is already a guest (active, paused or expired) shows "Already a guest"
  in Requests with **Resend access** instead of Approve, plus Decline.
  **Resend access** opens the invite dialog prefilled with their name, email
  and current expiry (editable). Saving issues a **new password** (passwords
  are stored hashed, so the old one can't be resent), makes their access
  active, applies the expiry, marks the request approved and shows the reply
  to copy. Their old password and cookies stop working.
- Guests page: one row per person. Actions: pause / resume, change expiry,
  new password, edit name and note, remove. The project filter and column go;
  the status filter stays. A guest with no email (manual invite) is always a
  new guest.

## Goals

- Any project can be locked from the console (**Add password** /
  **Make public**, the latter still confirms first).
- Locked `/projects/<slug>` pages show the teaser; the full page only with
  access.
- One password per email opens every locked project, now and later.
- Locked projects stay out of search (sitemap already excludes them; the
  teaser is `noindex`).
- Overview, Requests, Guests, invite dialog and ⌘K reflect the person-based
  model (counts are of people).

## Non-goals

- Automatic emails on approve or decline.
- Per-project access for showcase projects (that's what this removes).
- Selling or paid products (later; see Constraints).
- Locking articles, home or about.

## Anti-goals (a failure even if it "works")

- The full case study HTML or RSC payload reaching a visitor without access,
  including from a CDN or static cache.
- A database outage opening a locked project.
- An approved guest's old password still working after **New password** or
  **Remove**.
- The teaser or its forms living in the `(showcase)` group or importing
  showcase CSS (route groups stay isolated, see CLAUDE.md).

## Constraints

- `/projects/[slug]/page.tsx` is `force-static`. Locking happens in the proxy
  (`src/proxy.ts` → `gateRequest`, which already matches `/projects/:path*`)
  by serving the teaser instead of the page; gated responses are `no-store`.
  The URL the visitor sees stays `/projects/<slug>`.
- Guest cookies today are per project and path-scoped to `/showcase/<slug>`,
  and guest tokens are signed for one slug. The pass must be one cookie that
  reaches every `/projects/…` and `/showcase/…` page and is tied to the
  guest's current password (so **New password** signs old cookies out).
- **Keep the per-project `grants` table** and its `source: 'purchase'` value:
  it's the planned home for selling digital products later. The site-wide
  pass is a separate, person-level record. All schema changes are
  **additive** (Preview migrates the shared production database): no drops
  or renames.
- **Existing guests** (Claude's call below) are carried over by a migration
  or a one-off step, without anyone's password changing.
- `canBeUnlocked(slug)` stops limiting which projects can be locked (in
  `setProjectLevel`, the menu, and the unlock page's `getShowcaseProject`
  check).
- Follow repo CLAUDE.md: shadcn, semantic tokens, `space-y-*`, `&apos;`,
  single quotes, no build run.

## Kiran's calls

- Locks straight away on **Add password**.
- Teaser + lock on the locked page.
- One password per email unlocks all locked projects, including ones locked
  later, and including live demos.
- On approve: copy the reply and email it yourself. On decline: silent.
- Someone already approved who asks again: **Resend access** (a new password,
  since the old one can't be read back).

## Claude's calls (Kiran may override)

- Menu wording **Add password** / **Make public**.
- **Existing guests become all-project guests**: active if any of their
  current grants is active and unexpired; expiry = the latest expiry among
  those (none if any has none); their password is unchanged.
- The request still records the page it came from (shown in Requests and the
  email), for context only.
- The teaser shows name, cover image and description from frontmatter only.
- After a correct password on the teaser, the visitor stays on the page and
  sees it in full. `/showcase/unlock` keeps working for demo projects.
- The Projects page "Copy password" button opens the invite dialog (no
  project to preselect any more).

## Accepted after review

- "Straight away" means within about 10 seconds: the proxy caches project
  levels for 10 seconds per instance (`LEVEL_TTL_MS` in `gate.ts`).
- New `guests` rows default to paused access, so rows written by code from
  before this change never get open access (migration 0003).

## Left to the builder

- How the person-level pass is stored (columns on `guests` or a new table),
  and how visit counts move to it.
- How the proxy serves the teaser.
- Cookie name, path and token format, and how old per-project cookies stop
  or keep working during the switch.
- Whether unlock and request forms are shared components or a `(site)`
  variant, within the group-isolation rule.
- Tests: gate decisions for `/projects/<slug>` and `/showcase/<slug>` at every
  level (admin, guest active / paused / expired, fallback, database down);
  one pass opening several projects; New password and Remove revoking the
  pass; Resend access issuing a new password and reactivating; existing guests carried over.
