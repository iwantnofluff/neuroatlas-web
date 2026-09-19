---
name: responsive-audit
description: Sweep every marketing route on this site from 320px to 2560px in 20px steps and report horizontal overflow. Use when the user asks to check, verify, or fix responsive/mobile layout issues across the whole site.
---

# Responsive audit

Detects real horizontal overflow (`document.documentElement.scrollWidth >
document.documentElement.clientWidth`) across every marketing route, at every
20px step from 320px to 2560px wide. `/studio` is intentionally excluded —
it's Sanity's own embedded admin UI, not this site's own design surface.

## Running it

1. Confirm `playwright` is installed (`node_modules/.bin/playwright` should
   exist — it's a devDependency of this project already). If missing, run
   `npm install -D playwright`.
2. Build and start a production server (matches real deployed behavior more
   closely than the dev server):
   ```
   npx next build
   npx next start &
   ```
   Wait for `http://localhost:3000/` to return 200 before continuing.
3. Run the audit:
   ```
   node scripts/responsive-audit.mjs
   ```
   Takes a few minutes — it's 16 routes × ~113 widths each. It resizes the
   viewport in place rather than reloading per width, so it's much faster
   than a naive navigate-per-width loop.
4. Read the console summary. For any route with failures, also read
   `.audit/report.json` (full per-width detail, including up to 5 offending
   elements per failing width, sorted by overflow amount) and the
   screenshots in `.audit/screenshots/` (one per contiguous failing range
   per route, not one per failing width — a bug spanning 40 consecutive
   widths only gets one screenshot, at its first failing width).
5. Stop the server (`pkill -f "next start"`) when done.

## If it finds problems

Fix root causes, not symptoms, in this order of preference:

- Replace fixed pixel widths on containers/images/text with `%`, `max-width`,
  `min()`, or `clamp()`.
- Add `min-width: 0` to flex/grid children that are overflowing (the classic
  cause: a flex child's default `min-width: auto` refuses to shrink below its
  content's intrinsic width) and add `flex-wrap` where a row doesn't wrap.
- Convert fixed per-breakpoint heading/text sizes to `clamp(min, preferred,
  max)` instead of jumping between fixed values at each breakpoint.
- Make images/media `max-width: 100%; height: auto`.
- Do **not** reach for `overflow-x: hidden` as a fix — it hides the bug
  without removing the oversized element, so the same content still clips or
  becomes unreachable; find and fix the actual oversized/unshrinkable element
  instead.

After fixing, re-run the script and repeat until every route is clean across
the full range.

## Sanity-checking the detector itself

Before trusting a "these routes are failing" or, more importantly, an "all
clean" result on a codebase you don't already know the audit script is solid
against, verify the detector fires on a known-bad case: serve a one-line HTML
file with a deliberately oversized fixed-width element (e.g. `<div
style="width: 900px">`) from a throwaway local static server, point a small
standalone Playwright script at it, and confirm `scrollWidth > clientWidth`
actually flips `true` below 900px and `false` above it. This project's own
audit script was verified this way before its first "all clean" result was
trusted.
