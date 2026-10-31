# Add a password to any project

Date: 2026-10-31 · Branch: `feat/admin` · Status: design, awaiting Kiran's approval

Builds on [2026-10-31-showcase-admin-design.md](2026-10-31-showcase-admin-design.md)
and [2026-11-01-admin-console-design.md](2026-11-01-admin-console-design.md).

## Why

Kiran wants to put any public project behind a password from the admin
console, so visitors have to ask for access, Kiran approves or declines in
Requests, and approved people become guests with their own password.

Today only the 3 projects with a live demo (`/showcase/<slug>`) can be
password protected. The other 14 are case studies at `/projects/<slug>`, which
are always open, even when the project's level is `unlocked`. The console's
row menu shows "Needs a demo" for them.

## User flow (agreed with Kiran)

1. **Kiran**: Projects → a public project → **…** → **Add password**. It
   locks for visitors straight away and appears under the Password Protected
   filter.
2. **Visitor**: the project card still shows on the portfolio, with the
   existing lock marker.
3. **Visitor** opens `/projects/<slug>` and gets a **teaser**: name, cover
   image and one-line description, then a password box and **Request access**
   (name, email, note). The case study body, details, stack and links are not
   sent.
4. **Visitor** sends a request and sees the existing thank-you message. Kiran
   gets the existing request email notification.
5. **Kiran**: the Requests badge goes up. **Approve** opens the existing
   invite dialog prefilled (name, email, project, expiry). Saving creates the
   guest with their own password, lists them in **Guests**, and shows the
   ready reply to copy into Kiran's own email. Nothing is emailed
   automatically.
6. **Kiran**: **Decline** removes the request. The visitor is not told.
7. **Visitor** enters the password on the teaser and sees the full case study.
   One pass opens both `/projects/<slug>` and, if the project has a demo,
   `/showcase/<slug>`, until the grant expires, is paused or removed.

## Goals

- Any project can be switched Public ↔ Password protected in the console.
- A password-protected project's `/projects/<slug>` page is locked for
  everyone except Kiran (admin session) and guests with a valid grant.
- The locked page is the teaser in step 3, styled like the portfolio
  (`(site)` route group), with the existing unlock and request-access
  behaviour (rate limit, error messages, thank-you state).
- One guest pass per project covers `/projects/<slug>` and `/showcase/<slug>`.
- Locked projects stay out of search: not in the sitemap (already so), and
  the teaser is `noindex`.
- In the row menu: **Add password** on public projects, **Make public** on
  protected ones (still confirms first). "Needs a demo" goes away.

## Non-goals

- Automatic emails on approve or decline.
- Any change to the database schema, guests, grants, requests, passwords,
  expiry or the Requests and Guests pages.
- Locking articles or the home and about pages.
- Changing how the 3 demo projects' showcase pages look when locked.

## Anti-goals (a failure even if it "works")

- The full case study HTML (or its RSC payload) ever reaching a visitor
  without access, including from a CDN or static cache.
- A database outage making a protected project open (must fail closed, as
  `decideAccess` already does).
- The teaser page or its unlock form living in the `(showcase)` group or
  importing showcase CSS (the groups stay isolated, see CLAUDE.md).

## Constraints

- `/projects/[slug]/page.tsx` is `force-static` and fully pre-built. Locking
  must happen in the proxy (`src/proxy.ts` → `gateRequest`), which already
  matches `/projects/:path*`, by sending the teaser instead of the page, and
  gated responses must be `no-store` (as for showcase pages today).
- Guest cookies are path-scoped to `/showcase/<slug>` today
  (`accessCookieOptions`, and the guest token cookie set by the unlock
  action). They must also reach `/projects/<slug>`.
- `canBeUnlocked(slug)` currently limits Unlocked to demo projects in the
  `setProjectLevel` action, `addGuest` picker and the menu; that limit is
  removed. The unlock page's `getShowcaseProject(slug)` check likewise.
- Migrations: none expected. If one turns out to be needed it must be
  additive (Preview shares the production database).
- Follow repo CLAUDE.md: shadcn, semantic tokens, `space-y-*`, `&apos;`,
  single quotes, no build run.

## Kiran's calls

- Locks straight away on **Add password**.
- Teaser + lock on the locked page.
- On approve: copy the reply and email it yourself (as today).
- On decline: silent (as today).

## Claude's calls (Kiran may override)

- Menu wording: **Add password** / **Make public**, replacing the
  Public / Password protected radio, so the action reads as a verb.
- One pass covers both addresses of a project rather than separate passes.
- The teaser shows name, cover image and description from frontmatter only.
- Hidden (admin) projects keep returning 404 on `/projects/<slug>`, as today.
- The `SHOWCASE_ACCESS` fallback passwords work on `/projects/<slug>` too, so
  there is one access rule per project, not one per address.
- After a correct password on the teaser, the visitor stays on
  `/projects/<slug>` and sees the full page (no detour via `/showcase/unlock`).
- `/showcase/unlock` keeps working for the 3 demo projects as it does today.

## Left to the builder

- How the proxy serves the teaser (rewrite to a teaser route vs. other), as
  long as the anti-goals hold and the URL the visitor sees stays
  `/projects/<slug>`.
- Cookie path and naming changes, and how existing showcase cookies keep
  working (or are reissued) after the change.
- Whether the unlock form and request dialog are shared components or a
  `(site)` variant, within the group isolation rule.
- Tests: gate decisions for `/projects/<slug>` at every level, including
  database down; cookie reaching both paths; menu wording; the action
  accepting Unlocked for a project without a demo.
