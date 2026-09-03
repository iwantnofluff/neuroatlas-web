import React, { type CSSProperties } from "react"
import Link, { type LinkProps } from "next/link"

import { cn } from "@/lib/utils"

type ShimmerVisualProps = {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  /** The glass tint at rest — this is the only thing that should vary
   *  button to button (a cream-tinted glass over a dark section, a
   *  navy-tinted glass over a light one), matching whatever's behind it. */
  background?: string
  /** What the glass fills to on hover/focus. Defaults to gold — every
   *  button on the site hovers to this same color regardless of its own
   *  rest tint, by design (see .btn-glass-icon in globals.css for the
   *  same rule applied to icon-only buttons). */
  hoverBackground?: string
  /** Tint for the hover/focus glow bloom. Defaults to `hoverBackground`
   *  (gold), so the glow always matches what the glass is filling to. */
  glowColor?: string
  className?: string
  children?: React.ReactNode
}

function shimmerStyle({
  shimmerColor = "#ffffff",
  shimmerSize = "0.14em",
  shimmerDuration = "3s",
  borderRadius = "100px",
  background = "rgba(0, 0, 0, 1)",
  hoverBackground = "var(--color-gold)",
  glowColor,
}: ShimmerVisualProps): CSSProperties {
  return {
    "--spread": "90deg",
    "--shimmer-color": shimmerColor,
    "--radius": borderRadius,
    "--speed": shimmerDuration,
    "--cut": shimmerSize,
    "--bg": background,
    "--hover-bg": hoverBackground,
    "--glow": glowColor ?? hoverBackground,
  } as CSSProperties
}

const rootClassName = (className?: string) =>
  cn(
    // inline-flex, not flex — plain `flex` makes this a block-level box,
    // which stretches to fill its container's full width whenever a
    // button sits directly in normal block flow (no wrapping `flex
    // justify-center` div) — confirmed live on the closing-CTA sections,
    // rendering at ~690px wide instead of hugging its own text. inline-
    // flex sizes to content instead, and is unaffected by any caller that
    // ALREADY wraps this in its own flex container (a flex item's outer
    // display is "blockified" per spec regardless of what's set here, so
    // nothing changes for those). It also means a plain `text-center` on
    // an ancestor now centers the button on its own, with no wrapper
    // needed — exactly the pattern most of this site's CTAs already rely
    // on for other centered content.
    "group relative z-0 inline-flex cursor-pointer items-center justify-center overflow-hidden [border-radius:var(--radius)] px-6 py-3 whitespace-nowrap text-white",
    // Root has NO fill of its own — a solid background here would sit
    // directly behind the backdrop layer below and defeat its transparency
    // entirely (and give its backdrop-blur nothing real to blur). The only
    // thing root contributes is its border color and the thin `--cut` rim
    // where the backdrop doesn't cover — real content shows through there,
    // with the spinning spark drawn on top of it, which is what reads as a
    // line of light travelling around the border.
    "border [border-color:color-mix(in_oklab,var(--bg)_50%,transparent)]",
    "transform-gpu transition-[box-shadow,transform,color] duration-300 ease-in-out active:translate-y-px",
    "shadow-[0_6px_18px_-10px_color-mix(in_oklab,var(--glow)_55%,transparent)]",
    "hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--glow)_55%,transparent),0_0_32px_6px_color-mix(in_oklab,var(--glow)_70%,transparent)]",
    "focus-visible:shadow-[0_0_0_1px_color-mix(in_oklab,var(--glow)_55%,transparent),0_0_32px_6px_color-mix(in_oklab,var(--glow)_70%,transparent)]",
    className
  )

