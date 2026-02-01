'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Compass, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PresetGrid } from '@/components/character-creation/preset-grid'
import { CustomForm } from '@/components/character-creation/custom-form'
import { GeneratingOverlay } from '@/components/generating-overlay'
import { AppBackground } from '@/components/ui/app-background'
import { generateCharacterAndSpriteAction } from '@/app/actions/generate'
import type { CharacterPreset } from '@/types'

type OnboardingFlowProps = {
  /**
   * Optional header back link (e.g. from /create).
   */
  backHref?: string
  backLabel?: string
  /**
   * Optional compact title in header.
   */
  title?: string
}

type CharacterStatsV1 = {
  version: 1
  level: number
  xp: number
}

const createInitialStats = (): CharacterStatsV1 => {
  return {
    version: 1,
    level: 1,
    xp: 0,
  }
}

export function OnboardingFlow({
  backHref = '/',
  backLabel = 'Back',
  title = 'Create Character',
}: OnboardingFlowProps) {
  const router = useRouter()

  const [agentName, setAgentName] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<CharacterPreset | null>(null)

  const [isGenerating, setIsGenerating] = useState(false)
  const [phase, setPhase] = useState<'character' | 'sprite'>('character')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const trimmedAgentName = agentName.trim()

  const storeAndEnterWorld = (characterName: string, agent: string, spriteSheet?: string) => {
    if (spriteSheet) {
      sessionStorage.setItem('agentmind_sprite', spriteSheet)
    } else {
      sessionStorage.removeItem('agentmind_sprite')
    }
    sessionStorage.setItem('agentmind_character_name', characterName.slice(0, 30))
    sessionStorage.setItem('agentmind_agent_name', agent.trim().slice(0, 30))
    sessionStorage.setItem(
      'agentmind_character_stats_v1',
      JSON.stringify(createInitialStats())
    )
    router.push('/world')
  }

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true)
    setError(null)
    setPhase('character')
    setProgress(10)

    let progressInterval: number | null = null
    try {
      progressInterval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev < 40) return prev + 5
          if (prev < 80) {
            setPhase('sprite')
            return prev + 3
          }
          return prev
        })
      }, 1500)

      const result = await generateCharacterAndSpriteAction(prompt)

      if (!result.success || !result.spriteSheet) {
        throw new Error(result.error || 'Generation failed')
      }

      setProgress(100)
      storeAndEnterWorld(prompt, trimmedAgentName || 'Character', result.spriteSheet)
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Generation failed')
      setIsGenerating(false)
    } finally {
      if (progressInterval) window.clearInterval(progressInterval)
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <AppBackground variant="hero" />

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between rounded-2xl px-2 py-2 app-glass app-surface-shadow">
            <Button variant="ghost" asChild className="text-white/90 hover:text-white hover:bg-white/10">
              <Link href={backHref}>
                <ArrowLeft className="size-4" />
                {backLabel}
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <Compass className="size-5 text-primary" />
              <div className="text-sm sm:text-base font-semibold text-white/95">{title}</div>
            </div>

            <div className="w-20" />
          </div>
        </header>

        {/* One-page flow */}
        <div className="grid gap-4">
          {/* Content */}
          <section className="rounded-3xl border border-white/10 bg-black/25 backdrop-blur-xl p-6 sm:p-8 app-surface-shadow">
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white/95">Your Adventure Begins</h1>
                <p className="mt-2 text-white/70 max-w-2xl">
                  Create your character and jump into the adventure. You can generate a sprite or
                  start right away — both are heroic choices.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    className="rounded-2xl"
                    onClick={() => {
                      const agent = trimmedAgentName || 'Character'
                      const character = selectedPreset?.name || agent
                      storeAndEnterWorld(character, agent)
                    }}
                    disabled={isGenerating}
                  >
                    Enter World
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-2xl app-glass text-white/90 hover:bg-white/10"
                  >
                    <Link href="/world">Quick Demo</Link>
                  </Button>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/90">Agent Name (optional)</label>
                <Input
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Nova, Atlas, Pixel..."
                  maxLength={30}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:border-emerald-400/60 focus-visible:ring-emerald-400/20"
                />
                <p className="text-xs text-white/55">If empty, we'll use a default.</p>
              </div>

              {/* Character */}
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-white/90">Optional: Generate Sprite & Stats</div>
                  <div className="mt-1 text-xs text-white/60">
                    You can also start without generation — we have backup pixels ready.
                  </div>
                </div>

                <Tabs defaultValue="presets" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/15">
                    <TabsTrigger
                      value="presets"
                      disabled={isGenerating}
                      className="border border-white/10 text-white/70 data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:border-white/30"
                    >
                      <span className="mr-2">🎭</span>
                      Presets
                    </TabsTrigger>
                    <TabsTrigger
                      value="custom"
                      disabled={isGenerating}
                      className="border border-white/10 text-white/70 data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:border-white/30"
                    >
                      <span className="mr-2">✏️</span>
                      Custom
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="presets" className="mt-6">
                    <div className="space-y-4">
                      <PresetGrid
                        onSelect={(preset) => setSelectedPreset(preset)}
                        selectedId={selectedPreset?.id}
                        disabled={isGenerating}
                      />
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          size="lg"
                          className="rounded-2xl"
                          disabled={!selectedPreset || isGenerating}
                          onClick={() => selectedPreset && handleGenerate(selectedPreset.prompt)}
                        >
                          <Sparkles className="size-5" />
                          Generate & Start
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-2xl app-glass text-white/90 hover:bg-white/10"
                          onClick={() => setSelectedPreset(null)}
                          disabled={!selectedPreset || isGenerating}
                        >
                          Reset Selection
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="custom" className="mt-6">
                    <div className="rounded-2xl border border-white/15 bg-black/30 p-5">
                      <CustomForm
                        disabled={isGenerating}
                        onSubmit={(description) => handleGenerate(description)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {error && (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-white/85">
                    <div className="font-semibold text-destructive">Error</div>
                    <div className="mt-1 text-white/75">{error}</div>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="app-glass text-white/90 hover:bg-white/10"
                        onClick={() => setError(null)}
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
                  Tip: Get close to NPCs, press <span className="text-white/90 font-semibold">E</span> and ask them
                  anything — they don't bite.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <GeneratingOverlay isOpen={isGenerating} phase={phase} progress={progress} />
    </main>
  )
}

