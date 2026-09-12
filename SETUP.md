# Setup

A guide for the student officers who run this site. You do not need to be a web
developer: every task below is an edit to one file or a setting in an online
dashboard, done in order.

1. [Run the site on your computer](#1-run-the-site-on-your-computer)
2. [Change the content](#2-change-the-content)
3. [Keep the Discord invite working](#3-keep-the-discord-invite-working)
4. [Deliver the forms](#4-deliver-the-forms)
5. [Deploy on Vercel](#5-deploy-on-vercel)
6. [Move to the custom domain](#6-move-to-the-custom-domain)
7. [Hand over to next year's officers](#7-hand-over-to-next-years-officers)

---

## 1. Run the site on your computer

Install [Node.js](https://nodejs.org) 20.9 or newer, then in the project folder:

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Saved edits appear in the browser straight away.

Before you push a change, run the same check the build runs:

```bash
npm run check:placeholders
```

It fails on unfinished text, and prints the file and line of each problem. A
failure here would also fail the deploy.

---

## 2. Change the content

Everything the site says lives in `content/`. You should never need to edit
`app/` or `components/` to keep the site current. Each fact is written once and
the rest of the site reads it, so change it in one place and every page that
mentions it follows.

### The meeting

In `content/club.ts`, `meeting`:

| Field | Meaning |
| --- | --- |
| `cadence` | How often, in words, as printed on the site |
| `time` | When, in words |
| `room` | The room. Set it to `""` to hide the room everywhere |
| `nextMeeting` | Any one real meeting, as a date and time with its offset, e.g. `"2026-09-23T12:15:00-07:00"` |

The site finds the next meeting by stepping forward two weeks at a time from
`nextMeeting`, at the same local time. You only change it when the day, the time
or the two-week rhythm changes.

### The season

In `content/club.ts`, `season` lists each hackathon:

```ts
{ name: "Hackathon 01", start: "2026-09-23", end: "2026-10-23", utcOffset: "-07:00" },
```

- `start` and `end` are calendar dates. A hackathon opens at midnight on
  `start` and closes at 11:59 PM on `end`, Pacific time.
- `utcOffset` is the offset on the `end` date: `-07:00` from mid-March to early
  November, `-08:00` from early November to mid-March.

The countdown, the calendar, the projects archive status and the search engine
event listings all read this list. When a season ends, add the next one's dates
here.

### Prizes and teams

- `prizes.tiers` in `content/club.ts` holds each prize's name and amount in
  whole dollars. To drop a prize, delete its tier; do not set an amount to 0.
- `prizes.rules` is the list of prize rules shown on the site and in the FAQ.
- `teams.max` is the largest team allowed. The FAQ and the join page wording
  follow it.

### Officers

`officers` in `content/club.ts` has each officer's `name`, `role` and `image`.
To add a photo, put the file in `public/team/` (create the folder the first
time), then set `image` to its path, e.g. `"/team/derrick.jpg"`. With no
image, the card shows the officer's initials instead.

### Links that stay hidden until set

In `club` at the top of `content/club.ts`:

- `slides`: the meeting slides link. While it is `""`, no slides link appears.
- `instagram`: the club's Instagram profile. While it is `""`, no Instagram link
  appears.
- `discord` and `github` work the same way.

### Sponsors, projects and the update date

- `content/sponsors.ts`: each sponsor's name, what they do, what they give, and
  their link.
- `content/projects.ts`: shipped projects. The archive page and the sitemap
  pick up the first entry automatically. Every field in an entry needs a real
  value.
- `siteUpdated` near the top of `content/club.ts`: the date the site's facts
  last changed. Move it forward when you edit content; search engines read it
  from the sitemap.

---

## 3. Keep the Discord invite working

The invite currently in `club.discord` **expires on October 3, 2026**, and it
opens into an officers' channel. Replace it before then with a permanent invite
to the welcome channel:

1. In Discord, right-click the server's welcome channel and choose
   **Invite People**.
2. Choose **Edit invite link**. Set **Expire After** to **Never** and
   **Max Number of Uses** to **No limit**, then generate the link.
3. Copy the link into `club.discord` in `content/club.ts`, and deploy.

The site tells visitors the Discord is open to anyone, before or after they
apply, so the invite must not require an approval step.

---

## 4. Deliver the forms

The site has five built-in forms:

| Form | Where | Sent as |
| --- | --- | --- |
| Membership application | `/join` | `apply` |
| Register interest | `/get-involved` | `interest` |
| Offer a talk | `/get-involved` | `speaker` |
| Ask a question | `/get-involved` | `question` |
| Donate a prize or gift | `/get-involved` | `gift` |

Every submission is delivered to **email** (through Resend), to a **Google
Sheet**, or to both. Set up at least one. If one of them fails, the other still
receives the submission. On the live site, if neither is set up, the forms
refuse submissions and ask visitors to email the officers instead, so nothing is
silently lost.

### Environment variables

These are secret settings the server reads. Locally they go in a file named
`.env.local` in the project folder (copy `.env.example`; it is never committed).
On the live site they go in Vercel (section 5).

| Variable | What to set |
| --- | --- |
| `RESEND_API_KEY` | Your Resend API key |
| `APPLY_TO_EMAIL` | The inbox that receives submissions. Several addresses can be separated with commas |
| `APPLY_FROM_EMAIL` | Optional. The sender. Leave it empty to use Resend's shared sender |
| `GOOGLE_SHEETS_WEBHOOK_URL` | The Apps Script web app URL, ending in `/exec` |
| `GOOGLE_SHEETS_SECRET` | A long random password that only the site and the script know |
| `NEXT_PUBLIC_SITE_URL` | The site's public address, with `https://` and no trailing slash |

### Email with Resend

Resend's shared sender works without owning a domain, but it only delivers to
the email address that owns the Resend account. So:

1. Sign up at [resend.com](https://resend.com) **using the club's own email
   address**, the one in `club.email`.
2. Open **API Keys**, create a key with sending access, and copy it into
   `RESEND_API_KEY`.
3. Set `APPLY_TO_EMAIL` to that same club address. Leave `APPLY_FROM_EMAIL`
   empty.

Each email's reply-to is the person who filled in the form's address, so pressing
reply answers them directly.

To deliver to several officers' own inboxes, or to send from an address on the
club's domain, first verify a domain in Resend (**Domains**, then follow the DNS
steps), then set `APPLY_FROM_EMAIL` to an address on it, such as
`Ship It Society <forms@your-domain>`, and add the other inboxes to
`APPLY_TO_EMAIL`.

### A Google Sheet

The site sends each submission to the sheet as JSON:

```json
{ "secret": "...", "form": "speaker", "submittedAt": "2026-09-23T19:15:00.000Z", "fields": { "name": "...", "email": "..." } }
```

The script below checks the secret, writes the submission to a tab named after
the form (creating the tab and its header row the first time), and answers `ok`.
With a wrong or missing secret it answers `forbidden` and writes nothing. The
site only counts a submission as stored when the answer is exactly `ok`.

**1. Create the sheet.** Make a new Google Sheet with the club's Google
account, and name it something like *Ship It Society forms*.

**2. Add the script.** Open **Extensions → Apps Script**, delete the starter
code, and paste:

```js
/**
 * Ship It Society: form submissions from the website.
 *
 * The site POSTs { secret, form, submittedAt, fields }. Each form gets its
 * own tab, named after the form. Row 1 of a tab is its header: submittedAt,
 * then each field name in the order it first arrived. A field the form adds
 * later gets a new column on the right, so old rows keep their columns.
 */
function doPost(e) {
  var payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return answer("forbidden");
  }

  var expected = PropertiesService.getScriptProperties().getProperty("FORMS_SECRET");
  if (!expected || !payload || payload.secret !== expected) {
    return answer("forbidden");
  }

  var tabName = String(payload.form || "").replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
  var fields = payload.fields || {};
  if (!tabName) {
    return answer("forbidden");
  }

  // One writer at a time, so two submissions at once cannot share a row.
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var book = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = book.getSheetByName(tabName) || book.insertSheet(tabName);

    var header = ["submittedAt"];
    if (sheet.getLastRow() > 0) {
      header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }
    var added = Object.keys(fields).filter(function (key) {
      return header.indexOf(key) === -1;
    });
    if (sheet.getLastRow() === 0 || added.length > 0) {
      header = header.concat(added);
      sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    var row = header.map(function (key) {
      if (key === "submittedAt") return asText(payload.submittedAt);
      return Object.prototype.hasOwnProperty.call(fields, key) ? asText(fields[key]) : "";
    });
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  return answer("ok");
}

/** Text that starts like a formula is stored as plain text, never run. */
function asText(value) {
  var text = value === null || value === undefined ? "" : String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function answer(text) {
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
}
```

**3. Store the secret.** Make a long random password (a password manager can
generate one). In Apps Script, open **Project Settings** (the gear), scroll to
**Script Properties**, choose **Add script property**, and add a property
named `FORMS_SECRET` whose value is that password. Keeping it here rather than
in the code means the code can be shared without sharing the secret.

**4. Deploy it.**

1. Choose **Deploy → New deployment**.
2. Next to **Select type**, click the gear and choose **Web app**.
3. Set **Execute as** to **Me**, and **Who has access** to **Anyone**. The
   site's server has no Google account, so the web app must accept anonymous
   requests; the secret is what keeps everyone else out.
4. Click **Deploy**, and approve the permissions Google asks for.
5. Copy the **Web app URL**. It ends in `/exec`.

**5. Connect the site.** Set `GOOGLE_SHEETS_WEBHOOK_URL` to the web app URL and
`GOOGLE_SHEETS_SECRET` to the same password you stored in step 3.

**Changing the script later.** Paste the new code, then choose **Deploy →
Manage deployments**, click the pencil on the existing deployment, set
**Version** to **New version**, and click **Deploy**. This keeps the same URL.
Choosing *New deployment* instead creates a new URL, which the site would not
know about.

### Check that it works

After setting the variables (and redeploying, on the live site), open
`/get-involved`, send the question form with your own email address, and
confirm the email arrived and a `question` tab appeared in the sheet.

If nothing arrives, open the Vercel project's **Logs** and search for
`[forms]`. Every delivery failure is logged there with its reason, such as a
rejected Resend key or a sheet that answered `forbidden` because the two secrets
do not match.

---

## 5. Deploy on Vercel

1. Sign in to [vercel.com](https://vercel.com) with GitHub, choose
   **Add New → Project**, and import this repository. Vercel detects Next.js by
   itself.
2. In the project's **Settings → Environment Variables**, add the variables from
   section 4 for the **Production** environment. Add them to **Preview** too if
   you want forms on preview deployments to deliver.
3. Deploy. From then on, every push to the production branch updates the live
   site.

Environment variables apply to new deployments only. After changing one, go to
**Deployments**, open the latest production deployment's menu, and choose
**Redeploy**.

The site regenerates its pages every six hours, so the next meeting and the
current hackathon stay correct without a redeploy. Content edits still need a
push.

---

## 6. Move to the custom domain

The club has applied for an `is-a.dev` subdomain. Once it is approved:

1. In Vercel, open **Settings → Domains**, add the domain, and create the DNS
   record Vercel shows, following the registry's instructions.
2. Set `NEXT_PUBLIC_SITE_URL` to the new address, with `https://` and no
   trailing slash, for the Production environment.
3. Redeploy.

That one variable moves every absolute URL the site publishes: canonical links,
the sitemap, `robots.txt`, the structured data for search engines, and the
social card. Nothing else in the code names the address.

The registry turned the first application down as an incomplete website, which
is why the placeholder check exists. Keep it passing.

---

## 7. Hand over to next year's officers

1. Add them to the GitHub repository and the Vercel project.
2. Share the club email, Resend, Google Sheet and Discord server with them.
3. Update `officers` in `content/club.ts`.
4. Point them at this file, and at [CLAUDE.md](./CLAUDE.md) for the design
   rules the site is built to.
