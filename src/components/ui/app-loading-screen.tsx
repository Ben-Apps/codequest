import { Gamepad2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AppBackground } from "@/components/ui/app-background"

type AppLoadingScreenProps = {
  className?: string
  title?: string
  subtitle?: string
}

export function AppLoadingScreen({
  className,
  title = "Loading codequest.vibe",
  subtitle = "Preparing your adventure...",
}: AppLoadingScreenProps) {
  return (
    <div className={cn("min-h-screen", className)}>
      <AppBackground />
      <div className="min-h-screen px-4 flex items-center justify-center">
        <div className="w-full max-w-sm rounded-3xl p-7 text-center app-glass-strong app-surface-shadow">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl app-glass">
            <Gamepad2 className="size-6 text-white/90" />
          </div>

          <div className="text-lg font-semibold text-white/95">{title}</div>
          <div className="mt-1 text-sm text-white/70">{subtitle}</div>

          <div className="mt-6">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-primary/0 via-primary/80 to-emerald-300/70 animate-[indeterminate_1.25s_ease-in-out_infinite]" />
            </div>
          </div>

          <div className="mt-4 text-xs text-white/55">
            Tip: <span className="text-white/70">Get close to NPCs and press E (or Space).</span>
          </div>
        </div>
      </div>
    </div>
  )
}

