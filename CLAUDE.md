@AGENTS.md

# Ship It Society — design contract

The website of a student hackathon club at Fremont High School. Members build
and ship real apps in one-month cycles; every project passes an ArgosX
security review before it goes live.

**Register: minimal cyberpunk.** A void-black canvas, a technical HUD layer in
monospace, hairlines and corner brackets, one saturated accent, and motion
that behaves like instrumentation. Restrained, precise, professional. It must
never read as generated, and it must never read as a costume.

The site was rejected once from the is-a.dev registry as "incomplete". Anything
a reviewer could read as unfinished is a ship blocker.

---

## 1. Non-negotiables

Breaking one is a bug, not a style preference.

1. **One accent.** Marigold (`--color-marigold`). No purple/blue/neon gradients,
   no rainbow glows. `--color-ok` (green) and `--color-alert` (red) are STATUS
   colours only — a live dot, a form error — never decoration.
2. **Hairlines and value steps, not shadows.** Depth is `#000` canvas → one
   panel step (`--color-surface-900/800`) → 1px lines. No drop shadows on
   anything. No blur except the stuck nav bar.
3. **Shapes are a system.** Chamfer (`chamfer`, `chamfer-line`, `--cut`) for
   actions and HUD panels · `0` radius for editorial blocks and plates ·
   `--radius-hud` (2px) for small controls · pills only for tags. Never
   `rounded-xl/2xl/3xl` by reflex.
4. **Every HUD element is true.** A tick meter shows a real quantity. A status
   light reports a real state. A readout prints a real value (a date, a count,
   a room). No fake telemetry, no lorem coordinates, no "SYS.CORE.0x3F" noise.
   If there is nothing true to show, leave the element out.
5. **Asymmetric, composed layout.** 12-column grid (`grid12`); content sits on
   cols 1–7 or 6–12, not always centred. Vary section rhythm: full-bleed / split
   / sticky-pair / inset. Never two consecutive card grids.
6. **No emoji. No icon libraries.** Hand-authored inline SVG only.
7. **Motion budget.** Purposeful, instrument-like, and never on body copy.
   Fade-in-on-everything is the generated-site tell. See §4.
8. **Content before layout.** Every fact lives in `content/*.ts` and is derived,
   never retyped in a component. See §7.
9. **One deliberate grid break per page** — an element bleeding past the grid.

## 2. Voice

Short declaratives. No exclamation marks. No "unleash", "empower", "journey",
"dive in", "game-changer", "cutting-edge", "next-level". State the fact and stop.
The HUD layer is terse mono labels, not jargon cosplay: write `NEXT MEETING`,
not `INCOMING_TRANSMISSION`.

---

## 3. Tokens (`app/globals.css`)

`@theme` is the contract. **Never hardcode a hex, radius, duration, easing or
font-size in a component.** Missing value? Add a token.

### Colour — all measured against `#000`

| Token | Use | Contrast |
|---|---|---|
| `--color-fg` / `--stage-fg` | primary text | 18.8:1 |
| `--color-muted` / `--stage-muted` | secondary text | 8.2:1 |
| `--color-muted-dim` / `--stage-subtle` | small mono labels, captions | 6.2:1 (5.2:1 on panel-hi) |
| `--color-marigold` | accent text, rules, fills | 10.2:1 |
| `--color-alert` | errors only | 6.8:1 |
| `--color-ok` | live/status dots only | 11.0:1 |
| `--stage-line` / `--stage-line-strong` | hairlines | — |
| `--color-surface-900/800/700` | the one panel step | — |

**Marigold-ink (`#8a4b00`) is 3.1:1 on black — never use it on the canvas.**
It exists only for text on light plate grounds (stone, paper). On a marigold
FILL, text is ink.

The `--stage-*` variable names are legacy from a light/dark scroll shift that
was removed (it caused three contrast bugs). They are now constant dark values.

### Type

- **Switzer** (Fontshare API) for display and body; weights 300–600. Display
  sizes (`text-4xl`, `text-5xl`) use **300–400** with tight leading — the large
  and light treatment. Section heads `text-2xl/3xl` at 400–500.
- **Geist Mono** is the HUD layer: `mono-label` (11px, uppercase, tracked,
  tabular). Numbers that update use `tnum`.
- Body copy is `text-base` (17px, line-height 1.62) at `--stage-muted` or `fg`.

### Utilities

`edge` · `grid12` · `mono-label` · `tnum` · `rule-t/b` · `optical` · `balance/pretty`
· `chamfer` · `chamfer-line` (set `--line`, `--fill`) · `hud-dots` · `hud-columns`
· `scanlines` · `text-outline` (set `--outline`) · `hazard`

