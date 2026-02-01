'use client'

import { useEffect, useMemo, useState } from 'react'
import type { LessonStep } from '@/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export type DesignStation = {
  id: string
  name: string
  emoji: string
  difficulty: 'medium' | 'hard'
  description: string
  steps: LessonStep[]
}

export const DESIGN_STATIONS: DesignStation[] = [
  {
    id: 'atelier-color-lab',
    name: 'Color Lab',
    emoji: '🎨',
    difficulty: 'medium',
    description: 'Cleanly separate contrast, hierarchy, and accents.',
    steps: [
      {
        type: 'text',
        text:
          "Brief: You're designing a fintech app. Goal is trust, clarity, and focus on the primary action. Define a 60/30/10 color system (Base/Surface, Secondary, Accent).",
      },
      {
        type: 'question',
        question: 'Which assignment makes the most sense?',
        options: [
          '60% Neon Orange, 30% Dark Blue, 10% White (accent dominates)',
          '60% Light Gray/White, 30% Dark Blue, 10% Green (accent for CTA)',
          '60% Black, 30% Red, 10% Yellow (high visual unrest)',
        ],
        correctIndex: 1,
        explanation: 'A calm base and clear accent focus the action.',
      },
      {
        type: 'question',
        question: 'Secondary text sits on white at #94a3b8. What is the best correction?',
        options: [
          'Reduce text size from 12px to 10px',
          'Darken text color to #334155 and keep size at 14-16px',
          'Just set the text to italic',
        ],
        correctIndex: 1,
        explanation: 'More contrast and readable size increase accessibility.',
      },
    ],
  },
  {
    id: 'atelier-typography-bench',
    name: 'Typography Workbench',
    emoji: '🅰️',
    difficulty: 'hard',
    description: 'Optimize information hierarchy and scannability.',
    steps: [
      {
        type: 'text',
        text:
          'Task: A dashboard should be scannable in 3 seconds. You need clear headline, secondary info, and metrics. Choose the hierarchy with the strongest rhythm.',
      },
      {
        type: 'question',
        question: 'Which typography combination creates the clearest hierarchy?',
        options: [
          'H1 22/400, H2 20/400, Body 18/400 (almost equal)',
          'H1 28/700, H2 18/600, Body 15/400 (strong contrast)',
          'H1 24/500, H2 23/500, Body 22/500 (barely any steps)',
        ],
        correctIndex: 1,
        explanation: 'Clear gradations speed up scanning.',
      },
      {
        type: 'question',
        question: 'The metric cards are tight, text looks cramped. What do you do first?',
        options: [
          'Increase padding and slightly raise line height',
          'Set everything in uppercase',
          'Add more icons',
        ],
        correctIndex: 0,
        explanation: 'Spacing and line height improve readability immediately.',
      },
    ],
  },
  {
    id: 'atelier-flow-board',
    name: 'Flow Board',
    emoji: '🧭',
    difficulty: 'hard',
    description: 'Keep user flow clean and reduce friction.',
    steps: [
      {
        type: 'text',
        text:
          'Scenario: Onboarding with 4 steps. Drop-off rate increases at step 3. Users report "unexpected" form errors.',
      },
      {
        type: 'question',
        question: 'Which fix has the highest impact?',
        options: [
          'Show errors as global banner at page header',
          'Inline validation per field with concrete hints',
          'Show errors only after submit, make them blink red',
        ],
        correctIndex: 1,
        explanation: 'Inline feedback reduces friction and increases trust.',
      },
      {
        type: 'question',
        question: 'Which prioritization makes sense for step 3?',
        options: [
          'Additional options first, required fields later',
          'Required fields first, optional details collapsible',
          'Everything in one mega-form without structure',
        ],
        correctIndex: 1,
        explanation: 'Required first, optional later saves time.',
      },
    ],
  },
  {
    id: 'atelier-usability-lab',
    name: 'Usability Lab',
    emoji: '🧪',
    difficulty: 'medium',
    description: 'Make errors, affordance, and feedback clear.',
    steps: [
      {
        type: 'text',
        text:
          'A CTA "Continue" is gray, the card looks disabled. Users don\'t click. You want to strengthen affordance without being louder.',
      },
      {
        type: 'question',
        question: 'What is the best first step?',
        options: [
          'Mark CTA as accent color and reduce border',
          'Make button smaller so it doesn\'t distract',
          'Remove CTA completely and only use text link',
        ],
        correctIndex: 0,
        explanation: 'A clear accent shows interactivity.',
      },
      {
        type: 'question',
        question: 'After clicking, feedback is missing. What is most appropriate?',
        options: [
          'No feedback, it saves time',
          'Loading state on button and status text in card',
          'Just a toast bottom right',
        ],
        correctIndex: 1,
        explanation: 'Local feedback on CTA is most direct.',
      },
    ],
  },
]

