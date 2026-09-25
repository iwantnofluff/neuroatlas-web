"use client"

import React, { useEffect, useId, useRef, useState } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

/**
 *  DotPattern Component Props
 *
 * @param {number} [width=16] - The horizontal spacing between dots
 * @param {number} [height=16] - The vertical spacing between dots
 * @param {number} [x=0] - The x-offset of the entire pattern
 * @param {number} [y=0] - The y-offset of the entire pattern
 * @param {number} [cx=1] - The x-offset of individual dots
 * @param {number} [cy=1] - The y-offset of individual dots
 * @param {number} [cr=1] - The radius of each dot
 * @param {string} [className] - Additional CSS classes to apply to the SVG container
 * @param {boolean} [glow=false] - Whether dots should have a glowing animation effect
 */
interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  x?: number
  y?: number
  cx?: number
  cy?: number
  cr?: number
  className?: string
  glow?: boolean
  [key: string]: unknown
}

/**
 * DotPattern Component
 *
 * A React component that creates an animated or static dot pattern background using SVG.
 * The pattern automatically adjusts to fill its container and can optionally display glowing dots.
 *
 * @component
 *
 * @see DotPatternProps for the props interface.
 *
 * @example
 * // Basic usage
 * <DotPattern />
 *
 * // With glowing effect and custom spacing
 * <DotPattern
 *   width={20}
 *   height={20}
 *   glow={true}
 *   className="opacity-50"
 * />
 *
 * @notes
 * - The component is client-side only ("use client")
 * - Automatically responds to container size changes
 * - When glow is enabled, dots will animate with random delays and durations
 * - Uses Motion for animations
 * - Dots color can be controlled via the text color utility classes
 */

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  ...props
}: DotPatternProps) {
  const id = useId()
  const containerRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // ResizeObserver, not a `window.resize` listener — a real, confirmed
  // bug this fixes: a resize LISTENER only fires when the BROWSER
  // WINDOW itself changes size, so a container that changes size for
  // any other reason (a parent's own scroll-linked height/margin
  // style resolving after this component's first mount — exactly what
  // CurtainReveal.tsx's `metrics` state does, since it starts `null`
  // and only applies real inline styles after its own effect runs one
  // render later; a Fast Refresh hot-reload landing mid-layout; late-
  // loading fonts reflowing the page) never re-measures at all. Caught
  // live inside CurtainReveal's own sticky reveal: this pattern
  // measured its container's height as whatever it happened to be at
  // the very first paint, then never updated again, rendering dots
  // across only a thin strip at the top instead of the element's real
  // (later-settled) full height — confirmed by reading the rendered
  // circles' own cy values directly, not just eyeballing a screenshot.
  // A ResizeObserver reacts to the OBSERVED ELEMENT's actual box
  // changing, for any reason, which is what this always needed.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Rounds to whole px and bails out if unchanged — a real, confirmed
    // bug this fixes: inside a `position: sticky` container (exactly
    // this component's use inside CurtainReveal's reveal panel),
    // getBoundingClientRect() reports tiny sub-pixel fluctuations on
    // almost every scroll frame even though the element's true CSS
    // size never changes. Calling setDimensions unconditionally turned
    // every one of those sub-pixel jitters into a full re-render of
    // every circle in `dots` (1700+ of them at this pattern's own
    // density) racing against the scroll itself — confirmed live via a
    // frame-by-frame video capture, which showed the dot grid visibly
    // flickering in and out between adjacent frames while scrolling
    // past this exact panel, not a one-time layout bug. Skipping the
    // update when the rounded size hasn't actually changed removes
    // those spurious re-renders entirely without weakening the
    // ResizeObserver's own job of catching REAL size changes.
    const updateDimensions = () => {
      const { width, height } = el.getBoundingClientRect()
      const nextWidth = Math.round(width)
      const nextHeight = Math.round(height)
      setDimensions((prev) =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight }
      )
    }

    updateDimensions()
    const observer = new ResizeObserver(updateDimensions)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const dots = Array.from(
    {
      length:
        Math.ceil(dimensions.width / width) *
        Math.ceil(dimensions.height / height),
    },
    (_, i) => {
      const col = i % Math.ceil(dimensions.width / width)
      const row = Math.floor(i / Math.ceil(dimensions.width / width))
      // Deterministic pseudo-random (seeded by index) instead of
      // Math.random() — the React Compiler treats Math.random() in render
      // as an impure call (react-hooks/purity), and this only feeds the
      // glow animation's stagger, so it doesn't need real randomness.
      const seeded = (seed: number) => {
        const v = Math.sin(seed) * 10000
        return v - Math.floor(v)
      }
      return {
        x: col * width + cx + x,
        y: row * height + cy + y,
        delay: seeded(i) * 5,
        duration: seeded(i + 1000) * 3 + 2,
      }
    }
  )

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-neutral-400/80",
        className
      )}
      {...props}
    >
      <defs>
        <radialGradient id={`${id}-gradient`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.map((dot) => (
        <motion.circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r={cr}
          fill={glow ? `url(#${id}-gradient)` : "currentColor"}
          initial={glow ? { opacity: 0.4, scale: 1 } : {}}
          animate={
            glow
              ? {
                  opacity: [0.4, 1, 0.4],
                  scale: [1, 1.5, 1],
                }
              : {}
          }
          transition={
            glow
              ? {
                  duration: dot.duration,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: dot.delay,
                  ease: "easeInOut",
                }
              : {}
          }
        />
      ))}
    </svg>
  )
}
