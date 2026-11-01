# To do

## Next session: start here

Branch `feat/admin` is on Preview. PR #18 put the admin live; newer changes wait for a second PR (item 4).
Design: [2026-10-31-password-any-project-design.md](superpowers/specs/2026-10-31-password-any-project-design.md)

1. [ ] **Email sender (Gmail)**: set up, waiting for a test on Preview.
       Emails go from fractalframe.design@gmail.com; replies go to
       kiranspingle@gmail.com.
   - [x] Kiran: 2-Step Verification on fractalframe.design@gmail.com (Okta Verify).
   - [x] Kiran: App password "Portfolio" (the first one leaked in a
         screenshot and was deleted; a new one is in use).
   - [x] Kiran: `GMAIL_USER` and `GMAIL_APP_PASSWORD` (Secret) in Vercel,
         Production and Preview.
   - [x] Claude: Gmail sending in `send-email.ts` (Resend stays as the
         fallback), tested and pushed.
   - [ ] Kiran: on Preview, invite yourself, press **Send invitation**, check
         the email arrives with the links and password.
   - Later, optional: own domain with Resend instead (`ACCESS_REQUEST_FROM`
     on a verified domain); remove the Gmail variables to switch.
2. [ ] **Test on Preview** (newest `feat/admin` deployment): invite, approve,
       pause (open pages lock within ~30 s), Resume access (same password),
       Send links again, I sent it myself, locked case study teaser, admin
       password change in Settings.
3. [ ] **Check Vercel Production env vars**: `DATABASE_URL`,
       `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (same value as Preview, or
       every guest password breaks), `RESEND_API_KEY`, plus the Gmail ones.
4. [ ] **Second pull request** `feat/admin` → `main`. The first one (#18)
       was merged on 2026-10-31 up to "release review fixes". Still only on
       Preview: I sent it myself, Hi there greeting, sidebar photo, Gmail
       sending, the admin guide. Open it after the Gmail test passes:
       https://github.com/fractalframedesign/fractalframe-portfolio/compare/main...feat/admin?expand=1
       Merge only after Kiran says go.

### Known, deferred
- Every guest page view writes a visit-count update to the database (only one
  per hour counts); could skip the write. Small cost.
- Older commits on `feat/admin` carry a Co-Authored-By line, against
  CLAUDE.md. Rewriting them needs Kiran's OK; new commits don't have it.

## Done (on `feat/admin`, pending merge)

- [x] **Showcase admin**: access levels, guests, request inbox.
      Design: [2026-10-31-showcase-admin-design.md](superpowers/specs/2026-10-31-showcase-admin-design.md)
- [x] **Admin console**: sidebar dashboard with projects, requests and guests pages.
      Design: [2026-11-01-admin-console-design.md](superpowers/specs/2026-11-01-admin-console-design.md)
- [x] **Any project lockable, one password per person**, invitations with
      links, Resume access, Send links again, release review fixes.

## Later

- [ ] **Vercel Web Analytics**: turn it on in Vercel,
      add `@vercel/analytics` to the site, and put a **View analytics** button
      on the admin page that opens it in Vercel. Free on Hobby: 50,000 page
      views a month across all projects, 1 month of history, no click
      tracking, collection pauses (never charges) if the limit is hit.
- [ ] **Architecture review**: run `/improve-codebase-architecture` and pick
      what to improve.
