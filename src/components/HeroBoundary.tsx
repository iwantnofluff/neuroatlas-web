/**
 * Invisible sentinel placed exactly where a page's dark hero content ends.
 * Header measures its position to know when to solidify — see Header.tsx.
 * Render this immediately after any dark hero/pinned section, before the
 * next section begins.
 *
 * h-0, not h-px — Header.tsx only ever reads this element's `.top` via
 * getBoundingClientRect(), never its height, so a real 1px-tall box was
 * pure downside: it has no background of its own, so it let the page's
 * underlying cream background bleed through as a visible seam whenever
 * two dark sections sit back-to-back across it (confirmed live on
 * /how-it-works, and the same latent issue exists on /band). A
 * genuinely zero-height marker still reports the correct position and
 * can never render as a visible line.
 */
export function HeroBoundary() {
  return <div id="hero-boundary" aria-hidden="true" className="h-0" />;
}
