import type { Locator, Page } from "@playwright/test";
import sharp from "sharp";

/**
 * Shared helpers for the Phase 1 visual suite (docs/playwright-testing-spec.md).
 * baseline.spec.ts's own top comment has the history of real bugs these exist
 * to work around; each helper's own comment has the evidence behind it.
 */

/**
 * Freezes every <video> on the same frame every run: pause, seek to 0, wait
 * for the seek to land. Pausing alone (the previous version) froze whatever
 * frame playback happened to have reached, which differs run to run — most
 * of home--hero's 1–24% verification-run diffs. Bounded at 10s per video so
 * a video that never loads fails the capture visibly rather than hanging.
 */
export async function freezeVideos(page: Page) {
  await page.evaluate(async () => {
    const videos = [...document.querySelectorAll("video")];
    await Promise.all(
      videos.map(
        (v) =>
          new Promise<void>((resolve) => {
            const done = () => resolve();
            const timer = setTimeout(done, 10000);
            v.pause();
            const onSeeked = () => {
              clearTimeout(timer);
              done();
            };
            if (v.readyState >= 2 && v.currentTime === 0) {
              clearTimeout(timer);
              done();
              return;
            }
            v.addEventListener("seeked", onSeeked, { once: true });
            v.currentTime = 0;
          })
      )
    );
  });
}

/**
 * Scrolls a section to the position its settled state is captured at. A
 * STICKY section is the visible child of a pinned scroll-jacked track; its
 * content is driven by scroll position, so this scrolls 80% through that
 * track (the nearest ancestor taller than ~1.2 viewports) to reach the held
 * state. A non-sticky section just scrolls into view.
 */
async function scrollToSettledPosition(locator: Locator) {
  const isSticky = await locator.evaluate((el) => getComputedStyle(el).position === "sticky");
  if (isSticky) {
    await locator.evaluate((el: HTMLElement) => {
      let ancestor = el.parentElement;
      const viewportH = window.innerHeight;
      while (ancestor && ancestor.offsetHeight < viewportH * 1.2) ancestor = ancestor.parentElement;
      const track = ancestor ?? el;
      const trackTop = track.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.max(0, trackTop + track.offsetHeight * 0.8 - viewportH / 2));
    });
  } else {
    await locator.scrollIntoViewIfNeeded();
  }
}

/**
 * A non-sticky section taller than the viewport is captured whole from one
 * scroll position, so any part that never entered the viewport would never
 * fire its once-only reveal and would be captured blank. Stepping through it
 * half a viewport at a time lets every reveal fire first.
 */
async function scrollThroughTallSection(locator: Locator, page: Page) {
  const steps = await locator.evaluate((el) => {
    if (getComputedStyle(el).position === "sticky") return [];
    const viewportH = window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const height = (el as HTMLElement).offsetHeight;
    if (height <= viewportH) return [];
    const positions: number[] = [];
    for (let y = top - viewportH / 2; y < top + height; y += viewportH / 2) positions.push(Math.max(0, Math.round(y)));
    return positions;
  });
  for (const y of steps) {
    await page.evaluate((target) => window.scrollTo(0, target), y);
    await waitForScrollStable(page);
  }
}

// Frame-counted waits below use 30s budgets: frames are very slow on
// Chromium's SwiftShader here (3.44 fps measured on /band at 2560×1440 with
// nothing else running), so a frame count, not a wall-clock guess, is the
// honest unit — the budget just has to be long enough not to cut one off.
const FRAME_WAIT_TIMEOUT = 30000;

/** Prefixes a failure with the settle stage it came from, plus any
 *  diagnostic state gathered at the moment it failed. */
async function stage<T>(name: string, run: () => Promise<T>, diagnose?: () => Promise<string>): Promise<T> {
  try {
    return await run();
  } catch (e) {
    const detail = diagnose ? await diagnose().catch(() => "diagnosis unavailable") : "";
    throw new Error(`[${name}] ${(e as Error).message.split("\n")[0]}${detail ? ` — ${detail}` : ""}`);
  }
}

/** Lenis eases programmatic scrolls; nothing is stable until scrollY is. */
async function waitForScrollStable(page: Page) {
  await page.waitForFunction(
    () => {
      const w = window as unknown as { __scrollStable?: { y: number; frames: number } };
      const y = window.scrollY;
      if (w.__scrollStable && w.__scrollStable.y === y) w.__scrollStable.frames++;
      else w.__scrollStable = { y, frames: 0 };
      return w.__scrollStable.frames >= 6;
    },
    undefined,
    { polling: "raf", timeout: FRAME_WAIT_TIMEOUT }
  );
  await page.evaluate(() => {
    delete (window as unknown as { __scrollStable?: unknown }).__scrollStable;
  });
}

