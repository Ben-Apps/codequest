import type { LearningStation, WorldArea } from '@/types'

interface WorldOverlaysProps {
  area: WorldArea
  isFarmer: boolean
  learningStations: LearningStation[]
  completedLessonStationIds: string[]
  onStationClick: (id: string) => void
}

export function WorldOverlays({
  area,
  isFarmer,
  learningStations,
  completedLessonStationIds,
  onStationClick,
}: WorldOverlaysProps) {
  return (
    <>
      {area === 'outside' && isFarmer && (
        <div className="absolute top-24 right-4 z-40">
          <div className="rounded-full border border-white/10 bg-black/35 backdrop-blur-xl px-3 py-2 text-xs text-white/80 shadow-[0_18px_60px_-32px_rgba(0,0,0,0.9)]">
            <span className="mr-2" aria-hidden="true">
              🌾
            </span>
            Role: <span className="text-white/90 font-semibold">Farmer</span>
          </div>
        </div>
      )}

      {/* AI University: 3 Techs / Lektionen (mit !) */}
      {area === 'ai_university' && (
        <div className="absolute top-24 left-4 z-40 w-[min(360px,calc(100vw-2rem))]">
          <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl px-3 py-3 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)]">
            <div className="text-xs font-semibold text-white/80">
              AI University • Lessons
            </div>
            <div className="mt-2 grid gap-2">
              {learningStations.map((s, idx) => {
                const completed = completedLessonStationIds.includes(s.id)
                const icon = idx === 0 ? '💻' : idx === 1 ? '🧠' : '⚙️'
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={[
                      'flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors',
                      completed ? 'border-white/10 bg-white/5 text-white/70' : 'border-primary/20 bg-primary/10 text-white/85 hover:bg-primary/15',
                    ].join(' ')}
                    onClick={() => onStationClick(s.id)}
                  >
                    <span className="text-base" aria-hidden="true">
                      {icon}
                    </span>
                    <span className="flex-1 truncate">{s.title}</span>
                    <span
                      className={[
                        'ml-auto inline-flex items-center justify-center size-6 rounded-full border text-xs font-bold',
                        completed ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/15 text-amber-200',
                      ].join(' ')}
                      aria-label={completed ? 'Completed' : 'New'}
                      title={completed ? 'Completed' : 'New'}
                    >
                      {completed ? '✓' : '!'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
