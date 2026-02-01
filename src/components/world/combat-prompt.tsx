'use client'

interface CombatPromptProps {
  visible: boolean
  mobName?: string
}

export function CombatPrompt({ visible, mobName }: CombatPromptProps) {
  if (!visible) return null

  return (
    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 animate-[floaty_2.6s_ease-in-out_infinite]">
      <div className="relative rounded-2xl border border-white/10 bg-black/35 px-4 py-2 backdrop-blur-xl shadow-[0_0_0_1px_rgba(239,68,68,0.18),0_18px_60px_-32px_rgba(0,0,0,0.9)]">
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-linear-to-r from-red-500/20 via-transparent to-amber-500/10 blur-xl" />
        <div className="flex items-center gap-2">
          <kbd className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-xs font-semibold text-white/90">
            F
          </kbd>
          <span className="text-sm text-white/90">
            {mobName ? ` ${mobName} angreifen` : 'Angreifen'}
          </span>
        </div>
      </div>
    </div>
  )
}

