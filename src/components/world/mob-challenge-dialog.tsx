'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Mob } from '@/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getCodeReview } from '@/app/actions/code-review'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

type TestResult = {
  input: string
  expected: string
  actual?: string
  passed: boolean
  error?: string
}

const normalizeOutput = (s: string) => s.replace(/\r\n/g, '\n').trimEnd()

async function runSolveInWorker(args: {
  code: string
  input: string
  timeoutMs?: number
}): Promise<{ ok: true; output: string } | { ok: false; error: string }> {
  const timeoutMs = args.timeoutMs ?? 500

  const workerSource = `
self.onmessage = async (e) => {
  const { code, input } = e.data || {};
  try {
    const getSolve = new Function(
      '"use strict";\\n' +
      String(code || '') + '\\n' +
      'if (typeof solve !== "function") { throw new Error("Please define function solve(input) { ... }"); }\\n' +
      'return solve;'
    );
    const solveFn = getSolve();
    const result = await solveFn(String(input ?? ''));
    self.postMessage({ ok: true, output: String(result ?? '') });
  } catch (err) {
    const msg = (err && err.message) ? err.message : String(err);
    self.postMessage({ ok: false, error: msg });
  }
};
`

  const blob = new Blob([workerSource], { type: 'text/javascript' })
  const worker = new Worker(URL.createObjectURL(blob))

  return await new Promise((resolve) => {
    const timer = setTimeout(() => {
      worker.terminate()
      resolve({ ok: false, error: `Timeout after ${timeoutMs}ms (infinite loop?)` })
    }, timeoutMs)

    worker.onmessage = (ev) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(ev.data)
    }

    worker.onerror = () => {
      clearTimeout(timer)
      worker.terminate()
      resolve({ ok: false, error: 'Worker error while executing code' })
    }

    worker.postMessage({ code: args.code, input: args.input })
  })
}

