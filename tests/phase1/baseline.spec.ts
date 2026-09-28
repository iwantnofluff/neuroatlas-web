import { test, expect } from "@playwright/test";
import {
  freezeVideos,
  revealAndSettle,
  captureSection,
  measureSectionFlatness,
  FLATNESS_THRESHOLD,
} from "./visualHelpers";

/**
 * Phase 1 of docs/playwright-testing-spec.md.
 *
 * Per-section capture, not full-page. Two real, confirmed bugs with the
 * original full-page approach, found in review rather than by me:
 *
 * 1. Reveal-on-scroll never fires during a full-page screenshot — the page
 *    rasterises without ever actually scrolling, so every section driven by
 *    Framer Motion's `whileInView` (IntersectionObserver-based) stayed at its
 *    initial opacity:0. Measured directly against the committed baselines:
 *    55.8% flat rows on /for-organisations, 73.0% on /inside-the-app, with
 *    contiguous blank runs over 1800px long. An empty section is perfectly
 *    reproducible, so it would have passed forever.
 * 2. Even with that fixed, `/` and `/band`'s fullPage captures were still
 *    non-deterministic: Lenis's eased scroll doesn't land on identical
 *    intermediate positions during Playwright's own page-stitching, so every
 *    scrollYProgress-driven section inherited that drift.
 *
 * Per-section capture solves both at once, as predicted before writing this:
 * each marked `[data-visual-section]` element is scrolled to its own settled
 * position (see revealAndSettle in visualHelpers.ts — sticky/pinned sections
 * scroll deep into their own track to reach their held state; plain sections
 * scroll into view) and screenshotted individually via `locator.screenshot()`
 * — a single settled-position capture, never a multi-viewport stitch, so
 * Lenis's mid-scroll state is never part of what's captured.
 *
 * The `[data-visual-section]` markers themselves are a real markup pass, not
 * a test-only hook: where a top-level page block was a bare `<div>` that's
 * semantically a section, it became a real `<section>` (see the git diff on
 * the 4 route files and Reveal.tsx's new `as="section"` option) rather than
 * getting the attribute bolted onto the wrong element.
 *
 * WebGL: diffed WHOLE and unmasked wherever it converges, not masked out by
 * default. This codebase's 3D scenes have no random input, so a scene that
 * looks non-deterministic is really just "which frame the shutter caught"
 * while a damped scroll-driven value is still approaching its target —
 * confirmed empirically (5 consecutive captures + 3 fresh browser launches,
 * on all three engines, all measuring 0% pixel diff after a 20s settle
 * wait), not assumed. Baselines are already per-engine (the project name,
 * which encodes engine+viewport, is part of every snapshot's own file name),
 * so no cross-engine tolerance is needed or attempted — SwiftShader vs each
 * engine's real rasterizer will legitimately never agree pixel-for-pixel,
 * and a tolerance loose enough to paper over that would be loose enough to
 * miss a real regression too.
 *
 * One real exception, found the same empirical way: TheSpecs.tsx's <Band>
 * spins continuously on mobile (`autoRotate={isMobile}`) and never
 * converges. captureSection() (visualHelpers.ts) detects this per-section
 * at test time — two captures 1.5s apart, diffed — rather than hardcoding
 * that one app-level breakpoint into the test; a section that doesn't
 * converge falls back to masking its own canvas and leans on the flatness
 * guard instead, same as the original Phase 1 approach, applied only where
 * it's actually needed.
 *
 * The flatness guard (assertNotMostlyFlat) runs on every capture regardless
 * of baseline comparison, so a blank section can never quietly become the
 * new accepted baseline the way the original bug did.
 */

const ROUTES = ["/", "/band", "/for-organisations", "/inside-the-app"] as const;

// VISUAL_DETECT_ONLY=1 settles every section and reports what's still moving
// (as `[motion]` log lines) without capturing or touching any baseline — the
// pass used to review what would be masked before anything is baselined.
const DETECT_ONLY = process.env.VISUAL_DETECT_ONLY === "1";

// Every per-section check is soft: one mismatching section no longer stops a
// route, so a run reports the true total, not just each route's first miss.
test.describe("Phase 1 — per-section baseline screenshots", () => {
  for (const route of ROUTES) {
    test(`${route} — sections reveal, no overflow, no blank captures`, async ({ page }, testInfo) => {
      await page.goto(route);
      await page.waitForLoadState("load");
      await freezeVideos(page);

      // No horizontal overflow at this viewport. +1px tolerance for
      // subpixel viewport/scrollbar rounding, not a hidden allowance for a
      // real overflow.
      const viewportWidth = testInfo.project.use.viewport?.width;
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect.soft(
        scrollWidth,
        `document.scrollWidth (${scrollWidth}) exceeds viewport width (${viewportWidth ?? clientWidth}) on ${route}`
      ).toBeLessThanOrEqual((viewportWidth ?? clientWidth) + 1);

      const sectionNames = await page.locator("[data-visual-section]").evaluateAll((els) =>
        els.map((el) => el.getAttribute("data-visual-section")!)
      );
      expect(sectionNames.length, `no [data-visual-section] markers found on ${route}`).toBeGreaterThan(0);

      const routeSlug = route === "/" ? "home" : route.slice(1).replace(/\//g, "-");

      const project = testInfo.project.name;
      for (const sectionName of sectionNames) {
        const label = `${routeSlug}/${sectionName}`;
        const locator = page.locator(`[data-visual-section="${sectionName}"]`);
        let stage = "settle";
        try {
          const moving = await revealAndSettle(locator, page);
          for (const m of moving) {
            console.log(`[motion] ${JSON.stringify({ project, route: routeSlug, ...m })}`);
          }
          if (DETECT_ONLY) continue;

          // Still-moving content is never masked implicitly: only elements
          // under an explicit data-visual-mask marker are, and anything else
          // still moving fails here, with its path and box, so it gets a
          // real fix rather than being hidden.
          for (const m of moving.filter((m) => m.kind === "perpetual-js" && !m.maskName)) {
            expect
              .soft(false, `${label}: still moving after all finite animations finished (${m.changed.join(", ")}) at ${m.path} box=${JSON.stringify(m.box)} text="${m.text}"`)
              .toBe(true);
          }

          stage = "capture";
          const { buffer, canvasMasked, convergenceDiff } = await captureSection(locator, page);
          if (canvasMasked) {
            console.log(`[canvas-masked] ${JSON.stringify({ project, route: routeSlug, section: sectionName, convergenceDiff })}`);
          }

          stage = "flatness";
          const flat = await measureSectionFlatness(buffer, locator);
          console.log(`[flat] ${JSON.stringify({ project, route: routeSlug, section: sectionName, ...flat })}`);
          expect
            .soft(flat.flatRatio, `${label}: ${(flat.flatRatio * 100).toFixed(1)}% flat rows within its ${flat.scoped} (longest uniform run ${flat.longestRun}px), over the ${(FLATNESS_THRESHOLD * 100).toFixed(1)}% guard — likely never revealed`)
            .toBeLessThanOrEqual(FLATNESS_THRESHOLD);

          expect.soft(buffer).toMatchSnapshot(`${routeSlug}--${sectionName}.png`);
        } catch (e) {
          expect.soft(false, `${label} [stage: ${stage}]: ${(e as Error).message.split("\n")[0]}`).toBe(true);
        }
      }
    });
  }
});