/**
 * Waits until the section and EVERY descendant has no finite animation still
 * running, for 6 consecutive frames. The previous version watched only the
 * marked section element's own opacity/transform — but those elements are
 * mostly static wrappers; the motion is in their children (a staggered
 * headline's last word, the middle of three staggered cards), which is what
 * the whole verification run's 97 mismatches turned out to be.
 *
 * `getAnimations({ subtree: true })` is the browser's own completion signal:
 * Framer Motion runs these entrance animations as real Web Animations here
 * (observed on /for-organisations' hero: 9 running at 300ms, 7 at 900ms, 0
 * by 1800ms). Infinite animations are excluded — they never finish by
 * definition. Requiring the quiet state for 6 frames covers the gap between
 * scrolling a section in and its IntersectionObserver-triggered reveal
 * actually starting.
 *
 * It does NOT see values Framer drives from requestAnimationFrame (springs,
 * layout animations, JS keyframe loops). Those are what sampleMotion() below
 * exists to catch — and it reports them rather than hiding them.
 *
 * The section's own opacity must also be non-zero: a section whose reveal
 * never fires has no running animations either, and must not read as done.
 */
async function waitForSectionAnimations(locator: Locator, page: Page) {
  const handle = await locator.elementHandle();
  if (!handle) throw new Error("section resolved to no element");
  await page.waitForFunction(
    (el) => {
      const store = window as unknown as { __animQuiet?: WeakMap<Element, number> };
      store.__animQuiet ??= new WeakMap();
      const running = (el as Element)
        .getAnimations({ subtree: true })
        .filter(
          (a) => a.playState === "running" && a.effect?.getComputedTiming().iterations !== Infinity
        ).length;
      const quiet = running === 0 && getComputedStyle(el as Element).opacity !== "0";
      const frames = quiet ? (store.__animQuiet.get(el as Element) ?? 0) + 1 : 0;
      store.__animQuiet.set(el as Element, frames);
      return frames >= 6;
    },
    handle,
    { polling: "raf", timeout: FRAME_WAIT_TIMEOUT }
  );
  await handle.evaluate((el) => {
    (window as unknown as { __animQuiet?: WeakMap<Element, number> }).__animQuiet?.delete(el);
  });
}

export type MovingElement = {
  section: string;
  path: string;
  text: string;
  box: { x: number; y: number; width: number; height: number };
  changed: string[];
  /**
   * - "finite-js": moved, then stopped within the sampling window (CountUp's
   *   JS-driven count, a spring) — waited out, captured normally.
   * - "infinite-waapi": still moving, driven by an infinite CSS/Web
   *   Animation on the element itself — Playwright's
   *   `animations: "disabled"` resets those to their initial state at
   *   capture, so the capture is deterministic without a mask.
   * - "perpetual-js": still moving at the end of the window with no Web
   *   Animation behind it (a Framer `repeat: Infinity` JS loop) — the only
   *   class that is a masking candidate, and only if explicitly marked.
   */
  kind: "finite-js" | "infinite-waapi" | "perpetual-js";
  settledAfterMs: number | null;
  /** Name from the nearest `data-visual-mask` ancestor-or-self, if any —
   *  the only thing that makes an element eligible for masking. */
  maskName: string | null;
};

/**
 * Finds descendants still moving after every finite Web Animation is done.
 * `getAnimations()` can't see values Framer drives from JS every frame
 * (springs, `animate()` with onUpdate, JS keyframe loops), so this watches
 * the rendered result instead: each element's bounding box, opacity and
 * transform, sampled every 600ms (at 3.4 fps, ~2 frames apart).
 *
 * Sampling continues until nothing is moving or 10s have passed. An element
 * that stops within the window is finite JS motion (CountUp's 1.6s count, a
 * spring) and has simply been waited out. One still moving at the end is
 * classified by what drives it — see MovingElement.kind. Nothing here masks
 * anything.
 *
 * Only the topmost moving element of each moving subtree is reported (its
 * children inherit the motion). <canvas> is excluded — WebGL convergence is
 * handled separately in captureSection. Also reports whether a finite Web
 * Animation started during sampling (a late reveal), so the caller can
 * re-settle instead of trusting the sample.
 */