/** The spark/highlight/backdrop layers shared by both the <button> and <Link> forms. */
function ShimmerLayers({ children }: { children?: React.ReactNode }) {
  return (
    <>
      {/* spark container — the travelling light only plays on hover/focus
          (via the shared `group`), not continuously; it also restarts
          cleanly from the top of the loop each time a hover begins, since
          toggling the `animate-*` class on/off resets it rather than
          pausing it mid-cycle. */}
      <div
        className={cn(
          "-z-30 blur-[2px]",
          "@container-[size] absolute inset-0 overflow-visible"
        )}
      >
        {/* spark */}
        <div className="absolute inset-0 aspect-[1] h-[100cqh] rounded-none [mask:none] group-hover:motion-safe:animate-shimmer-slide group-focus-visible:motion-safe:animate-shimmer-slide">
          {/* spark before */}
          <div className="absolute -inset-full w-auto [translate:0_0] rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] group-hover:motion-safe:animate-spin-around group-focus-visible:motion-safe:animate-spin-around" />
        </div>
      </div>
      {/* Text color on hover — a real, confirmed bug this replaces: the
          old version put `group-hover:text-navy` directly on the root
          element, which ALSO carries the `group` class. Tailwind's
          `group-hover:` compiles to a descendant-combinator selector
          (`.group:hover .group-hover\:text-navy`), which can never match
          an element against itself — so hovering never actually changed
          the text color, confirmed live (computed `color` was identical
          at rest and on hover). Moving it onto this wrapping span — a
          genuine descendant of the root `.group` — is what actually
          makes it work. */}
      <span className="relative z-10 transition-colors duration-300 group-hover:text-navy group-focus-visible:text-navy">
        {children}
      </span>

      {/* Highlight */}
      <div
        className={cn(
          "absolute inset-0 size-full",
          "rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]",
          "transform-gpu transition-all duration-300 ease-in-out",
          "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",
          "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"
        )}
      />

      {/* backdrop — the actual visible fill. Translucent glass tinted by
          the button's own rest color (with a real backdrop-blur, so it
          genuinely reads as glass rather than a flat tint); fills in to a
          glossy, near-opaque version of `--hover-bg` (gold by default) on
          hover/focus — a deliberately different color from the rest tint,
          not just a more-opaque version of it, so every button converges
          on the same hover look regardless of its own rest-state color. */}
      <div
        className={cn(
          "absolute inset-(--cut) -z-20 [border-radius:var(--radius)] backdrop-blur-lg backdrop-saturate-150",
          "[background:color-mix(in_oklab,var(--bg)_18%,transparent)]",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)]",
          "transition-[background,box-shadow] duration-300 ease-in-out",
          "group-hover:[background:linear-gradient(180deg,color-mix(in_oklab,var(--hover-bg)_92%,white_16%),var(--hover-bg))]",
          "group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]",
          "group-focus-visible:[background:linear-gradient(180deg,color-mix(in_oklab,var(--hover-bg)_92%,white_16%),var(--hover-bg))]",
          "group-focus-visible:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]"
        )}
      />
    </>
  )
}

export type ShimmerButtonProps = ShimmerVisualProps &
  Omit<React.ComponentPropsWithoutRef<"button">, keyof ShimmerVisualProps>

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor,
      shimmerSize,
      borderRadius,
      shimmerDuration,
      background,
      hoverBackground,
      glowColor,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        style={shimmerStyle({
          shimmerColor,
          shimmerSize,
          borderRadius,
          shimmerDuration,
          background,
          hoverBackground,
          glowColor,
        })}
        className={rootClassName(className)}
        ref={ref}
        {...rest}
      >
        <ShimmerLayers>{children}</ShimmerLayers>
      </button>
    )
  }
)
ShimmerButton.displayName = "ShimmerButton"

export type ShimmerLinkProps = ShimmerVisualProps &
  Omit<LinkProps, keyof ShimmerVisualProps> & { href: LinkProps["href"] }

/**
 * Link-rooted variant of ShimmerButton — for CTAs that navigate rather than
 * trigger an action. A separate component (instead of a polymorphic `asChild`)
 * because the shimmer/spark layers are sibling <div>s next to {children},
 * which Radix Slot (single-child only) can't clone props onto.
 */
export const ShimmerLink = React.forwardRef<HTMLAnchorElement, ShimmerLinkProps>(
  (
    {
      shimmerColor,
      shimmerSize,
      borderRadius,
      shimmerDuration,
      background,
      hoverBackground,
      glowColor,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <Link
        style={shimmerStyle({
          shimmerColor,
          shimmerSize,
          borderRadius,
          shimmerDuration,
          background,
          hoverBackground,
          glowColor,
        })}
        className={rootClassName(className)}
        ref={ref}
        {...rest}
      >
        <ShimmerLayers>{children}</ShimmerLayers>
      </Link>
    )
  }
)
ShimmerLink.displayName = "ShimmerLink"