---

## 4. Motion

### The visible-by-default contract (hard rule)

Content is visible in the server HTML. Animation is layered on top and is only
ever allowed to hide something under `html.anim`, which the boot script in
`app/layout.tsx` sets only when the tab is visible, IntersectionObserver
exists and reduced motion is off, with a 3s dead-man's switch.

- Entry reveals: put `data-reveal` (or `data-reveal-lines`) on an element;
  `RevealRoot` adds `.is-in`. Never gate visibility on your own observer.
- **Never ship `opacity:0` or an off-screen transform in SSR markup** except
  via the `html.anim [data-reveal]:not(.is-in)` CSS.
- Scroll-linked effects paint imperatively from a MotionValue subscription
  (`scrollYProgress.on("change", …)` or `useMotionValueEvent`). Never
  `useState` in a scroll or pointer handler.
- Continuous loops run only while on screen and the tab is visible:
  `useRunWhenVisible()` → `running`.
- `prefers-reduced-motion`: every effect rests in its FINISHED state. CSS is
  covered globally; hand-written loops must check `usePrefersReducedMotion()`.
  `MotionConfig reducedMotion="user"` wraps the app.
- Pointer effects only for `pointerType === "mouse"` (fine pointer).
- **No more than two flashes per trigger** (WCAG 2.3.1). Continuous blinks
  stay under 1Hz.
- CLS stays 0. Never animate layout properties; transform/opacity only.
- Hero LCP text must not wait on JavaScript.

### Hydration safety

- No `Math.random()`, `Date.now()` or locale formatting in render.
- **Trig in render must be rounded** — `polar()` / `r3()` from `lib/geometry.ts`.
  Node and the browser disagree in the last digit of `Math.cos`, and React
  compares SVG attributes as strings.

### FUI vocabulary (CSS, in globals.css)

`fui-blink` (status) · `fui-slide-blink` (index numbers, reveal-driven) ·
`fui-build` (rules/bars, reveal-driven) · `fui-flash` (one confirmation flash) ·
`fui-glitch-hover` + `fui-glitch-target` (wordmark only) · `fui-crash` (errors).

Also available: `Scramble` (text decode), `Marquee` (velocity ticker),
`Dial`, `IndexRail`, `Barcode`, `RegMark`, `Annotation` in
`components/ui/Poster.tsx`; plates in `components/ui/Plates.tsx`.

---

## 5. Primitives — use these, do not re-invent them

| Import | What |
|---|---|
| `Button` (`components/ui/Button`) | `variant: primary \| ghost \| quiet`, `size: sm \| md \| lg`, `arrow`. Chamfered, rolling label, new-tab disclosure built in. **Every CTA uses it.** |
| `Roll` | the rolling-label effect on its own |
| `Eyebrow` | `01 // LABEL` section index; the number slide-blinks on reveal |
| `HudFrame` | corner brackets around a region (`tone`, `size`, `inset`) |
| `StatusDot` | status light; always paired with a text label |
| `Tag` | mono pill (`line \| accent \| solid`) |
| `Readout` | mono caption + value |
| `TickBar` | `total` ticks, `filled` lit — a real quantity |
| `Magnetic` (`components/motion/Magnetic`) | subtle pointer pull for a primary CTA |
| `CopyEmail` (`components/ui/CopyEmail`) | mailto link + copy button with live-region confirmation |
| `PlateFrame` and plates | poster compositions on their own ground |
| `Reveal`, `RevealLines`, `Stagger`, `StaggerItem` | reveal system |
| `lib/site.ts` | `SITE_URL`, `absoluteUrl()` — the only place the origin lives |
| `lib/geometry.ts` | `r3`, `polar` |
| `lib/hooks.ts` | `usePrefersReducedMotion`, `useRunWhenVisible`, `useNow` |

---

## 6. Accessibility (WCAG 2.2 AA)

- Contrast from the §3 table only. Muted text never below `--stage-subtle`.
- Targets ≥ 24×24px; primary actions ≥ 44px tall.
- Visible `:focus-visible` (2px marigold, 10.2:1 on black). Never `outline-none`
  without a replacement.
- Colour never carries meaning alone (status dot + label; error icon + text).
- Decorative SVG/plates: `aria-hidden`. Informative graphics: `role="img"` + a
  real `aria-label`, or the same facts in adjacent text.
- Links opening a new tab say so (visually hidden text). `Button` does this.
- Semantic structure: one `h1` per page, ordered headings, landmarks,
  `<dl>` with `dt` before `dd`, native `<details>` for disclosure.