async function sampleMotion(locator: Locator): Promise<{ moving: MovingElement[]; lateAnimation: boolean }> {
  return locator.evaluate(async (root) => {
    const els = [root, ...root.querySelectorAll("*")].filter((e) => !e.closest("canvas"));
    const fields = ["x", "y", "width", "height", "opacity", "transform"];
    const sig = (e: Element) => {
      const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      return [Math.round(r.x * 2) / 2, Math.round(r.y * 2) / 2, Math.round(r.width * 2) / 2, Math.round(r.height * 2) / 2, cs.opacity, cs.transform];
    };
    const runningFinite = () =>
      root
        .getAnimations({ subtree: true })
        .some((a) => a.playState === "running" && a.effect?.getComputedTiming().iterations !== Infinity);

    const WINDOW_MS = 10000, INTERVAL_MS = 600, STABLE_SAMPLES = 3;
    const start = performance.now();
    let lateAnimation = false;
    let prev = els.map(sig);
    const everMoved = new Map<number, Set<string>>();
    const stableCount = els.map(() => 0);
    const settledAt = new Map<number, number>();
    while (true) {
      await new Promise((r) => setTimeout(r, INTERVAL_MS));
      if (runningFinite()) lateAnimation = true;
      const cur = els.map(sig);
      els.forEach((_, i) => {
        const changed = fields.filter((_, f) => cur[i][f] !== prev[i][f]);
        if (changed.length) {
          const set = everMoved.get(i) ?? new Set<string>();
          changed.forEach((c) => set.add(c));
          everMoved.set(i, set);
          stableCount[i] = 0;
          settledAt.delete(i);
        } else if (everMoved.has(i)) {
          stableCount[i]++;
          if (stableCount[i] === STABLE_SAMPLES) settledAt.set(i, Math.round(performance.now() - start - STABLE_SAMPLES * INTERVAL_MS));
        }
      });
      prev = cur;
      const stillMoving = [...everMoved.keys()].some((i) => stableCount[i] < STABLE_SAMPLES);
      if (!stillMoving && performance.now() - start >= STABLE_SAMPLES * INTERVAL_MS) break;
      if (performance.now() - start >= WINDOW_MS) break;
    }

    const movingIdx = new Set(everMoved.keys());
    const changedBy = new Map([...everMoved].map(([i, s]) => [i, [...s]]));
    const sectionName = root.getAttribute("data-visual-section") ?? "?";
    const pathOf = (e: Element) => {
      const parts: string[] = [];
      for (let n: Element | null = e; n && n !== root.parentElement; n = n.parentElement) {
        const cls = [...n.classList].slice(0, 3).join(".");
        const nth = n.parentElement ? [...n.parentElement.children].filter((c) => c.tagName === n!.tagName).indexOf(n) + 1 : 1;
        parts.unshift(`${n.tagName.toLowerCase()}${n.id ? "#" + n.id : ""}${cls ? "." + cls : ""}:nth-of-type(${nth})`);
        if (n === root) break;
      }
      return parts.join(" > ");
    };
    const moving = [...movingIdx]
      .filter((i) => {
        for (let p = els[i].parentElement; p && p !== root.parentElement; p = p.parentElement) {
          const j = els.indexOf(p);
          if (j !== -1 && movingIdx.has(j)) return false;
        }
        return true;
      })
      .map((i) => {
        const e = els[i];
        const r = e.getBoundingClientRect();
        const settledAfterMs = settledAt.get(i) ?? null;
        const infiniteWaapi = e
          .getAnimations()
          .some((a) => a.playState === "running" && a.effect?.getComputedTiming().iterations === Infinity);
        const kind: "finite-js" | "infinite-waapi" | "perpetual-js" =
          settledAfterMs !== null ? "finite-js" : infiniteWaapi ? "infinite-waapi" : "perpetual-js";
        return {
          section: sectionName,
          path: pathOf(e),
          text: (e.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 60),
          box: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
          changed: changedBy.get(i)!,
          kind,
          settledAfterMs,
          maskName: e.closest("[data-visual-mask]")?.getAttribute("data-visual-mask") ?? null,
        };
      });
    return { moving, lateAnimation };
  });
}

/**
 * Brings a section to its settled state and reports anything still moving.
 * Nothing here masks anything — masking is decided by the caller from the
 * returned list, and only for elements explicitly marked `data-visual-mask`.
 */
