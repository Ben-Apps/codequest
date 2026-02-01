'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  claimDailyReward,
  canClaimDailyReward,
  formatLocalISODate,
  getDailyQuestSet,
  normalizeQuestmasterSave,
  toggleQuestCompletion,
  type QuestmasterSave,
} from '@/lib/questmaster'

const STORAGE_KEY = 'agentmind_questmaster_save_v1'

function safeReadLocalStorage(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function safeWriteLocalStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function QuestmasterPanel({ className }: { className?: string }) {
  const today = useMemo(() => formatLocalISODate(new Date()), [])
  const daily = useMemo(() => getDailyQuestSet(today), [today])

  const [save, setSave] = useState<QuestmasterSave | null>(null)

  useEffect(() => {
    const raw = safeReadLocalStorage(STORAGE_KEY)
    const normalized = normalizeQuestmasterSave(today, raw)
    queueMicrotask(() => setSave(normalized))
    safeWriteLocalStorage(STORAGE_KEY, normalized)
  }, [today])

  const completed = useMemo(() => new Set(save?.completedBaseIds ?? []), [save?.completedBaseIds])
  const completedCount = daily.quests.filter((q) => completed.has(q.baseId)).length
  const progress = daily.quests.length ? Math.round((completedCount / daily.quests.length) * 100) : 0

  if (!save) {
    return (
      <div className={cn('p-4 text-sm text-muted-foreground font-mono', className)}>
        Loading Quests…
      </div>
    )
  }

  const alreadyClaimed = save.lastClaimedDate === daily.date
  const claimable = canClaimDailyReward(save, daily)

  return (
    <div className={cn('p-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-xs text-gray-400">
          <span className="text-gray-200 font-semibold">Daily Quests</span>
          <span className="ml-2 opacity-80">{daily.date}</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-gray-200">
            Streak: <span className="text-primary font-semibold">{save.streak}</span>
          </span>
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-gray-200">
            XP: <span className="text-primary font-semibold">{save.totalXP}</span>
          </span>
        </div>
      </div>

      <div className="mt-3">
        <Progress value={progress} />
        <div className="mt-1 flex justify-between text-xs font-mono text-gray-400">
          <span>
            Progress: <span className="text-gray-200">{completedCount}/{daily.quests.length}</span>
          </span>
          <span>{progress}%</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {daily.quests.map((q) => {
          const done = completed.has(q.baseId)
          return (
            <label
              key={q.id}
              className={cn(
                'flex gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2 cursor-pointer select-none',
                done && 'border-primary/40 bg-primary/10'
              )}
            >
              <input
                type="checkbox"
                checked={done}
                onChange={() => {
                  const next = toggleQuestCompletion(save, q.baseId)
                  setSave(next)
                  safeWriteLocalStorage(STORAGE_KEY, next)
                }}
                className="mt-1"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <div className={cn('font-mono text-sm text-gray-200', done && 'line-through opacity-80')}>
                    {q.title}
                  </div>
                  <div className="shrink-0 font-mono text-xs text-gray-400">
                    +{q.xp} XP
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-300/90">
                  {q.description}
                </div>
                {q.link && (
                  <a
                    href={q.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs font-mono text-primary underline underline-offset-2 hover:opacity-90"
                  >
                    {q.link.label}
                  </a>
                )}
              </div>
            </label>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="text-xs font-mono text-gray-400">
          {alreadyClaimed ? 'Reward already claimed.' : 'Complete all quests to claim XP.'}
        </div>
        <Button
          size="sm"
          disabled={!claimable}
          onClick={() => {
            const next = claimDailyReward(save, daily)
            setSave(next)
            safeWriteLocalStorage(STORAGE_KEY, next)
          }}
        >
          Claim Reward
        </Button>
      </div>
    </div>
  )
}

