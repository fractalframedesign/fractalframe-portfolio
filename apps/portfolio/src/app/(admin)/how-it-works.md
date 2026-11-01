# How the admin works

A plain-words guide to the admin console at `/admin`: what each page does,
what happens when someone asks to see a locked project, and what to do when
something goes wrong.

## The big idea

Every project on the site has one of three **access levels**:

| Level        | Who can see it                                  | What a visitor sees                                   |
| ------------ | ----------------------------------------------- | ----------------------------------------------------- |
| **Public**   | Everyone                                        | The full page                                         |
| **Unlocked** | Guests with a password, and you                 | A teaser with a password box and "Request access"    |
| **Admin**    | Only you                                        | A normal "page not found", as if it doesn't exist     |

A **guest** is a person, not a project. Each guest has **one password** that
opens **every** Unlocked project: case studies and demos, including projects
you lock later.

The levels are stored in the database (Neon), so changing one in the console
takes effect on the live site within about 10 seconds. No redeploy needed.

## The pages

**Overview** shows the numbers at a glance: requests waiting, protected
projects, active guests, and who is expiring this week.

**Projects** lists every project with its level. Use the row menu:
- **Add password** makes a project Unlocked.
- **Make public** opens it to everyone.

The **Invite someone** button at the top creates a guest and gives you a
message to send them.

**Requests** is your inbox of people asking for access. Each request can be:
- **Approved**: creates the guest (or welcomes back a returning one) and writes the message.
- **Declined**.
- **I sent it myself**: marks it answered when you replied another way, such as Gmail.

**Guests** lists everyone you have let in, with their status:
- **Active**: their password works.
- **Paused**: you turned them off; the password stops working.
- **Expired**: their end date passed.

From a guest's row you can pause, change the end date, give a new password,
edit their details, or remove them.

**Settings** is where you change your admin password.

## What happens when someone asks for access

1. A visitor opens a locked project and sees the teaser.
2. They fill in **Request access** (name, email, message).
3. The request is saved in **Requests**, and an email goes to you.
4. You approve it. The console creates their guest and a password, then
   writes a message with the password and a link to each locked project.
5. You send the message:
   - **Send invitation** emails it for you from fractalframe.design@gmail.com.
     If they reply, it lands in kiranspingle@gmail.com.
   - Or **Copy message**, paste it into Gmail, then press **I sent it myself**.
6. The guest types the password once. The browser remembers it until they
   close the browser, and it opens every locked project.

### When the same person asks again

The console notices it is the same email:
- **Paused or expired**: **Resume access** turns them back on with the **same password** and a new end date.
- **Still active**: **Send links again** writes the message again. Nothing changes.
- **Lost their password**: **New password** makes a fresh one. Their old one stops working straight away.

## Turning someone off

**Pause** or **remove** a guest and their password stops working at once.
Any project page they already have open locks within about 30 seconds.

## Safety rules built in

- **If the database is down, nothing becomes more visible.** Locked projects
  stay locked; hidden ones stay hidden.
- **Too many wrong passwords** (5 in 15 minutes) blocks that visitor for
  15 minutes. The same limit applies to the admin login and to access requests.
- **Your admin login** lasts 12 hours, or 30 days with **Remember me**.
  Changing your admin password signs out every other device.

## When something goes wrong

| Problem                                       | What to do                                                                                                                         |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Forgot the admin password                     | In the Neon SQL editor run `DELETE FROM admin_account;`, then log in with the `ADMIN_PASSWORD` set in Vercel. Then set a new one in Settings. |
| "Email to guests isn't set up yet"            | `GMAIL_USER` or `GMAIL_APP_PASSWORD` is missing in Vercel. Meanwhile use **Copy message** and **I sent it myself**.                 |
| Send invitation says the email failed         | The Gmail app password was deleted or changed. Make a new one at myaccount.google.com/apppasswords and replace `GMAIL_APP_PASSWORD` in Vercel, then redeploy. |
| A guest says their password doesn't work      | Check **Guests**: paused or expired? Use **Resume access**. Lost it? Use **New password**.                                          |
| Every guest password stopped working at once  | `ADMIN_SESSION_SECRET` in Vercel was changed or differs between Production and Preview. It must stay the same.                      |

## Where things live (for Claude or a developer)

- Pages: `src/app/(admin)/admin/(console)/` (one folder per page; login sits outside it).
- Sidebar menu: `src/lib/admin-nav.ts`. A new page is one entry there plus one folder.
- Button actions (approve, pause, invite…): `src/app/(admin)/admin/actions.ts`.
- Access rules, passwords and database code: `src/lib/access/`.
- The doorman that checks every `/projects`, `/showcase` and `/admin` visit: `src/proxy.ts`.
- Styles for the admin only: `src/app/(admin)/admin.css`.
