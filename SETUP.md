# Setup

Written for the officers who inherit this site, not for a developer. If you can
follow a recipe you can run this.

---

## 1. Run it on your computer

You need [Node.js](https://nodejs.org) 20.9 or newer. Check with `node -v`.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Edits appear immediately.

---

## 2. Change the content

**Almost everything you will ever want to change is in one file:
`content/club.ts`.** Names, dates, meeting times, prize amounts, the copy on
every page.

Search that file for `TODO` to find every unfinished item. Each one has a
comment saying what belongs there.

The other two content files:

| File | Holds |
| --- | --- |
| `content/club.ts` | Copy, dates, officers, prizes, schedule |
| `content/projects.ts` | Shipped projects and their case studies |
| `content/sponsors.ts` | Sponsors and the become-a-sponsor pitch |

You should not need to touch anything in `app/` or `components/` to keep the
site current.

### Dates

Dates are ISO 8601 with an explicit timezone offset:

```ts
nextHackathonDeadline: "2026-10-07T23:59:00-07:00",
```

`-07:00` is Pacific Daylight Time. From early November to early March, use
`-08:00`. A date in the past is skipped automatically — the countdown falls
back to the next meeting, and hides itself entirely if both have passed. A
stale date degrades quietly rather than showing a negative countdown.

### Prize amounts

An amount of `0` renders as **TBA**, not `$0`. It is safe to launch before the
figures are settled.

### Photos

Officer portraits go in `public/team/`, then set `image: "/team/name.jpg"` in
`content/club.ts`. With no image the card renders a monogram tile, which is a
designed state — it does not look broken, so there is no rush.

Sponsor logos go in `public/brand/`. With no logo the sponsor name is set in
type, which is also deliberate.

### The sample projects

`content/projects.ts` ships with two entries flagged `sample: true`. They exist
so the archive is never empty before your first hackathon, and they render with
a **Sample** label so nobody mistakes them for real work. Delete them once you
have real projects.

---

## 3. Make the application form work

The form at `/join` sends to two places independently. Set up either one, or
both. If one is misconfigured the other still receives the application.

Create a file called `.env.local` in the project root. Copy `.env.example` as a
starting point. **Never commit `.env.local`** — it is already gitignored.

### Option A — Email (Resend)

1. Make a free account at <https://resend.com>. The free tier is 3,000 emails
   a month, far more than a club needs.
2. Go to **API Keys**, create one, copy it.
3. Put this in `.env.local`:

```
RESEND_API_KEY=re_xxxxxxxxxxxx
APPLY_TO_EMAIL=you@example.com
```

`APPLY_TO_EMAIL` accepts several addresses separated by commas, so every
officer can get a copy.

By default mail is sent from Resend's shared address, which needs no domain
setup. Once you own a domain and verify it with Resend, add:

```
APPLY_FROM_EMAIL=Ship It Society <apply@yourdomain.com>
```

### Option B — Google Sheet

Better for reviewing applications together as a board.

1. Make a new Google Sheet.
2. **Extensions → Apps Script**. Delete what is there and paste:

```js
function doPost(e) {
  var data = JSON.parse(e.postData.contents);

  // Optional shared secret. If you set one here, set the same value as
  // GOOGLE_SHEETS_SECRET in .env.local.
  var SECRET = "";
  if (SECRET && data.secret !== SECRET) {
    return ContentService.createTextOutput("forbidden");
  }

  var sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Received", "Name", "Email", "Grade", "Experience", "Why", "Idea", "Status",
    ]);
  }
  sheet.appendRow([
    data.receivedAt, data.name, data.email, data.grade,
    data.experience, data.why, data.idea, "new",
  ]);
  return ContentService.createTextOutput("ok");
}
```

3. **Deploy → New deployment → Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy the web app URL and put it in `.env.local`:

```
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/xxxx/exec
GOOGLE_SHEETS_SECRET=
```

### Test it

With the dev server running:

```bash
curl -X POST http://localhost:3000/api/apply \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Student","email":"test@example.com","grade":"11","experience":"some","why":"I want to build something and actually ship it."}'
```

A successful response tells you what happened to each sink:

```json
{ "ok": true, "delivery": { "email": "sent", "sheet": "skipped" } }
```

`skipped` means that sink is not configured. `failed` means it is configured but
did not work — check the terminal for the reason.

> If you configure **neither**, the form still appears to work but applications
> are **not stored anywhere**. The server logs a loud warning when this happens.

---

## 4. Put it on the internet

1. Push the project to GitHub.
2. Go to <https://vercel.com>, sign in with GitHub, **Add New → Project**, pick
   the repository. Vercel detects Next.js on its own.
3. Under **Environment Variables**, add the same values from `.env.local`, plus:

```
NEXT_PUBLIC_SITE_URL=https://your-real-domain.com
```

That one matters — it is used for the sitemap, the social share card, and the
structured data. Without it those point at a placeholder.

4. Deploy. Every later `git push` redeploys automatically.

### A custom domain

In Vercel: **Settings → Domains**. A `.dev` or `.org` domain is usually
$10–15/year. Update `NEXT_PUBLIC_SITE_URL` to match and redeploy.

---

## 5. Handing over to next year's officers

1. Add them to the GitHub repository.
2. Add them to the Vercel project.
3. Move `APPLY_TO_EMAIL` to their address.
4. Point them at this file and at `content/club.ts`.

The design rules the site is built to are written down in `CLAUDE.md`. If you
use an AI assistant to make changes, it will read that file and stay consistent
with what is already here. Those rules exist for a reason — the site is built to
not look generated, and most of that is in the constraints.

---

## Commands

| Command | Does |
| --- | --- |
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Production build. Run before pushing if unsure. |
| `npm start` | Serve the production build locally |
| `npm run lint` | Check code quality |
