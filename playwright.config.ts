import { defineConfig, devices, type PlaywrightTestProject } from "@playwright/test";

/**
 * Phase 1 of docs/playwright-testing-spec.md — baseline viewport/engine
 * coverage. Every viewport in the spec's Phase 1 table is its own project
 * per engine (not a `use.viewport` set inside a shared project) because
 * `toHaveScreenshot()` names its baseline file from the project name, so
 * one project per device is what keeps `for-organisations-iphone-se-
 * chromium-darwin.png` legible instead of one project's snapshots
 * overwriting another's at a different size.
 *
 * threshold/maxDiffPixelRatio are deliberately generous (0.3 / 0.02) —
 * antialiasing differs between Chromium/Firefox/WebKit's own rasterizers
 * at the same nominal viewport, which reads as false positives at the
 * defaults (threshold 0.2, no maxDiffPixelRatio) on text-heavy sections.
 * Tighten these only after confirming three consecutive clean runs on
 * real (not first-run/baseline-generating) executions.
 */

const PHASE1_VIEWPORTS = [
  { name: "z-fold-cover", width: 344, height: 882 },
  { name: "budget-android", width: 360, height: 640 },
  { name: "iphone-se", width: 375, height: 667 },
  { name: "iphone-15-16", width: 393, height: 852 },
  { name: "iphone-pro-max", width: 430, height: 932 },
  { name: "z-fold-unfolded", width: 673, height: 841 },
  { name: "macbook-air-13", width: 1440, height: 900 },
  { name: "macbook-pro-16", width: 1728, height: 1117 },
  { name: "desktop-2560", width: 2560, height: 1440 },
];

const ENGINES = [
  { name: "chromium", device: devices["Desktop Chrome"] },
  { name: "firefox", device: devices["Desktop Firefox"] },
  { name: "webkit", device: devices["Desktop Safari"] },
];

function phase1Projects(): PlaywrightTestProject[] {
  const projects: PlaywrightTestProject[] = [];
  for (const engine of ENGINES) {
    for (const viewport of PHASE1_VIEWPORTS) {
      projects.push({
        name: `${viewport.name}-${engine.name}`,
        testMatch: /phase1\/.*\.spec\.ts/,
        use: {
          ...engine.device,
          viewport: { width: viewport.width, height: viewport.height },
          // Pinned, not inherited — `devices["Desktop Safari"]` ships with
          // deviceScaleFactor: 2 (Chrome/Firefox descriptors are 1), so
          // every WebKit baseline was silently captured at 2× (5120×2880 at
          // the 2560 viewport) until this was set: inconsistent with the
          // other two engines, ~4× the storage, and not the fixed-DPR
          // capture the suite is meant to use. Fractional/high DPR is
          // Phase 3's own subject (docs/playwright-testing-spec.md), not a
          // variable Phase 1 baselines should carry.
          deviceScaleFactor: 1,
        },
      });
    }
  }
  return projects;
}

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  // 900s per test — set so a timeout means something is actually wrong, not
  // that SwiftShader had a slow minute. The slowest test measured so far
  // (desktop-2560-chromium /band) took 5.8 min, which against the previous
  // 360s ceiling was a coin flip rather than a pass; 900s is ~2.6x that, so
  // ordinary CPU contention can't reach it but a genuine hang still fails in
  // bounded time. History: 90s → 240s → 360s were each still short for
  // Chromium at desktop widths. One test is one ROUTE, which now captures every
  // [data-visual-section] on it serially, including a deliberate ~21.5s
  // WebGL convergence wait per canvas-containing section (see
  // captureSection in tests/phase1/visualHelpers.ts). /band alone is 7
  // sections, 2 with canvases. Sized from measured runs, not guessed: 19 of
  // 20 timeouts at the previous 90s were Chromium, and only on the three
  // routes that contain a canvas (/inside-the-app, which has none, never
  // timed out). Cause confirmed via WEBGL_debug_renderer_info: headless
  // Chromium here renders WebGL on SwiftShader (CPU), while Firefox and
  // WebKit use the real Apple GPU — so with several workers, SwiftShader
  // canvases contend for the same CPU cores as each other and as the single
  // `next dev` process. Passing GPU-engine runs of /band took 47–59s;
  // CPU-bound Chromium runs of the same route were already 72–84s with one
  // worker and no contention at all.
  timeout: 900_000,
  expect: {
    timeout: 30_000,
    toHaveScreenshot: {
      threshold: 0.3,
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    },
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    // --- Phase 1 baseline viewports, one project per (device x engine) ---
    ...phase1Projects(),
  ],
});
