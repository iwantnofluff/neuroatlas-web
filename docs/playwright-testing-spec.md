# Cross-browser and responsive testing spec

Reference this file with `@docs/playwright-testing-spec.md` rather than pasting it.
Run one phase at a time. Do not start a phase until the previous one is reported and confirmed.

## Standing rules for all phases

- Check the installed versions in the lockfile and read the docs for those exact versions before using any API. Do not write config from memory.
- Report findings before changing anything. Several phases ask you to find problems, not fix them.
- Screenshot verification in this sandbox is unreliable — see the SwiftShader note in CLAUDE.md. Describe what you observe in words as well as capturing images.
- After each phase, summarise what changed and stop.

---

## Phase 1 — Install and baseline viewports

Install Playwright with all three engines: Chromium, Firefox and WebKit.

WebKit matters most here. We use `foreignObject` conic gradients, sticky positioning in scroll-linked sections, `backdrop-filter`, and WebGL under Lenis — all of which have Safari-specific history. Chrome DevTools device emulation runs Blink with a spoofed user agent and cannot catch any of it.

### Viewports

| Viewport | Device |
|---|---|
| 344x882 | Galaxy Z Fold, cover screen |
| 360x640 | Budget Android |
| 375x667 | iPhone SE |
| 393x852 | iPhone 15/16 |
| 430x932 | iPhone Pro Max |
| 673x841 | Galaxy Z Fold, unfolded |
| 1440x900 | MacBook Air 13" |
| 1728x1117 | MacBook Pro 16" |
| 2560x1440 | Desktop |

### Screenshot tests

Cover each route: `/`, `/band`, `/for-organisations`, and the app section.

Set a pixel tolerance high enough that antialiasing differences between engines do not cause false failures. Tune it until a clean run passes three times consecutively.

For WebGL sections, screenshot comparison will be flaky. Either mask the canvas region and assert on the layout around it, or disable animation and capture at a fixed scroll position. Say which approach you took and why.

### Explicit assertions, not just screenshots

- **No horizontal overflow** at any viewport. Assert that `document.scrollWidth` does not exceed the viewport width.
- **`100vh` audit.** Find every element using `100vh` and report them. Mobile browsers collapse the URL bar on scroll, so `100vh` exceeds the visible viewport and cuts off content. `100dvh` or `100svh` is the fix. Report before changing.
- **`prefers-reduced-motion`** renders the static fallbacks correctly.
- **Mobile no-canvas fallback** triggers at the right breakpoint.

### Flag specifically

**673x841, the unfolded Z Fold.** Our orthographic camera fits `CAMERA_TARGET_HEIGHT` to canvas pixel height, and the sticky sections assume a viewport taller than it is wide. Near-square may not error but may look wrong. Show me.

---

## Phase 2 — Tablets

Add both orientations. Run these on **WebKit**, not just Chromium — iPad is WebKit, and it is where our `foreignObject` gradients and sticky sections are most at risk.

| Portrait | Landscape | Device |
|---|---|---|
| 768x1024 | 1024x768 | iPad Mini |
| 820x1180 | 1180x820 | iPad Air 11" |
| 834x1194 | 1194x834 | iPad Pro 11" |
| 1024x1366 | 1366x1024 | iPad Pro 13" |
| 800x1280 | 1280x800 | Galaxy Tab S |
| 912x1368 | 1368x912 | Surface Pro |

### Check and report before changing anything

**1. How does the mobile fallback decide to skip the canvas?**
If it checks the user agent, it is broken on iPad: iPadOS Safari sends a macOS desktop UA by default, so iPads are currently getting the full WebGL path. Find the check and report what it uses. If it is UA-based we need width or feature detection instead.

**2. Landscape tablets have no hover and no mouse.**
1194x834, 1366x1024 and 1368x912 all hit our desktop breakpoints. Set `hasTouch` and `isMobile` on those projects. Verify every hover-only affordance has a touch equivalent, and that scroll-linked sticky sections behave under touch momentum rather than trackpad input. Check Lenis is actually engaged on touch and not fighting native iOS momentum scrolling.

**3. Portrait tablets at 768–834px are the tightest case for the centred-spine timeline** on `/for-organisations`. Band in the middle with copy alternating either side needs horizontal room we may not have at 768. Screenshot it and say whether it holds or needs to collapse to the stacked mobile layout. Do not change the breakpoint — show me first.

Also check `100dvh`/`100svh` on tablets: iPad Safari has the same collapsing toolbar behaviour as iPhone.

---

## Phase 3 — Windows laptops

The key variable is display scaling. Windows ships most laptops at 125% or 150%, so the CSS viewport is much smaller than the panel resolution and `devicePixelRatio` is fractional.

| Viewport | DPR | Device |
|---|---|---|
| 1366x768 | 1 | Budget Dell / Lenovo / HP 15" |
| 1536x864 | 1.25 | Mainstream FHD at 125% |
| 1280x720 | 1.5 | Mainstream FHD at 150% — our tightest desktop case |
| 1707x1067 | 1.5 | Dell XPS 15 / ThinkPad X1 |
| 1504x1003 | 1.5 | Surface Laptop |
| 1920x1080 | 2 | 4K at 200% |

Run on Chromium and Firefox. Firefox on Windows renders type differently from Chrome and we have a distinctive display face.

### Check and report

**1. 1280x720 is the real stress case.** Roughly 620px of usable height after browser chrome, against the ~1117 we developed at. Check every sticky scroll-linked section still pins and releases correctly, particularly `/for-organisations` where the sticky range derives from content height. Screenshot at 25/50/75% of each section's scroll range.

**2. Windows scrollbars occupy real layout width** — around 15px — and are always visible rather than overlaying like macOS. Verify no horizontal overflow once that width is subtracted. Any layout using `100vw` is suspect, since `100vw` excludes the scrollbar and will overflow. Find and report those before changing them.

**3. Fractional DPR (1.25, 1.5) causes subpixel rounding.** Look for hairline gaps between adjacent elements, blurry 1px borders, and misalignment where card strokes meet. The gradient card borders are the most likely place for this to surface.

**4. Our WebGL scenes render at `devicePixelRatio`.** At DPR 1.5 on integrated Intel graphics — which is most of these machines — that is a real performance question. Check whether we cap DPR anywhere and report the cap. If there is none, say so; these laptops are a large share of traffic and have no discrete GPU.

---

## Phase 4 — CI and triage

Wire the suite into CI so regressions fail the build rather than being found by hand.

- Decide which viewport/engine combinations run on every commit and which run nightly. The full matrix is large; running all of it per-commit will be slow enough that people start skipping it.
- Make failure output useful: diff images as artifacts, named so the failing viewport and engine are obvious.
- Document how to update baselines deliberately when a design change is intended, so nobody blanket-accepts a diff that contains a real regression.

---

## Not covered by this suite

Automation catches regressions; it does not replace looking at real hardware. Worth doing separately:

- **Safari on your own Mac**, plus Safari Technology Preview. Free, and it is the engine most likely to break this stack.
- **Xcode iOS Simulator** for real mobile WebKit, which differs from desktop Safari.
- **One real low-end Android phone**, connected over USB with `chrome://inspect`. The only reliable way to know whether the WebGL sections are usable on a weak GPU.
- **A cloud device farm** (BrowserStack, LambdaTest) during launch, for Fold devices and older iPhones you do not own.