- Dialogs: always-mounted, `inert` + `aria-hidden` when closed, focus trapped,
  Escape closes, focus returns to the trigger, a close button INSIDE.

## 7. Content & security

- **Facts live in `content/*.ts`**: dates, meeting (`meeting`, `meetingLine`),
  season (`season`), people, sponsors, prizes, copy. Components derive; they
  never retype. Page mastheads: `teamPage`, `hackathonsPage`, `join.title`,
  `projectsPage.title`, `sponsorPage`.
- `npm run build` runs `scripts/check-placeholders.mjs` and fails on placeholder
  text. Never ship TODO/TBA/TBD/"coming soon"/example.com/lorem/sample content.
- No secrets in client code. Validate on the server. The apply API is
  same-origin only.
- The CSP forbids `eval` in production and external scripts except Vercel
  Analytics. No inline event-handler attributes, no third-party embeds.

## 8. Stack notes

- Next.js 16 App Router. `params` is a **Promise** — `await` it. Read the
  bundled docs in `node_modules/next/dist/docs/` before using an API.
- Tailwind v4: CSS-first `@theme`; there is no `tailwind.config.js`.
- Motion 13 (`motion/react`). Pin with CSS `position: sticky`, never a JS pin.
- Zod 4: `z.email()`, not `z.string().email()`.
- Root layout exports `revalidate = 21600` so date-driven server content stays
  current without a redeploy.

---

## 9. Reference map

The club's moodboard (third-party posters and UI shots) is **inspiration only**.
Nothing from it is copied, traced or embedded — every idea is rebuilt as
original code, SVG or canvas carrying the club's own real content.

| Reference idea | Reconstruction | Where |
|---|---|---|
| Void-black editorial spread, one elevation step, tight light display type, airy body, quiet nav row | Base system | everywhere |
| Viewfinder corner brackets, dotted edges | `HudFrame` | panels, plates, hero |
| Recording-frame overlay: date box, status, target/type boxes | Live HUD overlay on the build canvas (real phase, real day, real date) | home hero |
| Data-transfer panel: radial tick spinner, tick bar, big mono readouts, outlined actions | Countdown panel | home |
| Tick meters beside big numbers; needle dials | Stats; cycle progress | home, countdown |
| Firmware panel: bracketed title, dot-matrix, code readouts | System footer: build hash, local clock, dot-matrix season | footer |
| Isometric exploded device with dashed connectors | Security/ship pipeline diagram | handbook |
| Spec sheet: huge number, label/value table, line drawing | A hackathon's spec sheet | /hackathons, handbook |
| Radial node with fanned edges | Stack graph; sponsor graph | handbook, /sponsors |
| Pointer-warped dot grid (node canvas) | Interactive dot field | hero / join CTA / 404 |
| Tracking boxes with leader lines | Hover/focus tracking on officer cards | /team |
| Outline echo headline; rotating circular text ring; crosshair targets | Masthead echo; ring on the cycle disc | page headers, home |
| Split word with rules ("DI—MEN / SI—ONS"); stacked double number | Masthead variant; countdown digits echo | sub-pages |
| Chamfered info box with `>` terminal list, barcode, crosses | Fact lists | /join, handbook |
| Boarding pass / ticket | Application-received pass | /join |
| Underline-only inputs, hairline crosshair lines, burst mark | Apply form | /join |
| Pixel display type, spaced mono subtitle, glyph row | 404 "signal lost" | not-found |
| ASCII-rendered planet | Procedurally generated ASCII planet | not-found |
| Rim-lit mark on black | Glowing monogram | not-found |
| Wireframe hand meeting a real hand (human × machine) | Two cursors — one wireframe, one solid — meeting at a spark | home premise |
| Moon on black; moon-phase strip | Procedural moon phase = the day of the current 30-day cycle | /hackathons |
| Game-UI gauges and state rows | Week states with gauges | format |
| Layered offset photo frames, collage blocks, sparkle marks | Designed empty state; portrait tiles | /projects, /team |
| Glass object over big type | CSS 3D wireframe cube over outline type | home join CTA |
| Circular % rings, tag pills | Judging rubric | home prizes, handbook |
| Dark notion-style table rows with mono tags | Season calendar rows | /hackathons |
| Heat-map scan grid with target box | Scan grid that clears findings | home security |
| The five original posters | Cycle / Review / Season / Archive / Signal plates | existing |
| FUI field guide (blink, glitch, shuffle, build-on…) | FUI CSS vocabulary | everywhere |