export async function revealAndSettle(locator: Locator, page: Page): Promise<MovingElement[]> {
  await stage("scroll-through", () => scrollThroughTallSection(locator, page));
  await stage("scroll-to-position", () => scrollToSettledPosition(locator));
  await stage("scroll-stable", () => waitForScrollStable(page), () =>
    page.evaluate(() => `scrollY=${window.scrollY}`)
  );
  for (let attempt = 0; attempt < 5; attempt++) {
    await stage(`section-animations#${attempt + 1}`, () => waitForSectionAnimations(locator, page), () =>
      locator.evaluate((el) => {
        const running = el
          .getAnimations({ subtree: true })
          .filter((a) => a.playState === "running" && a.effect?.getComputedTiming().iterations !== Infinity)
          .slice(0, 5)
          .map((a) => {
            const target = (a.effect as KeyframeEffect | null)?.target;
            const name = (a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? a.id ?? "waapi";
            const timing = a.effect?.getComputedTiming();
            return `${name}@${target?.tagName.toLowerCase() ?? "?"}.${[...(target?.classList ?? [])].slice(0, 2).join(".")} progress=${timing?.progress?.toFixed(2)} iterations=${timing?.iterations}`;
          });
        return `opacity=${getComputedStyle(el).opacity} running=[${running.join("; ")}]`;
      })
    );
    const { moving, lateAnimation } = await stage(`motion-sampling#${attempt + 1}`, () => sampleMotion(locator));
    if (!lateAnimation) return moving;
  }
  throw new Error("[settle] section kept starting new finite animations across 5 settle attempts");
}

/** Per-pixel diff ratio between two same-size screenshots (WebGL convergence
 *  check only — baseline comparison belongs to toMatchSnapshot). */
async function pixelDiffRatio(bufA: Buffer, bufB: Buffer): Promise<number> {
  const [a, b] = await Promise.all([
    sharp(bufA).raw().toBuffer({ resolveWithObject: true }),
    sharp(bufB).raw().toBuffer({ resolveWithObject: true }),
  ]);
  if (a.info.width !== b.info.width || a.info.height !== b.info.height) return 1;
  const { width, height, channels } = a.info;
  let diffPixels = 0;
  for (let i = 0; i < width * height; i++) {
    const idx = i * channels;
    if (
      Math.abs(a.data[idx] - b.data[idx]) > 8 ||
      Math.abs(a.data[idx + 1] - b.data[idx + 1]) > 8 ||
      Math.abs(a.data[idx + 2] - b.data[idx + 2]) > 8
    ) {
      diffPixels++;
    }
  }
  return diffPixels / (width * height);
}

/**
 * Captures a section. Always masks the section's own `data-visual-mask`
 * elements (an explicit, reviewed markup allowlist — never inferred).
 *
 * WebGL: this codebase's scenes have no random input, so after a 20s settle
 * (Band.tsx's damp=0.08 lerp is frame-counted, and SwiftShader is slow) two
 * captures 1.5s apart measured 0% diff on all three engines. A canvas that
 * still differs by more than 0.5% (TheSpecs' autoRotate on mobile) falls
 * back to masking that canvas.
 *
 * Capture-only style: the Next dev-tools button is dev tooling, never app
 * content. The fixed site header is hidden only when the section starts
 * above the viewport — a whole-element capture of a tall section would
 * otherwise paint the header across the middle of its content, at a place
 * no user ever sees it. Sections captured from their own top keep it.
 *
 * `animations: "disabled"` must be passed here explicitly: the config's
 * toHaveScreenshot default doesn't reach a plain `.screenshot()` call, and
 * without it Playwright's own "stable" wait never ends on infinite CSS/WAAPI
 * animations.
 */
export async function captureSection(
  locator: Locator,
  page: Page
): Promise<{ buffer: Buffer; canvasMasked: boolean; convergenceDiff: number }> {
  const allowlisted = locator.locator("[data-visual-mask]");
  const startsAboveViewport = await locator.evaluate((el) => el.getBoundingClientRect().top < -1);
  const captureStyle = [
    "nextjs-portal { display: none !important; }",
    startsAboveViewport ? "body header.fixed { visibility: hidden !important; }" : "",
  ].join(" ");
  const shoot = (mask: Locator[]) => locator.screenshot({ animations: "disabled", mask, style: captureStyle });

  if ((await locator.locator("canvas").count()) === 0) {
    return { buffer: await shoot([allowlisted]), canvasMasked: false, convergenceDiff: 0 };
  }

  await page.waitForTimeout(20000);
  const first = await shoot([allowlisted]);
  await page.waitForTimeout(1500);
  const second = await shoot([allowlisted]);
  const convergenceDiff = await pixelDiffRatio(first, second);
  if (convergenceDiff <= 0.005) return { buffer: second, canvasMasked: false, convergenceDiff };
  return { buffer: await shoot([allowlisted, locator.locator("canvas")]), canvasMasked: true, convergenceDiff };
}

/**
 * The region of a section that actually holds content: the union of its text
 * line boxes, media (img/svg/video/canvas/picture), form controls, and any
 * descendant with a visible border — relative to the section's own box.
 *
 * Flatness is measured inside this box, not across the full capture: the
 * full-width measurement grew with viewport width for every section that
 * centers a fixed-width column (a wider screen adds flat margin to every
 * row, no content), which put inside-the-app/availability at 83.5–83.8% on
 * all nine desktop captures with nothing wrong. A section that never
 * revealed still reads 100% here — opacity:0 text keeps its layout boxes, so
 * the box is found, and everything inside it is background.
 */
async function contentBox(locator: Locator) {
  return locator.evaluate((root) => {
    const sec = root.getBoundingClientRect();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const add = (r: DOMRect) => {
      if (r.width < 1 || r.height < 1) return;
      x0 = Math.min(x0, Math.max(r.left, sec.left));
      y0 = Math.min(y0, Math.max(r.top, sec.top));
      x1 = Math.max(x1, Math.min(r.right, sec.right));
      y1 = Math.max(y1, Math.min(r.bottom, sec.bottom));
    };
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      if (!t.textContent?.trim()) continue;
      range.selectNodeContents(t);
      for (const r of range.getClientRects()) add(r);
    }
    for (const e of root.querySelectorAll("img,svg,video,canvas,picture,input,button,textarea,select")) {
      add(e.getBoundingClientRect());
    }
    for (const e of root.querySelectorAll("*")) {
      const cs = getComputedStyle(e);
      if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none" && !/rgba\(.*, 0\)|transparent/.test(cs.borderTopColor)) {
        add(e.getBoundingClientRect());
      }
    }
    if (x1 <= x0 || y1 <= y0) return null;
    return { x: x0 - sec.left, y: y0 - sec.top, width: x1 - x0, height: y1 - y0, sectionWidth: sec.width };
  });
}

