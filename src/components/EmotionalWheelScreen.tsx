"use client";

import { useState } from "react";
import { Sparkles, Wifi, BatteryFull, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Figma file Ok6qYziHfAl50GRs0YRC6O, node 13178:9091 ("Emotional
 * wheel") — a resonance-check screen: status bar, close button,
 * "Resonance Check" pill, headline, an 8-petal emotion wheel, and a
 * "Skip for today" button. All absolute positions below are that
 * frame's own literal pixel geometry (393×852) converted to a
 * percentage of its own axis (x/393, y/852) so the layout scales
 * correctly at any rendered size, not just 393px wide — the same
 * technique IPhoneMockup and HrvDetailCard already use, and it works
 * here for the same reason: this screen only ever renders inside a
 * container whose aspect ratio is already locked (IPhoneMockup's own
 * `aspect-[1320/2868]`), so an x-axis percentage and a y-axis
 * percentage computed from the true 393×852 reference always land on
 * the correct point regardless of the container's actual pixel size.
 *
 * The 8 petal SVGs (public/wheel/petal-0..7.svg) and the center glow
 * (center-glow.svg) are downloaded directly from the Figma node — real
 * bezier illustrations, not something a generic icon set can
 * reproduce. The close (X) and sparkle icons, by contrast, are pixel-
 * identical to lucide's own X/Sparkles glyphs at the design's own
 * exact colors (confirmed by reading the downloaded SVGs' path data
 * before choosing this), so those two stay as lucide components,
 * matching every other in-app screen this codebase has built
 * (CeoBreathScreen, HrvDetailCard) rather than shipping two more
 * asset files for shapes already available as code.
 *
 * Token reuse (do not re-declare):
 *   - Close button fill (#1C1D23) and border (rgba(242,242,242,0.1))
 *     are exact matches for --color-navy-soft / white/10.
 *   - Resonance pill's border (rgba(218,199,158,0.1)) and its icon/text
 *     color (#C4B38E) are exact matches for --color-gold/10 and
 *     --color-gold-deep.
 *   - Headline's two colors (#F4F0E9 / #DAC79E) are exact matches for
 *     --color-cream / --color-gold.
 * The screen's own base (#080911) and the skip button's neutral border/
 * text (#303439 / #9B9C9D) are this app screen's own local palette (not
 * this brand's tokens, same treatment as every other in-app mockup
 * built this session) and stay literal hex.
 *
 * The design's own static export only labels ONE petal ("Anger",
 * rotate 67.5deg) — every other petal is unlabeled in the source
 * file, because Figma is showing one illustrative selected state, not
 * the full data set. Since this needs to be genuinely interactive
 * (tap any petal, see ITS OWN label), the other 7 labels are filled in
 * using Plutchik's wheel of emotions — the standard, scientifically-
 * grounded 8-emotion circumplex whose own opposite-pairs (Joy/Sadness,
 * Trust/Disgust, Fear/Anger, Anticipation/Surprise sit 180° apart)
 * already land 4 petals apart on an 8-petal wheel, exactly matching
 * this wheel's own geometry once rotated so Anger sits at the given
 * 67.5deg petal — not an arbitrary invention, the one constraint the
 * source file provides pins down the other 7 uniquely.
 */
const PETAL_ANGLES = [22.5, 67.5, 112.5, 157.5, -157.5, -112.5, -67.5, -22.5];

const EMOTIONS = [
  "Disgust",
  "Anger",
  "Anticipation",
  "Joy",
  "Trust",
  "Fear",
  "Surprise",
  "Sadness",
];

const PETAL_INSETS = [
  "inset-[0_19.62%_45.17%_38.33%]",
  "inset-[19.62%_0_38.33%_45.17%]",
  "inset-[38.33%_0_19.62%_45.17%]",
  "inset-[45.16%_19.62%_0_38.33%]",
  "inset-[45.17%_38.33%_0_19.62%]",
  "inset-[38.33%_45.17%_19.62%_0]",
  "inset-[19.62%_45.17%_38.33%_0]",
  "inset-[0_38.33%_45.17%_19.62%]",
];

// The inner wrapper's own size/rotation, copied verbatim from the
// design's generated CSS (container-query hypot() math) — this is
// what actually places each identical petal shape correctly within
// its own diamond-shaped inset slot after rotation; re-deriving it by
// hand risked a subtly wrong petal size no visual check would catch
// until compared pixel-for-pixel against the source.
const PETAL_TRANSFORM_CLASSES = [
  "h-[hypot(-44.4926cqw,82.3691cqh)] rotate-[22.5deg] w-[hypot(55.5074cqw,17.6309cqh)]",
  "h-[hypot(-82.3691cqw,44.4926cqh)] rotate-[67.5deg] w-[hypot(17.6309cqw,55.5074cqh)]",
  "h-[hypot(-82.3691cqw,-44.4926cqh)] rotate-[112.5deg] w-[hypot(-17.6309cqw,55.5074cqh)]",
  "h-[hypot(-44.4926cqw,-82.3691cqh)] rotate-[157.5deg] w-[hypot(-55.5074cqw,17.6309cqh)]",
  "h-[hypot(44.4926cqw,-82.3691cqh)] rotate-[-157.5deg] w-[hypot(-55.5074cqw,-17.6309cqh)]",
  "h-[hypot(82.3691cqw,-44.4926cqh)] rotate-[-112.5deg] w-[hypot(-17.6309cqw,-55.5074cqh)]",
  "h-[hypot(82.3691cqw,44.4926cqh)] rotate-[-67.5deg] w-[hypot(17.6309cqw,-55.5074cqh)]",
  "h-[hypot(44.4926cqw,82.3691cqh)] rotate-[-22.5deg] w-[hypot(55.5074cqw,-17.6309cqh)]",
];

const PETAL_ASSETS = [
  "/wheel/petal-0.svg",
  "/wheel/petal-1.svg",
  "/wheel/petal-2.svg",
  "/wheel/petal-3.svg",
  "/wheel/petal-4.svg",
  "/wheel/petal-5.svg",
  "/wheel/petal-6.svg",
  "/wheel/petal-7.svg",
];

// Label geometry — derived once from the one data point the design
// gives (Anger's own label: center at 29.72%/-12.31% off the wheel's
// center, rotated 22.5deg off its petal's own 67.5deg angle), then
// applied to every petal via the same radius + rotation offset, since
// all 8 petals share one radial layout.
//
// The raw tangential angle (petalAngle - 90) is NOT used unclamped —
// a real, confirmed bug this fixes: petals nearer the top/bottom of
// the wheel (e.g. Joy at 157.5deg) get a raw tilt of ±67.5deg or more,
// which reads as sideways, barely-legible text (confirmed live via a
// cropped screenshot after selecting Joy — the label rendered nearly
// vertical). Anger's own reference tilt is a modest -22.5ish deg
// specifically because 67.5deg (its petal's own angle) is already
// close to the wheel's "equator" — that's the one data point the
// design gives, not license to scale the same formula all the way up
// to a petal near the top. Clamping every label's tilt to the same
// ±25deg band Anger's own example already sits inside keeps every
// label comfortably horizontal and readable while still tilting
// toward its own petal's side of the wheel.
const LABEL_RADIUS_PERCENT = 32.17;
const LABEL_TILT_MAX_DEG = 25;
function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
const labelOffsets = PETAL_ANGLES.map((angle) => {
  const rad = (angle * Math.PI) / 180;
  return {
    dx: LABEL_RADIUS_PERCENT * Math.sin(rad),
    dy: -LABEL_RADIUS_PERCENT * Math.cos(rad),
    rotate: clamp(angle - 90, -LABEL_TILT_MAX_DEG, LABEL_TILT_MAX_DEG),
  };
});

export function EmotionalWheelScreen({ className }: { className?: string }) {
  const [selected, setSelected] = useState(1);

  return (
    <div
      className={cn("relative size-full overflow-hidden bg-[#080911]", className)}
      // containerType: "size" — this screen only ever renders at a
      // fraction of a real phone's own 393px width (bounded by however
      // tall the section around it can afford to make the mockup), so
      // every text/icon size below is in cqw (a real, confirmed bug
      // this fixes: fixed text-4xl/text-sm rendered comically oversized
      // and force-wrapped the headline into five single-word lines at
      // this screen's actual ~230px rendered width, confirmed live via
      // screenshot). cqw resolves against THIS container specifically
      // (each petal button below sets its own nested containerType for
      // its own hypot() sizing, which shadows this one for its own
      // descendants, so the two don't conflict).
      style={{ containerType: "size" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 50% 55%, color-mix(in oklab, var(--color-gold) 14%, transparent), transparent 70%)",
        }}
      />

      {/* Status bar — same in-app treatment as CeoBreathScreen.tsx. */}
      <div className="relative flex items-center justify-between px-[6.11cqw] pt-[3cqw] text-[#f2f2f2]">
        <span className="text-[3.56cqw] font-semibold tracking-tight">9:41</span>
        <div className="flex items-center gap-[1.5cqw]">
          <Wifi className="size-[3.56cqw]" />
          <BatteryFull className="size-[4.07cqw]" />
        </div>
      </div>

      <button
        type="button"
        aria-label="Close"
        className="absolute top-[10.8%] left-[6.11%] flex w-[12.21%] aspect-square items-center justify-center rounded-full border border-white/10 bg-navy-soft"
      >
        <X className="size-1/2 text-gold" />
      </button>

      <div className="absolute top-[21.13%] left-1/2 flex w-[46.56%] -translate-x-1/2 items-center justify-center gap-[2.5cqw] rounded-xl border border-gold/10 bg-[rgba(16,17,23,0.2)] px-[3cqw] py-[2cqw]">
        <Sparkles className="size-[4.07cqw] shrink-0 text-gold-deep" />
        <p className="text-[3.05cqw] tracking-[0.2em] whitespace-nowrap text-gold-deep uppercase">
          Resonance Check
        </p>
      </div>

      <div className="absolute top-[28.05%] inset-x-0 px-[6.11cqw] text-center">
        <p className="text-[9.16cqw] leading-tight text-[#f4f0e9]">How does your</p>
        <p className="text-[9.16cqw] leading-tight text-gold">spirit feel?</p>
      </div>

      <div className="absolute top-[45.58%] left-1/2 w-[79.9%] aspect-square -translate-x-1/2">
        {PETAL_ANGLES.map((angle, i) => (
          // Positioning only on this outer div (pointer-events-none) —
          // its own inset box is roughly a quarter of the whole wheel,
          // which overlaps its neighbors' boxes heavily near the shared
          // center point (a real, confirmed bug: clicking "Joy" landed
          // on "Trust" instead, since Trust's own later-painted, equally
          // oversized box covered the same coordinate). Moving the
          // actual `<button>` (and its onClick) onto the INNER,
          // precisely hypot()-sized and rotated div — re-enabling
          // pointer-events on just that tight rectangle via
          // pointer-events-auto — means each petal's clickable area
          // matches its own visible shape instead of a quarter of the
          // wheel.
          <div
            key={EMOTIONS[i]}
            className={cn("pointer-events-none absolute", PETAL_INSETS[i])}
            style={{ containerType: "size" }}
          >
            <button
              type="button"
              aria-pressed={selected === i}
              aria-label={EMOTIONS[i]}
              onClick={() => setSelected(i)}
              className={cn(
                "pointer-events-auto relative flex-none transition-transform duration-300",
                PETAL_TRANSFORM_CLASSES[i],
                selected === i ? "scale-110" : "scale-100 opacity-80 hover:opacity-100"
              )}
            >
              <img
                alt=""
                src={PETAL_ASSETS[i]}
                className={cn(
                  "block size-full max-w-none transition-[filter] duration-300",
                  selected === i &&
                    "brightness-125 drop-shadow-[0_0_18px_rgba(244,203,109,0.45)]"
                )}
              />
            </button>
          </div>
        ))}

        {/* Center glow — always on, not selection-driven (matches the
           source, which renders it as one static element regardless
           of which petal the label sits next to). pointer-events-none
           is required, not decorative-only: this glow's own box sits
           dead center, right where every petal's inset narrows to a
           point, so without it the glow silently ate the click on
           whichever petal a tap landed nearest the center of —
           confirmed live (Playwright's own click reported this exact
           element "intercepts pointer events" when targeting a petal
           near the middle of the wheel). */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 size-[29.9%] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-[-284.09%]">
            <img alt="" src="/wheel/center-glow.svg" className="block size-full max-w-none" />
          </div>
        </div>

        {/* Selected emotion's own label, radially positioned/rotated
           to match its petal — see labelOffsets' own comment. */}
        <p
          className="pointer-events-none absolute font-normal text-[2.4cqw] whitespace-nowrap text-[#ece3d1]"
          style={{
            left: `${50 + labelOffsets[selected].dx}%`,
            top: `${50 + labelOffsets[selected].dy}%`,
            transform: `translate(-50%, -50%) rotate(${labelOffsets[selected].rotate}deg)`,
          }}
        >
          {EMOTIONS[selected]}
        </p>
      </div>

      <button
        type="button"
        className="absolute top-[87.79%] left-1/2 -translate-x-1/2 rounded-xl border border-[#303439] px-[4cqw] py-[2.5cqw] text-[3.56cqw] whitespace-nowrap text-[#9b9c9d]"
      >
        Skip for today
      </button>
    </div>
  );
}
