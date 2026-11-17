# Email code sign-in for guests

Date: 2026-11-14 · Branch: `feat/email-code-sign-in` · Status: agreed with Kiran, not built

Builds on [2026-10-31-password-any-project-design.md](2026-10-31-password-any-project-design.md).
Replaces the guest password with a code sent by email, and makes the guest
session last until Kiran ends it.

## Why

Kiran wants access to feel friendly: "request access, enter email, get a code
by email, and the session stays active unless I remove or pause the user". The
word-password a guest had to keep and type was the unfriendly part, and the
session cookie ended every time the browser closed.

## User flow (agreed with Kiran)

One screen, one button, for everyone. It replaces the password box on the
case-study teaser (`/projects/<slug>` when locked) and on `/showcase/unlock`.

1. **Visitor** sees an email box and a **Continue** button.
2. **Approved guest** (active, not expired, not paused): the box changes to
   "We sent a 6-digit code to a…@b.com" with a code field. The code arrives by
   email. They type it and land on the page they came for. They stay signed in
   on that device for a year, or until Kiran pauses, deletes or expires them.
   **Resend code** is greyed out for 60 seconds after each send.
3. **Unknown email** (never a guest, or paused or expired): the box changes
   into the request form with the email already filled in, plus name and an
   optional note. Sending shows the existing thank-you. Kiran gets the existing
   request email; a paused or expired guest shows up in the console as a
   returning guest, as today.
4. **Kiran approves** in the console as today (Approve on a request, or
   Invite someone). No password is created. The invitation Kiran sends says:
   open the link, enter your email, a code arrives.
5. **Kiran pauses, deletes or expires** a guest: their next page load is
   locked, on every device. This already works (the proxy checks the guest
   row on every request) and does not change.
6. **Sign out of their devices** (console, guest row menu) replaces **New
   password**. It ends every signed-in device for that guest; they sign in
   again with a new code.

Decided trade-off: the screen tells a visitor whether their email is on the
list (step 2 vs step 3). Kiran chose this over a vaguer "if approved, a code is
on its way" because the visitors are people he knows and the clearer screen
matters more. The per-visitor limit below keeps it from being used to probe
the list.

## Rules

- A code is 6 digits, made with the Web Crypto random generator.
- A code works for **10 minutes**, once. Asking again replaces the old one.
- **60 seconds** between codes for the same guest.
- **5 wrong tries** cancel the code; the guest asks for a new one.
- **5 codes per visitor (IP) per 15 minutes**, through the existing
  `login_attempts` limiter (same as requests today).
- The code is stored hashed (HMAC with `ADMIN_SESSION_SECRET`), never plain.
- The guest-pass cookie keeps its shape (`<guestId>.<signature>`, signed with
  the guest's pass key) and gets a **365-day** lifetime. Pause, delete, expiry
  and "Sign out of their devices" all still cut it off on the next request.
- The emergency `SHOWCASE_ACCESS` passwords keep working for the database-down
  case, behind a small "Use a password instead" link on the same screen.
  Their cookie stays a session cookie.
- Database down: no code can be sent or checked. The screen says so and
  offers the password link.

## Emails (both to the guest, through Resend, HTML plus plain text)

Both share one template: white card, system font, heading, short paragraphs,
one dark button, Kiran's name at the bottom. No images, inline styles only.

**Code email** · subject `123456 is your sign-in code`
- Heading: "Your sign-in code"
- The code, large (36px, spaced digits) in a bordered box. Phones offer it as
  an autofill suggestion because the code field asks for a one-time code, and
  it can be selected and copied in any email client.
- "Enter it on *Project name* to continue. It works for 10 minutes."
- Button **Open *Project name*** → the page they came from, with their email
  already filled in so only the code is left to type.
- "If you didn't ask for this, ignore this email."

**Invitation email** (sent by Kiran from the console, editable as today)
- Heading = the subject (default `Access to my private projects`).
- Kiran's message as paragraphs. The first project link also becomes the
  button **Open the project**.

Default invitation text:

```
Hi Jane,

You now have access to my private projects:

Cactus Plant
https://example.com/projects/cactus-plant

To open one, enter your email on the page and a 6-digit code will arrive.
You stay signed in on that device until I end your access.

It works until Nov 2, 2026, 18:00 JST.

Kiran
```

The "resume" and "reminder" variants keep their first lines ("Your access to
my private projects is back on:", "Here are the links to my private projects
again:").

## Console changes (small)

- Invite / Approve dialog: description "They'll sign in with their email. You
  get a message to send them." Button for an existing guest: **Resend
  access** (it renews status and expiry; no secret changes).
- Guest row menu: **New password** → **Sign out of their devices**, with a
  confirm dialog. The password reveal dialog goes.
- Returning-guest dialog: drop "Lost their password? Make a new one".
- Projects list keeps "Add password" / "Password protected" wording for
  project levels: that is Kiran's name for a locked project and it still fits.

## Data

Additive migration `0004_sign_in_codes.sql` on `guests`:
`sign_in_code_hash text`, `sign_in_code_expires_at timestamptz`,
`sign_in_code_attempts integer not null default 0`,
`sign_in_code_sent_at timestamptz`.

`password_lookup` stays and becomes the guest's **pass key**: 32 random bytes
as hex, set at invite, rotated by "Sign out of their devices". The guest-pass
cookie is signed with it, exactly as before.

## Out of scope

Magic links (clicking the email signs you in), SMS codes, remembering more
than one device policy, changing the admin login, and the architecture
candidates from the 2026-11-14 review.
