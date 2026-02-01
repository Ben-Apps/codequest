import { cn } from "@/lib/utils"

type BackgroundBeamsProps = {
  className?: string
}

/**
 * Aceternity-style animated background beams (CSS-only, no deps).
 * Designed to sit behind interactive UI: pointer-events are disabled.
 */
export function BackgroundBeams({ className }: BackgroundBeamsProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* Soft base glow */}
      <div className="absolute -inset-[35%] opacity-60 blur-3xl [background:radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.35),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.18),transparent_55%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.18),transparent_55%)]" />

      {/* Moving beams */}
      <div className="absolute -inset-[40%] opacity-50 [background:conic-gradient(from_180deg_at_50%_50%,rgba(16,185,129,0.0)_0deg,rgba(16,185,129,0.25)_55deg,rgba(16,185,129,0.16)_110deg,rgba(16,185,129,0.18)_170deg,rgba(16,185,129,0.0)_360deg)] blur-2xl animate-[beams_14s_linear_infinite]" />

      {/* Subtle noise overlay (very low opacity) */}
      <div className="absolute inset-0 opacity-[0.06] [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Cfilter id=%22n%22 x=%220%22 y=%220%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22300%22 height=%22300%22 filter=%22url(%23n)%22 opacity=%220.6%22/%3E%3C/svg%3E')]" />
    </div>
  )
}

