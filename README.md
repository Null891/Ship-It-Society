# Ship It Society

The website of Ship It Society, a student hackathon club at Fremont High School
in Sunnyvale, California. Members build real apps in one-month hackathons, from
idea to deployed product, and every project passes an ArgosX security review
before it goes live.

**Live site:** <https://ship-it-society.vercel.app>

- To change what the site says, edit the files in `content/`.
- To connect the forms to email and a Google Sheet, or to move to a custom
  domain, follow [SETUP.md](./SETUP.md).
- Before changing how the site looks or moves, read [CLAUDE.md](./CLAUDE.md).

---

## The site

| Route | What it is |
| --- | --- |
| `/` | The premise, the one-month format, the security review, prizes, sponsors and the FAQ |
| `/hackathons` | The format in full, the season calendar and the prizes |
| `/handbook` | The member handbook |
| `/about` | The club and its officers |
| `/sponsors` | Who funds the club and what sponsorship pays for |
| `/join` | The membership application |
| `/get-involved` | Short forms to register interest, offer a talk, ask a question or donate |
| `/projects` | The archive of shipped projects, with a case study per project |

The archive stays out of the navigation and the sitemap until its first entry
is published.

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript in strict mode |
| Styling | Tailwind CSS 4, configured in CSS in `app/globals.css` (there is no `tailwind.config.js`) |
| Motion | Motion 13, and Lenis for smooth scrolling |
| Type | Switzer from Fontshare; Geist Mono from the `geist` package |
| Forms | react-hook-form and Zod 4; each form's schema is shared by the page and its API route |
| Delivery | Resend for email, and a Google Apps Script web app for the spreadsheet |
| Hosting | Vercel, with Vercel Analytics and Speed Insights in production |

## Run it locally

You need Node.js 20.9 or newer (`node -v` to check).

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. The forms work with no configuration in
development: a submission is accepted, and the terminal notes that it was not
stored anywhere. SETUP.md explains how to deliver them.

| Command | Does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Placeholder check, then a production build |
| `npm start` | Serves the production build |
| `npm run lint` | ESLint |
| `npm run check:placeholders` | The placeholder check on its own |

## Where things live

```
app/          routes, API routes, and the metadata files: sitemap, robots,
              manifest, icons and the social card
components/   the interface, grouped by page (home, join, notfound, ...)
              and by role (chrome, ui, motion, forms)
content/      every fact and every line of copy on the site
lib/          schedule maths, form handling and delivery, metadata helpers,
              and the ASCII renderers behind the 404 page
public/       static files
scripts/      checks that run before a build
```

## Content

Every fact is typed once, in `content/`, and derived everywhere else. Change the
meeting room in `content/club.ts` and the footer, the join page, the FAQ and the
search engine data all change with it. No component restates a date, a name or
an amount.

| File | Holds |
| --- | --- |
| `content/club.ts` | Club details, the meeting, the season dates, prizes, teams, officers, the FAQ and the copy for each page |
| `content/forms.ts` | The built-in forms and the Get involved page |
| `content/sponsors.ts` | Sponsors and the sponsorship pitch |
| `content/projects.ts` | Shipped projects |

Dates that change what a visitor sees (the next meeting, which hackathon is
running) are worked out from those files by `lib/schedule.ts`. Pages regenerate
every six hours, so they stay current without a redeploy.

## Design

[CLAUDE.md](./CLAUDE.md) is the design contract: one accent colour, hairlines
instead of shadows, a fixed set of shapes, and motion that only ever reports
something true. The tokens it refers to are defined in `app/globals.css`. Read
it before changing any component, and point any AI coding assistant at it too.

## Placeholder check

The site was once turned down by a domain registry as an incomplete website, so
unfinished text is treated as a build failure. `npm run build` runs
`scripts/check-placeholders.mjs` first, and the build stops if it finds stub
markers, filler text, or stand-in names and addresses in `app/`, `components/`,
`content/`, `lib/`, `public/`, this README or SETUP.md. The script prints each
match with its file, line and column. The full list of patterns, and the few
exact uses it allows, are documented at the top of the script.

## Deploying

The site is hosted on Vercel. With the GitHub integration connected, a push to
the production branch deploys the live site and other branches get preview
URLs.

Set the environment variables described in SETUP.md in the Vercel project.
`NEXT_PUBLIC_SITE_URL` is the site's public address; canonical links, the
sitemap, `robots.txt`, the structured data and the social card URLs are all
built from it through `lib/site.ts`. Without it, they use
`https://ship-it-society.vercel.app`.

## Security

Response headers, set for every route in `next.config.ts`:

- A Content Security Policy that allows scripts only from this site and Vercel
  Analytics, blocks framing (`frame-ancestors 'none'`), plugins and cross-site
  form posts, and adds `'unsafe-eval'` in development only.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a
  `strict-origin-when-cross-origin` referrer policy, a Permissions-Policy that
  turns off the camera, microphone, location, payment and USB, a same-origin
  opener policy, and HSTS.

Form endpoints (`/api/apply` and `/api/forms/<form>`), in the order each request
is checked:

- `POST` only.
- Same origin only: a request the browser marks as cross-site, or whose `Origin`
  is another host, is refused.
- JSON or URL-encoded bodies only, up to 16 KB.
- A sliding-window rate limit of 20 submissions a minute per IP address. It is
  held in memory, so each server instance counts separately.
- Validation on the server with the same Zod schema the page uses.
- A hidden trap field; a submission that fills it gets a normal success
  response and is not delivered.

API keys and the spreadsheet secret are read only on the server, in modules
that import `server-only`, so they cannot reach the browser bundle. The site
renders no user-submitted content and embeds nothing from third parties.
