/**
 * The one shared definition of "which step is active" and "where the
 * module sits" for /for-organisations' "How To Get Started" section —
 * imported by both HowToGetStartedSection.tsx (drives the step text's
 * reveal windows AND, now that steps flank a centred spine, their fixed
 * vertical position) and HowToGetStartedScene.tsx (drives the module's
 * own travel target), so both derive from the exact same numbers applied
 * to the same scrollYProgress value. Kept in its own module with no
 * dependency on either of those two files specifically to avoid a
 * circular import between them (the section lazily imports the scene
 * component; the scene needing something back from the section statically
 * would create a cycle).
 */
export const STEP_COUNT = 4;

export function activeStepIndex(progress: number) {
  return Math.min(STEP_COUNT - 1, Math.floor(progress * STEP_COUNT));
}

// How much of the strap's real 260.5mm length the camera frames, centred
// on the strap's own midpoint — see HowToGetStartedScene.tsx's header
// comment for why this is 200mm and not the full length: the strap is
// centred as a spine now, not presented as a fully-visible object, so it
// deliberately bleeds off the top/bottom of the viewport rather than
// floating with both tips shown.
export const STRAP_VISIBLE_HEIGHT_MM = 200;

// The module's 4 stops span this far above/below center. NOT chosen as
// a generic margin — computed against the one thing that actually
// constrains it: the fixed header (72px tall) sitting on top of the
// pinned canvas at the TOP stop specifically. The header eats
// (72/900)*STRAP_VISIBLE_HEIGHT_MM = 16mm of the frame's top edge at a
// typical 900px-tall viewport, and the module itself is 42.8mm tall
// (±21.4mm) — so a half-range of 70mm (module top edge at 91.4mm)
// pushes the module ~7mm behind the header, not just the strap
// bleeding as intended. 55mm keeps the module's top edge at 76.4mm,
// clear of the header's 84mm boundary with margin to spare, even
// though the strap itself keeps bleeding past both edges regardless
// (the module, unlike the strap, is a functional position indicator —
// it should stay fully readable at every stop, not bleed along with
// the decorative backdrop it travels against).
export const MODULE_TRAVEL_HALF_RANGE_MM = 55;

export function moduleStopMM(index: number) {
  const t = STEP_COUNT <= 1 ? 0 : index / (STEP_COUNT - 1);
  return MODULE_TRAVEL_HALF_RANGE_MM * (1 - 2 * t);
}

// Converts a stop's position (mm from center) into a fraction of the
// pinned viewport's height, 0 at the very top and 1 at the very bottom —
// what the step text needs to position itself at the same screen height
// the module will actually be at when that step is active. Pure
// geometry (linear map from the camera's framed mm-range to a 0-1
// screen fraction), no scroll or DOM measurement involved, so it can't
// drift from whatever HowToGetStartedScene.tsx's camera is actually
// doing as long as both read STRAP_VISIBLE_HEIGHT_MM from here.
export function moduleStopScreenFraction(index: number) {
  const halfFrame = STRAP_VISIBLE_HEIGHT_MM / 2;
  return 0.5 - (moduleStopMM(index) / halfFrame) * 0.5;
}