export function MobChallengeDialog(props: {
  mob: Mob | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDefeated: (mobId: string, rewardXp: number) => void
}) {
  const mob = props.mob
  const challenge = mob?.challenge ?? null

  const storageKey = useMemo(() => {
    if (!challenge) return null
    return `agentmind_challenge_code_${challenge.id}`
  }, [challenge])

  const [code, setCode] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[] | null>(null)
  const [aiFeedback, setAiFeedback] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lineCount = useMemo(() => Math.max(1, code.split('\n').length), [code])
  const lineNumbers = useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => String(i + 1)).join('\n')
  }, [lineCount])

  useEffect(() => {
    if (!props.open || !challenge) return
    setResults(null)
    setAiFeedback(null)
    setError(null)

    if (typeof window === 'undefined') return
    const saved = storageKey ? localStorage.getItem(storageKey) : null
    setCode(saved && saved.trim() ? saved : challenge.starterCode)
  }, [props.open, challenge, storageKey])

  useEffect(() => {
    if (!storageKey) return
    if (typeof window === 'undefined') return
    localStorage.setItem(storageKey, code)
  }, [code, storageKey])

  const allPassed = !!results?.length && results.every(r => r.passed)
  const passedCount = results?.filter(r => r.passed).length ?? 0
  const totalCount = results?.length ?? 0

  const testSummaryForAI = useMemo(() => {
    if (!results) return 'No tests run yet.'
    return results
      .map((r, i) => {
        if (r.passed) return `#${i + 1}: PASS`
        return `#${i + 1}: FAIL (expected="${r.expected}", actual="${r.actual ?? ''}", error="${r.error ?? ''}")`
      })
      .join('\n')
  }, [results])

  async function runTests() {
    if (!challenge) return
    setIsRunning(true)
    setError(null)
    setAiFeedback(null)

    try {
      const next: TestResult[] = []
      for (const tc of challenge.tests) {
        const exec = await runSolveInWorker({ code, input: tc.input, timeoutMs: 650 })
        if (!exec.ok) {
          next.push({
            input: tc.input,
            expected: tc.expected,
            passed: false,
            error: exec.error,
          })
          continue
        }

        const actual = normalizeOutput(exec.output)
        const expected = normalizeOutput(tc.expected)
        next.push({
          input: tc.input,
          expected: tc.expected,
          actual: exec.output,
          passed: actual === expected,
        })
      }
      setResults(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Tests failed')
    } finally {
      setIsRunning(false)
    }
  }

  async function loadAiFeedback() {
    if (!challenge) return
    setAiLoading(true)
    setAiFeedback(null)

    try {
      if (!results) {
        setAiFeedback('Please run the tests first so I can give specific feedback.')
        return
      }
      const res = await getCodeReview({
        challengeTitle: challenge.title,
        challengeDescription: challenge.description,
        code,
        testSummary: testSummaryForAI,
      })
      if (!res.success) {
        setAiFeedback(res.error ?? 'AI feedback failed')
      } else {
        setAiFeedback(res.feedback ?? 'No feedback received.')
      }
    } finally {
      setAiLoading(false)
    }
  }

  if (!challenge || !mob) return null

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="!w-[calc(100vw-2rem)] !max-w-none h-[min(900px,calc(100dvh-2rem))] max-h-none overflow-hidden bg-black/80 text-white border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span aria-hidden="true">{mob.emoji}</span>
            <span>{mob.name}</span>
            {/* Level Badge */}
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold ${mob.level <= 3 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  mob.level <= 6 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
            >
              {mob.difficulty?.toUpperCase() ?? (mob.level <= 3 ? 'EASY' : mob.level <= 6 ? 'MEDIUM' : 'HARD')}
            </span>
            {/* Theme Badge */}
            {mob.theme && (
              <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary border border-primary/30">
                {mob.theme.toUpperCase()}
              </span>
            )}
            <span className="text-white/50">•</span>
            <span className="text-white/80">{challenge.title}</span>
          </DialogTitle>
          <DialogDescription asChild className="text-white/70">
            <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-code:text-white/90 prose-strong:text-white">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {challenge.description}
              </ReactMarkdown>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:items-start overflow-hidden">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-white/70">Editor</div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => {
                    setCode(challenge.starterCode)
                    setResults(null)
                    setAiFeedback(null)
                    setError(null)
                  }}
                >
                  Reset
                </Button>
                <div className="text-[11px] text-white/45">
                  <span className="font-mono text-white/70">Cmd/Ctrl</span>+<span className="font-mono text-white/70">Enter</span> = Tests
                </div>
              </div>
            </div>

            <div className="mt-2 relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-11 border-r border-white/10 bg-white/3"
              >
                <pre className="h-full overflow-hidden px-2 py-2 text-right font-mono text-[11px] leading-5 text-white/35">
                  {lineNumbers}
                </pre>
              </div>

              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    void runTests()
                  }
                }}
                className="min-h-[320px] max-h-[440px] resize-none overflow-auto font-mono text-xs leading-5 bg-transparent border-0 text-white/90 pl-14 pr-3 py-2 focus-visible:ring-0 focus-visible:border-transparent"
                spellCheck={false}
              />
            </div>

            <div className="mt-2 text-[11px] text-white/50">
              Expected: <span className="font-mono text-white/75">function solve(input)</span> → <span className="font-mono text-white/75">string</span>.
            </div>
          </div>

          <div className="grid gap-2 overflow-auto pr-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white/85">Tests</div>
              <div className="text-xs text-white/55">
                Reward:{' '}
                <span className="tabular-nums text-white/70">+{challenge.rewardXp ?? 10} XP</span>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}

            {allPassed && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                All tests passed. You can now defeat the mob.
              </div>
            )}

            {results ? (
              <div className="rounded-xl border border-white/10 bg-white/5 divide-y divide-white/10">
                {results.map((r, i) => (
                  <div key={i} className="px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm">
                        <span className={r.passed ? 'text-emerald-200' : 'text-red-200'}>
                          {r.passed ? 'PASS' : 'FAIL'}
                        </span>
                        <span className="text-white/50"> • </span>
                        <span className="text-white/70">Test #{i + 1}</span>
                      </div>
                      <div className="text-xs text-white/55 truncate max-w-[55%]">
                        input: <span className="font-mono text-white/70">{JSON.stringify(r.input)}</span>
                      </div>
                    </div>
                    {!r.passed ? (
                      <details className="mt-1">
                        <summary className="cursor-pointer select-none text-xs text-white/65 hover:text-white/80">
                          Show details
                        </summary>
                        <div className="mt-1 text-xs text-white/60 whitespace-pre-wrap">
                          expected: <span className="font-mono text-white/75">{JSON.stringify(r.expected)}</span>
                          {'\n'}
                          actual: <span className="font-mono text-white/75">{JSON.stringify(r.actual ?? '')}</span>
                          {r.error ? `\nerror: ${r.error}` : null}
                        </div>
                      </details>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60">
                No tests run yet.
              </div>
            )}

            {aiFeedback && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 whitespace-pre-wrap">
                <div className="text-xs font-semibold text-white/60">AI‑Feedback</div>
                <div className="mt-1">{aiFeedback}</div>
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-white/3 px-3 py-2 text-xs text-white/55">
              Status: <span className="tabular-nums text-white/70">{passedCount}/{totalCount || challenge.tests.length}</span> passed
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="text-xs text-white/50">Tip: Click/tap on the mob to open the challenge directly.</div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
              disabled={aiLoading}
              title={results ? 'AI feedback based on your tests' : 'Run the tests first'}
              onClick={loadAiFeedback}
            >
              {aiLoading ? 'AI checking…' : 'AI Feedback'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isRunning}
              onClick={runTests}
            >
              {isRunning ? 'Running…' : 'Run Tests'}
            </Button>
            <Button
              type="button"
              className="bg-emerald-500/90 hover:bg-emerald-500 text-white disabled:opacity-50"
              disabled={!allPassed}
              onClick={() => {
                props.onDefeated(mob.id, challenge.rewardXp ?? 10)
                props.onOpenChange(false)
              }}
            >
              Defeat Mob
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