export type FlatnessResult = { flatRatio: number; longestRun: number; scoped: "content-box" | "empty" };

/** Row-sampled flatness (~50 samples per row) inside the section's content
 *  box. No content box at all counts as fully flat. */
export async function measureSectionFlatness(buffer: Buffer, locator: Locator): Promise<FlatnessResult> {
  const box = await contentBox(locator);
  const img = sharp(buffer);
  const { width = 0, height = 0 } = await img.metadata();
  if (!box || !width || !height) return { flatRatio: 1, longestRun: height, scoped: "empty" };
  const scale = width / box.sectionWidth;
  const left = Math.max(0, Math.floor(box.x * scale));
  const top = Math.max(0, Math.floor(box.y * scale));
  const cw = Math.max(1, Math.min(width - left, Math.ceil(box.width * scale)));
  const ch = Math.max(1, Math.min(height - top, Math.ceil(box.height * scale)));
  const { data, info } = await img.extract({ left, top, width: cw, height: ch }).raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const step = Math.max(1, Math.floor(cw / 50));
  let flatRows = 0, longestRun = 0, run = 0;
  for (let y = 0; y < ch; y++) {
    const b = y * cw * channels;
    let flat = true;
    for (let x = step; x < cw; x += step) {
      const i = (y * cw + x) * channels;
      if (Math.abs(data[i] - data[b]) > 6 || Math.abs(data[i + 1] - data[b + 1]) > 6 || Math.abs(data[i + 2] - data[b + 2]) > 6) {
        flat = false;
        break;
      }
    }
    if (flat) {
      flatRows++;
      longestRun = Math.max(longestRun, ++run);
    } else {
      run = 0;
    }
  }
  return { flatRatio: flatRows / ch, longestRun, scoped: "content-box" };
}

/**
 * Content-box flatness above this fails the capture, independent of baseline
 * comparison. PROVISIONAL (0.9) until derived from content-box measurements
 * of the regenerated set — see baseline.spec.ts for the derivation once set.
 */
export const FLATNESS_THRESHOLD = 0.9;
