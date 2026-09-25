import { cn } from "@/lib/utils";

/**
 * A realistic (CSS-only, no image asset) iPhone frame — titanium-style
 * bezel, a Dynamic Island notch, and side buttons — for presenting an
 * app screen as a device photo mockup rather than a bare card. Sized
 * by height with its own true aspect ratio, same "size by height,
 * width follows" pattern as BodySilhouette.tsx.
 *
 * `variant` picks which real device's screen resolution the aspect
 * ratio matches — "pro" (the default, every existing caller) is
 * iPhone 17 Pro's 1206:2622 (~9:19.57); "pro-max" is iPhone 17 Pro
 * Max's own, larger 1320:2868 (~9:19.57 too, but not the identical
 * ratio — confirmed via Apple's own published specs, not assumed from
 * the smaller Pro). Either way this mockup stands in for the screen
 * itself, so the resolution ratio is the correct one to match, not
 * the physical case ratio (close but not identical, since bezel
 * proportions differ from the pixel grid).
 */
export function IPhoneMockup({
  children,
  className,
  variant = "pro",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "pro" | "pro-max";
}) {
  return (
    <div
      className={cn(
        "relative h-full",
        variant === "pro-max" ? "aspect-[1320/2868]" : "aspect-[1206/2622]",
        className
      )}
    >
      {/* Side buttons — sit outside the bezel's own rounded rect. */}
      <div className="absolute top-[16%] -left-[2px] h-[3.5%] w-[3px] rounded-l-sm bg-[#3a3b3e]" />
      <div className="absolute top-[22%] -left-[2px] h-[6%] w-[3px] rounded-l-sm bg-[#3a3b3e]" />
      <div className="absolute top-[30%] -left-[2px] h-[6%] w-[3px] rounded-l-sm bg-[#3a3b3e]" />
      <div className="absolute top-[20%] -right-[2px] h-[9%] w-[3px] rounded-r-sm bg-[#3a3b3e]" />

      {/* Bezel */}
      <div
        className="relative size-full rounded-[13%] p-[3%] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]"
        style={{
          background:
            "linear-gradient(155deg, #4a4b4f 0%, #1c1d1f 12%, #0a0a0b 50%, #1c1d1f 88%, #4a4b4f 100%)",
        }}
      >
        {/* Screen */}
        <div className="relative size-full overflow-hidden rounded-[10%] bg-black">
          {children}

          {/* Dynamic Island */}
          <div className="absolute top-[1.6%] left-1/2 h-[3%] w-[28%] -translate-x-1/2 rounded-full bg-black" />

          {/* Home indicator — #F4F0E9 is an exact match for
              --color-cream, reused rather than hardcoded again. */}
          <div className="absolute bottom-[1%] left-1/2 h-[0.4%] w-[32%] -translate-x-1/2 rounded-full bg-cream" />
        </div>
      </div>
    </div>
  );
}