interface DesignAtelierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialStationId?: string | null
}

export function DesignAtelierDialog({ open, onOpenChange, initialStationId = null }: DesignAtelierDialogProps) {
  const [activeStationId, setActiveStationId] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null)

  const activeStation = useMemo(
    () => (activeStationId ? DESIGN_STATIONS.find((s) => s.id === activeStationId) ?? null : null),
    [activeStationId]
  )

  const step = activeStation?.steps[stepIndex] ?? null
  const isLastStep = !!activeStation && stepIndex >= activeStation.steps.length - 1

  useEffect(() => {
    if (!open) return
    queueMicrotask(() => {
      setActiveStationId(initialStationId)
      setStepIndex(0)
      setSelectedIndex(null)
      setWasCorrect(null)
    })
  }, [initialStationId, open])

  useEffect(() => {
    if (!activeStationId) return
    queueMicrotask(() => {
      setStepIndex(0)
      setSelectedIndex(null)
      setWasCorrect(null)
    })
  }, [activeStationId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)]! max-w-none! bg-[#0a0f1c]/90 text-white border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <span aria-hidden="true">🏛️</span>
            <span>Design Atelier</span>
            <span className="text-white/50">•</span>
            <span className="text-pink-300">Interactive Objects</span>
          </DialogTitle>
          <DialogDescription className="text-white/65">
            Select an object, solve the tasks, and unlock new design insights.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white/90 mb-3">Objects in Atelier</div>
            <div className="grid gap-2">
              {DESIGN_STATIONS.map((station) => {
                const active = station.id === activeStationId
                return (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => setActiveStationId(station.id)}
                    className={[
                      'w-full text-left rounded-2xl border p-3 transition-all',
                      active
                        ? 'border-pink-400/60 bg-pink-400/10 shadow-[0_0_0_1px_rgba(236,72,153,0.4)]'
                        : 'border-white/10 bg-white/5 hover:bg-white/10',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{station.emoji}</div>
                      <div className="min-w-0">
                        <div className="font-medium text-white/90 truncate">{station.name}</div>
                        <div className="text-xs text-white/50">{station.difficulty.toUpperCase()} · {station.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent p-4">
            {!activeStation ? (
              <div className="h-full min-h-[220px] grid place-items-center text-center text-white/50">
                <div>
                  <div className="text-4xl mb-2">🧩</div>
                  <div className="text-sm">Select an object on the left to start the challenge.</div>
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-2xl">{activeStation.emoji}</div>
                  <div className="font-semibold text-white/90">{activeStation.name}</div>
                  <span className="text-xs text-white/45">•</span>
                  <span className="text-xs text-pink-300">{activeStation.difficulty.toUpperCase()}</span>
                  <span className="ml-auto text-xs text-white/45">
                    Step {stepIndex + 1}/{activeStation.steps.length}
                  </span>
                </div>

                {step?.type === 'text' && (
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-white/85 whitespace-pre-wrap">
                    {step.text}
                  </div>
                )}

                {step?.type === 'question' && (
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="text-sm font-semibold text-white/90">{step.question}</div>
                    <div className="mt-3 grid gap-2">
                      {step.options.map((opt, idx) => {
                        const isChosen = selectedIndex === idx
                        const showCorrect = wasCorrect !== null
                        const isCorrect = idx === step.correctIndex
                        const tone =
                          showCorrect && isChosen
                            ? (isCorrect ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-red-500/40 bg-red-500/10')
                            : (isChosen ? 'border-pink-400/50 bg-pink-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10')

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
                        Not quite.
                        {step.explanation ? <div className="mt-1 text-red-100/90">{step.explanation}</div> : null}
                      </div>
                    )}

                    {wasCorrect === true && (
                      <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                        Correct!
                        {step.explanation ? <div className="mt-1 text-emerald-100/90">{step.explanation}</div> : null}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="text-xs text-white/45">Tip: Discover additional objects outside at the atelier.</div>
          <div className="flex items-center justify-end gap-2">
            {activeStation ? (
              <Button
                type="button"
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => setActiveStationId(null)}
              >
                Back
              </Button>
            ) : null}

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

            {activeStation ? (
              <Button
                type="button"
                className="bg-pink-500/90 hover:bg-pink-500 text-white disabled:opacity-50"
                disabled={!step || (step.type === 'question' && wasCorrect !== true)}
                onClick={() => {
                  if (!step || !activeStation) return
                  if (isLastStep) {
                    setActiveStationId(null)
                    return
                  }
                  setStepIndex((i) => Math.min(i + 1, activeStation.steps.length - 1))
                  setSelectedIndex(null)
                  setWasCorrect(null)
                }}
              >
                {isLastStep ? 'Done' : 'Next'}
              </Button>
            ) : null}

            <Button
              type="button"
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
