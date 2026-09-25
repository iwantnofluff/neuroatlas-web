/**
 * The one shared definition of "which step is active" for
 * /for-organisations' "How To Get Started" section — imported by both
 * HowToGetStartedSection.tsx (drives the step text's reveal windows) and
 * HowToGetStartedScene.tsx (drives the module's travel target), so both
 * derive the active step from the exact same formula applied to the same
 * scrollYProgress value. Kept in its own module with no dependency on
 * either of those two files specifically to avoid a circular import
 * between them (the section lazily imports the scene component; the
 * scene needing something back from the section statically would create
 * a cycle).
 */
export const STEP_COUNT = 4;

export function activeStepIndex(progress: number) {
  return Math.min(STEP_COUNT - 1, Math.floor(progress * STEP_COUNT));
}
