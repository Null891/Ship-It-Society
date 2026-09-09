@AGENTS.md

# Ship It Society — design contract

A student hackathon club site at Fremont High. Register: Apple product page.
Restrained, precise, confident. **It must never read as generated.**

## Non-negotiables

These exist because they are the documented tells of AI-generated frontends.
Breaking one is a bug, not a style preference.

1. **No purple/indigo gradients.** No `from-purple-500 to-blue-500`, ever.
   The only gradients allowed are single-hue alpha fades used as scrims.
2. **Radii are a system, not a value.** `0` editorial blocks · `12px` cards ·
   `980px` pill buttons. Never one radius everywhere. Never `rounded-3xl` by reflex.
3. **Hairlines, not shadows.** Depth comes from 1px borders. `box-shadow` is
   allowed only on genuinely floating UI (the nav when stuck). Never on cards.
4. **Asymmetric placement.** 12-col grid. Content sits on cols 1-7 or 6-12
   depending on section. Not everything centered.
5. **Varied section rhythm.** Alternate full-bleed / inset / split / sticky-pair.
   Never two consecutive card grids.
6. **No emoji. No stock icon set.** Hand-authored inline SVG only, used sparingly.
7. **Motion budget ~30%.** Hero scrub, section titles, nav, count-ups, hover.
   Body copy and resting cards are STATIC. Fade-in-on-everything is the tell.
8. **Content before layout.** Copy lives in `content/*.ts` and is written first.
   Never lorem into a card grid and call it a section.
9. **One deliberate grid break per page** — an element bleeding past the container.

## Voice

Short declaratives. No exclamation marks. No "unleash", "empower", "journey",
"dive in", "game-changer". State the fact and stop.

Good: "Two weeks. Idea to shipped."
Bad:  "Embark on an exciting journey to unleash your coding potential!"

## Tokens

`app/globals.css` `@theme` is the contract. **Never hardcode a hex, radius,
duration, or font-size in a component.** If a value is missing, add a token.

### The marigold rule (accessibility, enforced)

`--color-marigold` (#ff9f0a) is **10.2:1 on black** and **2.05:1 on white**.

- On dark surfaces: use freely for text, rules, indicators.
- On light surfaces: **fill only**, with near-black text on top.
- Accent text on light must use `--color-marigold-ink` (#8a4b00, 7.1:1).

A marigold text class on a light background is a contrast failure. Check it.

## Stack notes

- Next.js 16 App Router. `params` is a **Promise** — always `await` it.
- Tailwind v4: CSS-first `@theme`. There is no `tailwind.config.js`.
- Motion 13 (`motion/react`). Pin with CSS `position: sticky`, never a JS pin.
- Scroll-linked work drives CSS vars / canvas **imperatively** via
  `useMotionValueEvent`. Never `useState` in a scroll handler.
- Zod 4: `z.email()`, not `z.string().email()`.
- Every scroll animation needs a `prefers-reduced-motion` path that still
  shows all content.
