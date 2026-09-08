# Ship It Society

The website for Ship It Society — a student hackathon club at Fremont High
School. Two-week hackathons, idea to deployed, every project security tested
before it goes public.

**To change content, edit `content/club.ts`. To set the site up, read
[SETUP.md](./SETUP.md). Before changing the design, read [CLAUDE.md](./CLAUDE.md).**

---

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router) · React 19 · TypeScript strict |
| Styling | Tailwind CSS v4 — CSS-first `@theme`, no `tailwind.config.js` |
| Motion | Motion 13 + Lenis (smooth scroll) |
| Type | Switzer via Fontshare · Geist Mono self-hosted |
| Forms | react-hook-form + Zod, one schema shared by client and server |
| Hosting | Vercel |

## Layout

```
app/                 routes; every page static except /api/apply
components/
  brand/             wordmark and monogram
  chrome/            nav, footer, smooth scroll, page stage, JSON-LD
  home/              the hero sequence and the homepage sections
  motion/            the four reveal primitives — nothing else animates on entry
  ui/                buttons, page header, texture, odometer, view-transition wrapper
content/             ALL copy, dates, people, projects, sponsors
lib/
  sequence.ts        the hero canvas: a pure function of scroll progress
  apply.ts           application schema, shared client and server
  deliver.ts         email + spreadsheet delivery (server only)
  hooks.ts           reduced-motion and clock, via useSyncExternalStore
  motion.ts          shared easings, durations, variants
```

## The hero sequence

The homepage opens on a 400vh section containing a sticky canvas. Scroll
progress across that section drives a generative sequence: an empty grid fills
with code, the code resolves into an interface, a security scan sweeps through
it, and the result deploys.

Three things about it are worth knowing before you touch it:

- **`drawFrame` is a pure function of progress.** Same `p`, same pixels, always.
  That is what makes scrubbing backwards frame-exact instead of an approximate
  reverse.
- **It never uses React state.** Progress drives the canvas imperatively through
  a MotionValue subscription, so nothing re-renders while you scroll. Measured
  at 60fps with the CPU throttled 4×.
- **There are two layouts.** Wide viewports get a desktop app with a sidebar;
  phones get a genuinely different portrait interface with a tab bar. A phone is
  not a small desktop.

Reduced-motion visitors get a single static frame and a one-viewport section,
with the height set in CSS so there is no post-hydration reflow.

## Measured

Production build, served locally:

| | |
| --- | --- |
| CLS | **0** — the fallback font metrics are measured from Switzer, not guessed |
| Hero scrub | **60fps median, 0 frames over 50ms** at 4× CPU throttle |
| Static JS + CSS | 372 KB gzipped, all routes combined |
| Routes | 14, all statically prerendered except the form endpoint |
| Lint | clean |
| Contrast | no WCAG AA failures on any page or viewport |

## Accessibility

- Every page keyboard-navigable with a visible focus ring on every control.
- `prefers-reduced-motion` honoured throughout; all content stays reachable.
- Semantic landmarks, `<dl>` for spec pairs, skip link, real form labels.
- Marigold (`#ff9f0a`) is 10.2:1 on black but only 2.05:1 on white, so it is a
  fill on light surfaces and never text. Accent text on light uses
  `--color-marigold-ink`. This is enforced by convention — see `CLAUDE.md`.

## Commands

```bash
npm run dev      # local dev
npm run build    # production build
npm start        # serve the production build
npm run lint     # lint
```
