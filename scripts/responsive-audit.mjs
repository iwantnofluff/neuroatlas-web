import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE_URL = process.env.AUDIT_BASE_URL || "http://localhost:3000";
const MIN_WIDTH = 320;
const MAX_WIDTH = 2560;
const STEP = 20;
const HEIGHT = 900;
const OUT_DIR = path.resolve(process.cwd(), ".audit");
const SCREENSHOT_DIR = path.join(OUT_DIR, "screenshots");

// /studio is Sanity's own embedded admin UI, not a page of this site's own
// design — its responsive behavior isn't ours to audit or fix.
const ROUTES = [
  "/",
  "/about",
  "/band",
  "/contact",
  "/faq",
  "/for-organisations",
  "/how-it-works",
  "/inside-the-app",
  "/journal",
  "/journal/test",
  "/legal/privacy-policy",
  "/legal/terms-of-use",
  "/pricing",
  "/privacy",
  "/request-access",
  "/the-science",
];

function widths() {
  const out = [];
  for (let w = MIN_WIDTH; w <= MAX_WIDTH; w += STEP) out.push(w);
  return out;
}

async function findOffenders(page) {
  return page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    const offenders = [];
    for (const el of document.querySelectorAll("body *")) {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;
      const overflowAmount = rect.right - clientWidth;
      if (overflowAmount > 1) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          className: typeof el.className === "string" ? el.className.slice(0, 140) : null,
          overflowAmount: Math.round(overflowAmount),
          rectWidth: Math.round(rect.width),
        });
      }
    }
    offenders.sort((a, b) => b.overflowAmount - a.overflowAmount);
    return offenders.slice(0, 5);
  });
}

async function auditRoute(browser, route) {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  await page.setViewportSize({ width: MAX_WIDTH, height: HEIGHT });
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });

  const failures = [];
  let lastFailed = false;

  for (const width of widths()) {
    await page.setViewportSize({ width, height: HEIGHT });
    await page.waitForTimeout(40);

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    const overflow = scrollWidth - clientWidth;
    const failed = overflow > 1;

    if (failed) {
      const offenders = await findOffenders(page);
      const record = { width, overflow, offenders };

      // Only screenshot the first width of each contiguous failing run,
      // not every single failing width, to avoid hundreds of
      // near-duplicate screenshots when a bug spans a wide range.
      if (!lastFailed) {
        const shotName = `${route === "/" ? "home" : route.replace(/\//g, "_")}_${width}.png`;
        const shotPath = path.join(SCREENSHOT_DIR, shotName);
        await page.screenshot({ path: shotPath, fullPage: false });
        record.screenshot = path.relative(OUT_DIR, shotPath);
      }

      failures.push(record);
    }

    lastFailed = failed;
  }

  await page.close();
  return { route, failures, consoleErrors };
}

function summarizeRanges(failureWidths) {
  const ranges = [];
  let start = failureWidths[0];
  let prev = failureWidths[0];
  for (let i = 1; i <= failureWidths.length; i++) {
    const w = failureWidths[i];
    if (w !== prev + STEP) {
      ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
      start = w;
    }
    prev = w;
  }
  return ranges;
}

async function main() {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const results = [];

  for (const route of ROUTES) {
    process.stdout.write(`Auditing ${route} ... `);
    const result = await auditRoute(browser, route);
    console.log(result.failures.length ? `${result.failures.length} failing widths` : "clean");
    results.push(result);
  }

  await browser.close();

  const reportPath = path.join(OUT_DIR, "report.json");
  writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log("\n=== SUMMARY ===");
  let anyFailed = false;
  for (const r of results) {
    if (r.consoleErrors.length > 0) {
      console.log(`${r.route}: ${r.consoleErrors.length} console error(s)`);
    }
    if (r.failures.length === 0) continue;
    anyFailed = true;
    const ranges = summarizeRanges(r.failures.map((f) => f.width));
    console.log(`${r.route}: overflow at ${ranges.join(", ")}`);
    const worst = r.failures.reduce((a, b) => (b.overflow > a.overflow ? b : a));
    if (worst.offenders[0]) {
      const o = worst.offenders[0];
      console.log(
        `  worst @ ${worst.width}px: <${o.tag}> class="${o.className}" overflow=${o.overflowAmount}px`
      );
    }
  }
  if (!anyFailed) console.log("All routes clean across 320-2560px.");
  console.log(`\nFull report: ${reportPath}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}`);

  process.exitCode = anyFailed ? 1 : 0;
}

main();
