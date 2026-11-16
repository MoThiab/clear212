# GTA VI Launch Hub

A small fan-made hub built to catch the GTA VI launch week (19 November 2026) and
turn it into affiliate revenue and a repeat audience.

Nothing here is affiliated with Rockstar Games or Take-Two Interactive. No
Rockstar logos or artwork are used.

---

## Files

| File | Job | Needs from you |
|---|---|---|
| `index.html` | Countdown page. The pre-launch traffic magnet. Local-time countdown, day-one checklist (saved), launch facts. | Nothing. Ship it. |
| `answers.html` | The answers page. 19 searched Q&As with sources and a product-link slot each. | Affiliate URLs (optional — links stay hidden until you add them). |
| `tracker.html` | Progress tracker. Story / side jobs / collectibles / vehicles, per-section and overall bars, saved in the browser. | Nothing. |
| `caption-kit.md` | The X caption prompt, a worked example, X eligibility rules, affiliate math. | Nothing. |
| `briefing/` | The daily morning briefing: prompt, output template, and the cron job that runs it. | Nothing to build; it runs daily. |
| `design-system/MASTER.md` | The visual system the three pages share. | Nothing. |

## How to update

**Add an answer to `answers.html`:** open the file, find the `QA` array, paste a
new object at the end:

```js
{ q:'Your question?',
  a:'Your answer.',
  src:'Where you checked it',
  product:'ssd' },          // optional: ssd | controller | headset | capture | stand
```

Then fill the matching URL in `PRODUCTS` near the top of the script. Leave `url`
empty and no button renders — the page stays clean.

**Add a new product:** add a key to `PRODUCTS` with a `label` and a `url`.

**Change the countdown date:** edit one line, `var TARGET = new Date(2026, 10, 19, 0, 0, 0);`
(month is 0-indexed, so `10` is November).

**Rebuild:** there is no build step. The files are the site.

## Design system (short version)

- Background `#0b0a14`, cards `#161430` / `#1d1a42`, border `#2c2854`
- Neon pink `#ff2e7e` (primary), cyan `#22d3ee` (info), violet `#7c3aed` (depth), green `#34d399` (done)
- Russo One for display, Chakra Petch for body, system fallback stack
- Touch targets ≥ 44px, visible focus rings, `prefers-reduced-motion` respected
- No external JS, no images, no frameworks. Two font requests, everything else inline.

The generator suggested "3D & Hyperrealism with WebGL" for a gaming page. That was
deliberately dropped: the audience is on phones, often on mobile data, during a
launch-night scramble. A WebGL scene costs battery, data and time-to-interactive,
and buys nothing the content does not already deliver. Full reasoning in
`design-system/MASTER.md`.

---

## The money, honestly

The original five-part plan is a **traffic plan**, and most of the income claims
in it are weaker than they look.

| Claim | Reality |
|---|---|
| Affiliate links on the answers page | The only real, near-term revenue. Storage is the product to push: 212 GB is a forced purchase in launch week, and a $180 SSD at ~4% is $7.20. A $70 controller at 3% is $2.10. Cookie is 1 day. |
| X pays creators for views | True only above 500 verified followers **and** 500k verified-user impressions in 90 days, on a Premium subscription. See `caption-kit.md` §4. Treat X as a funnel, not a business. |
| Sponsors pay for an audience | Only after the audience exists. Nothing to do in week one except not burn trust. |
| Bookmarked tracker passes links on | Plausible, and it costs nothing. The tracker is the best "earn its keep" asset here because it is genuinely useful and returns every session. |

**Where the actual money is:** search traffic after launch week. "GTA VI storage",
"GTA VI preload", "GTA VI what time", "GTA VI crossplay" are queries with volume
and no single dominant evergreen page. The answers page is built for that: real
answers, sources, checked date, fast on mobile, and a link on the answer that
matches the purchase.

## What to do next, in order

1. Host the three HTML files. Any static host works (Netlify, Cloudflare Pages,
   GitHub Pages, itch.io-style static). They are plain files — no server.
2. Apply to Amazon Associates (or your local equivalent). Approval takes time and
   requires a working site, so do it before launch week.
3. Paste the affiliate URLs into `answers.html` → `PRODUCTS`.
4. Turn on the daily briefing cron in `briefing/`.
5. Post the countdown page to wherever your audience already is.
6. After launch, read the search data and add answers for the questions that
   actually show up. The page gets better every time you add one.

## Risks and limits

- **Trademark:** the pages use the text "GTA VI" and "Leonida" nominatively and
  carry a clear non-affiliation line. Do not use Rockstar artwork, logos, or
  trailer footage. Fan sites are common; impersonating Rockstar is not.
- **Accuracy:** every answer is dated and sourced. Update the `CHECKED` constant
  when you re-check, because a wrong "what time does it unlock" answer in launch
  week costs more trust than it earns.
- **Platform rules:** X and Amazon both have rules about affiliate links and
  disclosure. The disclosure is already in the footer of `answers.html`; keep it.
- **Scale:** this is a niche play measured in hundreds of dollars in week one.
  It compounds through search, not through virality.
