import { cn } from "@/lib/utils"

type BackgroundGridProps = {
  className?: string
}

/**
 * Subtle grid overlay (Aceternity-inspired).
 * Uses a radial mask so edges fade out.
 */
export function BackgroundGrid({ className }: BackgroundGridProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 [background-size:64px_64px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_42%,transparent_72%)]",
        className
      )}
    />
  )
}

