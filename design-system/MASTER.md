# MASTER — GTA VI Launch Hub design system

Generated 16 Nov 2026 with the `ui-ux-pro-max` design-system search, then
manually corrected. This file is the single source of truth for the three pages.

## Pattern

Feature-Rich Showcase (as recommended): hero with the value proposition, a
feature grid, social proof, one strong repeated CTA.

Adapted for this hub: the "features" are the countdown, the checklist and the
launch facts; the CTA is always **Day one answers**. The internal loop is

```
index.html (countdown) ──▶ answers.html ◀── tracker.html
```

Every page carries both links. Nothing is a dead end.

## Style

The generator returned **3D & Hyperrealism** (WebGL, parallax layers, realistic
textures). **Overridden.** Rationale:

- The audience is on phones, frequently on mobile data, during a launch-night
  scramble. WebGL costs battery, data and time-to-interactive.
- The brief for every page says "loads fast on a phone".
- The UX priority table in the skill itself ranks Performance above Style.

What was kept: the dark, saturated, neon-on-black direction (Vice City at night)
and the gaming typography. Delivered as flat CSS: layered radial gradients plus
a masked grid, no canvas, no images, no JS animation libraries.

## Colour tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b0a14` | page background |
| `--card` / `--card-2` | `#161430` / `#1d1a42` | cards, gradients |
| `--border` | `#2c2854` | hairlines |
| `--text` | `#ededf7` | body |
| `--muted` | `#a29ccb` | secondary text (7:1 on bg) |
| `--faint` | `#7d77a8` | meta text, only on large/low-importance text |
| `--pink` / `--pink-2` | `#ff2e7e` / `#ff5c9d` | primary CTA, accents |
| `--cyan` | `#22d3ee` | info, focus rings, eyebrows |
| `--violet` | `#7c3aed` | gradient depth |
| `--ok` | `#34d399` | completed states |

Contrast: body text and `--muted` on `--bg` both clear 4.5:1. `--pink` is used
for large display text, fills and buttons, never for small body copy.

## Typography

- Display: **Russo One** (single weight, 400) — headings, the countdown digits.
- Body: **Chakra Petch** 400/500/600/700 — everything else.
- Fallback stack: `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial`.
- Loaded from Google Fonts with `preconnect` + `display=swap`. If the font fails,
  the system stack is the design, not a broken page.
- Base size 16px, line-height 1.55, tabular numerals on all counters and
  percentages.

## Layout

- Single column, `--maxw: 780px`, 18px gutters (760px on the legal pages).
- Mobile-first. Breakpoint at 420px collapses the stats grid and tightens the
  countdown.
- Sticky bars (`search`, `overall` progress) use `top:10px` and `z-index` 5–6 so
  they never sit under a sticky browser chrome.
- No horizontal scroll at 375px.

## Shared assets

- `assets/legal.css` — the five legal pages (privacy, terms, refunds, disclosure,
  contact) share this instead of repeating the token block. Same variables, same
  font stack, wider measure for long text.
- `assets/favicon.svg` — the 212 mark, linked from every page.
- The three product pages (index, answers, tracker) stay fully self-contained: no
  shared JS, no shared CSS, only the two font requests from Google. That keeps
  each one a single file you can drop on any host.

## Components

- **Buttons:** min-height 54px, radius 14px, two styles — `btn-primary` (pink
  fill, near-black text) and `btn-ghost` (violet tint, violet border).
- **Cards:** 1px `--border`, radius 18px, vertical gradient `card-2 → card`,
  deep shadow.
- **Checkboxes:** real `<input type=checkbox>` visually hidden, custom `.box`
  sibling; `input:checked + .box` paints it. Never a `div` with a click handler.
- **Progress bars:** 12px track, rounded, gradient fill with a glow; width
  animated over 350ms with `cubic-bezier(.2,.8,.2,1)`.
- **Icons:** inline SVG only, `aria-hidden="true"`, stroke-based. No emoji as
  icons.
- **Search:** sticky field, `type=search`, clear button, live result count.

## Accessibility checklist (all three pages)

- [x] Body text contrast ≥ 4.5:1
- [x] Every interactive element ≥ 44px tall
- [x] `:focus-visible` rings on buttons, inputs, checkboxes (cyan, 3px, offset)
- [x] Decorative SVGs `aria-hidden`; icon-only buttons carry `aria-label`
- [x] Countdown is `role="timer"` with `aria-live="off"` (no screen-reader spam)
- [x] `prefers-reduced-motion` kills transitions
- [x] `viewport-fit=cover` and `theme-color` for mobile chrome
- [x] `cursor:pointer` on every clickable element
- [x] Hover and active states on all controls, 150–300ms

## Avoid

- Emoji as icons (use SVG)
- Layout-thrashing animation (no animating width/height of large containers)
- Fixed px container widths and disabled zoom
- Hover-only affordances
- Rockstar Games logos, artwork or trailer footage (trademark + the brief)
