/**
 * Invisible sentinel placed exactly where a page's dark hero content ends.
 * Header measures its position to know when to solidify — see Header.tsx.
 * Render this immediately after any dark hero/pinned section, before the
 * next (light) section begins.
 */
export function HeroBoundary() {
  return <div id="hero-boundary" aria-hidden="true" className="h-px" />;
}
