'use client'

import { useEffect, useMemo, useState } from 'react'
import type { LearningStation, LessonStep } from '@/types'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function LessonDialog(props: {
  station: LearningStation | null
  open: boolean
  completed: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (stationId: string) => void
}) {
  const station = props.station
  const steps = station?.steps ?? []

  const [stepIndex, setStepIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null)

  useEffect(() => {
    if (!props.open) return
    queueMicrotask(() => {
      setStepIndex(0)
      setSelectedIndex(null)
      setWasCorrect(null)
    })
  }, [props.open, station?.id])

  const step: LessonStep | null = steps[stepIndex] ?? null
  const isLastStep = stepIndex >= Math.max(0, steps.length - 1)

  const progressLabel = useMemo(() => {
    if (!steps.length) return ''
    return `${stepIndex + 1}/${steps.length}`
  }, [stepIndex, steps.length])

  if (!station) return null

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-[min(820px,calc(100vw-2rem))] bg-black/80 text-white border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <span className="text-white/90">{station.title}</span>
            <span className="text-white/40">•</span>
            <span className="text-xs font-mono text-white/55">{progressLabel}</span>
            <span className="ml-auto text-xs text-white/55">
              Reward:{' '}
              <span className="tabular-nums text-white/75">+{station.rewardXp} XP</span>
              {props.completed ? <span className="text-white/45"> (already received)</span> : null}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          {step?.type === 'text' && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/85 whitespace-pre-wrap">
              {step.text}
            </div>
          )}

          {step?.type === 'question' && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-white/90">{step.question}</div>
              <div className="mt-3 grid gap-2">
                {step.options.map((opt, idx) => {
                  const isChosen = selectedIndex === idx
                  const showCorrect = wasCorrect !== null
                  const isCorrect = idx === step.correctIndex
                  const tone =
                    showCorrect && isChosen
                      ? (isCorrect ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-red-500/40 bg-red-500/10')
                      : (isChosen ? 'border-primary/40 bg-primary/10' : 'border-white/10 bg-black/20 hover:bg-white/5')

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={wasCorrect === true}
                      className={[
                        'text-left rounded-xl border px-3 py-2 text-sm text-white/85 transition-colors',
                        'disabled:opacity-70 disabled:cursor-not-allowed',
                        tone,
                      ].join(' ')}
                      onClick={() => {
                        setSelectedIndex(idx)
                        setWasCorrect(null)
                      }}
                    >
                      <span className="font-mono text-white/50 mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {opt}
                    </button>
                  )
                })}
              </div>

              {wasCorrect === false && (
                <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  Not quite. Try again.
                  {step.explanation ? <div className="mt-1 text-red-100/90">{step.explanation}</div> : null}
                </div>
              )}

              {wasCorrect === true && (
                <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                  Correct.
                  {step.explanation ? <div className="mt-1 text-emerald-100/90">{step.explanation}</div> : null}
                </div>
              )}
            </div>
          )}

          {!step && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
              This lesson has no content.
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="text-xs text-white/45">
            Tip: Press <span className="font-mono text-white/70">ESC</span> to close.
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => props.onOpenChange(false)}
            >
              Close
            </Button>

            {step?.type === 'question' ? (
              <Button
                type="button"
                disabled={selectedIndex === null || wasCorrect === true}
                onClick={() => {
                  if (!step) return
                  if (selectedIndex === null) return
                  const ok = selectedIndex === step.correctIndex
                  setWasCorrect(ok)
                }}
              >
                Check
              </Button>
            ) : null}

            <Button
              type="button"
              className="bg-primary/90 hover:bg-primary text-white disabled:opacity-50"
              disabled={
                !step ||
                (step.type === 'question' && wasCorrect !== true) ||
                (step.type === 'question' && wasCorrect === true && selectedIndex === null)
              }
              onClick={() => {
                if (!step) return
                if (isLastStep) {
                  if (!props.completed) props.onComplete(station.id)
                  props.onOpenChange(false)
                  return
                }
                setStepIndex((i) => Math.min(i + 1, steps.length - 1))
                setSelectedIndex(null)
                setWasCorrect(null)
              }}
            >
              {isLastStep ? 'Finish' : 'Next'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

