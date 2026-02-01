import { cn } from "@/lib/utils"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { BackgroundGrid } from "@/components/ui/background-grid"

type AppBackgroundProps = {
  className?: string
  /**
   * Extra intensity for landing/hero sections.
   * Keep subtle by default so content stays readable.
   */
  variant?: "default" | "hero"
}

export function AppBackground({ className, variant = "default" }: AppBackgroundProps) {
  const isHero = variant === "hero"
  return (
    <div aria-hidden="true" className={cn("pointer-events-none fixed inset-0 -z-10", className)}>
      <BackgroundBeams className={cn(isHero ? "opacity-65" : "opacity-45")} />
      <BackgroundGrid className={cn(isHero ? "opacity-40" : "opacity-25")} />
      <div
        className={cn(
          "absolute inset-0",
          "bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.65),transparent_60%)]"
        )}
      />
    </div>
  )
}

