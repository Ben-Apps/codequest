'use client'

import { useMemo, useState } from 'react'
import type { ChallengeTheme } from '@/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const MOB_APPEARANCES: { emoji: string; baseName: string }[] = [
  { emoji: '🟢', baseName: 'Slime' },
  { emoji: '🦇', baseName: 'Bat' },
  { emoji: '🕷️', baseName: 'Spider' },
  { emoji: '🐺', baseName: 'Wolf' },
  { emoji: '🗿', baseName: 'Golem' },
  { emoji: '👻', baseName: 'Ghost' },
  { emoji: '🐉', baseName: 'Dragon' },
  { emoji: '🔥', baseName: 'Phoenix' },
  { emoji: '🦑', baseName: 'Kraken' },
  { emoji: '🐍', baseName: 'Serpent' },
]

export function CodeFarmDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSpawn: (level: number, theme: ChallengeTheme | 'random', count: number) => void
  onClearSpawned: () => void
  spawnedCount: number
}) {
  const [level, setLevel] = useState(3)
  const [count, setCount] = useState(1)

  const difficultyLabel = useMemo(() => {
    if (level <= 3) return { text: 'EASY', color: 'text-emerald-400', bg: 'bg-emerald-500/20' }
    if (level <= 6) return { text: 'MEDIUM', color: 'text-amber-400', bg: 'bg-amber-500/20' }
    return { text: 'HARD', color: 'text-red-400', bg: 'bg-red-500/20' }
  }, [level])

  const previewMob = useMemo(() => {
    const appearance = MOB_APPEARANCES[Math.min(level - 1, MOB_APPEARANCES.length - 1)]
    return {
      emoji: appearance.emoji,
      name: `${appearance.baseName} Lv.${level}`,
    }
  }, [level])

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-[min(1280px,calc(100vw-2rem))] bg-black/85 text-white border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span aria-hidden="true">🌾</span>
            <span>Code Farm</span>
            <span className="text-white/50">•</span>
            <span className="text-white/80">Monster Generator</span>
          </DialogTitle>
          <DialogDescription className="text-white/65">
            Select a level and theme to spawn random monsters with coding challenges.
            Higher levels = harder challenges = more XP!
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Level Selection */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white/90">Monster Level</div>
            <div className="mt-3 space-y-3">
              <div className="space-y-1.5">
                <div className="text-xs text-white/60">Level (1–10)</div>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={level}
                  onChange={(e) => setLevel(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                  className="bg-white/5 border-white/10 text-white text-lg font-bold text-center"
                />
              </div>

              {/* Level Slider */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-white/50">
                  <span>Easy</span>
                  <span>Medium</span>
                  <span>Hard</span>
                </div>
              </div>

              {/* Difficulty Badge */}
              <div className={`rounded-xl px-3 py-2 text-center font-bold ${difficultyLabel.bg} ${difficultyLabel.color}`}>
                {difficultyLabel.text}
              </div>
            </div>
          </div>

          {/* Spawn Controls */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-white/90">Farm Status</div>
              <div className="text-xs text-white/55 tabular-nums">{props.spawnedCount} spawned</div>
            </div>

            <div className="mt-3 space-y-3">
              <div className="space-y-1.5">
                <div className="text-xs text-white/60">Count (1–5)</div>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80">
                <div className="text-xs font-semibold text-white/60">Preview</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">{previewMob.emoji}</span>
                  <div>
                    <div className="text-white/90 font-medium">{previewMob.name}</div>
                    <div className="text-xs text-white/60">Random Theme</div>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                className="w-full rounded-xl"
                onClick={() => props.onSpawn(level, 'random', count)}
              >
                🎮 Spawn {count} Monster{count > 1 ? 's' : ''}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl app-glass text-white/90 hover:bg-white/10 border-white/15"
                onClick={props.onClearSpawned}
                disabled={props.spawnedCount === 0}
              >
                Clear Farm Mobs
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-white/50">
              Tip: Each monster gets a randomly generated challenge!
            </div>
            <Button
              type="button"
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => props.onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
