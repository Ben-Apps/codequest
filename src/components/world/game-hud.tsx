'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Gamepad2, Info, Plus, ScrollText, Trash2, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { AgentNPC, WorldArea } from '@/types'
import type { CharacterStatsV1 } from '@/lib/xp'
import { xpRequiredForLevel } from '@/lib/xp'
import { QuestmasterPanel } from '@/components/questmaster-panel'

const AGENT_ABILITY_BY_ID: Record<string, string> = {
  'news-agent': 'Brings you current Tech, Gaming & AI news (short & informative).',
  questmaster: 'Gives you daily quests and concrete Next Steps for AI/ML.',
  'helper-agent': 'Explains the world and helps with questions.',
  'creative-agent': 'Gives creative tips for characters & pixel art.',
}

const AREA_LABEL: Record<WorldArea, string> = {
  outside: 'Outside',
  ai_university: 'AI University',
  ai_labor: 'AI Lab',
  design_atelier: 'Design Atelier',
}

const AREA_HINT: Partial<Record<WorldArea, string>> = {
  ai_university: 'Hint: Entrance outside bottom left.',
  ai_labor: 'Hint: Entrance outside east of the crossroads.',
  design_atelier: 'Hint: Entrance in the north-east outside.',
}

const DAILY_QUEST = {
  id: 'moltbot',
  title: 'Your daily quest',
  text: 'Discover the latest AI agent frameworks - talk to Moltbot!',
  details: [
    'Ask Moltbot about trending agent frameworks.',
    'Learn about one new framework or tool.',
    'Return to the Questmaster for the next quest.',
  ],
}

interface GameHUDProps {
  characterName: string
  characterStats: CharacterStatsV1
  allAgents: AgentNPC[]
  customAgents: AgentNPC[]
  currentArea: WorldArea
  onAddCustomAgent: (agent: AgentNPC) => void
  onDeleteCustomAgent: (agentId: string) => void
}

export function GameHUD({
  characterName,
  characterStats,
  allAgents,
  customAgents,
  currentArea,
  onAddCustomAgent,
  onDeleteCustomAgent,
}: GameHUDProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [isAgentManagerOpen, setIsAgentManagerOpen] = useState(false)
  const [isQuestOpen, setIsQuestOpen] = useState(false)
  const [isQuestmasterOpen, setIsQuestmasterOpen] = useState(false)
  const [spriteUrl] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem('agentmind_sprite')
  })
  const xpRequired = useMemo(() => xpRequiredForLevel(characterStats.level), [characterStats.level])
  const xpPercent = useMemo(() => {
    if (xpRequired <= 0) return 0
    return Math.max(0, Math.min(1, characterStats.xp / xpRequired))
  }, [characterStats.xp, xpRequired])

  const makeAgentId = () => {
    const maybeCrypto = globalThis.crypto as (Crypto & { randomUUID?: () => string }) | undefined
    return `custom-${maybeCrypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`
  }

  const [draft, setDraft] = useState<{
    name: string
    avatar: string
    role: string
    greeting: string
    systemInstruction: string
    spawnArea: WorldArea
    gender: 'male' | 'female'
  }>(() => ({
    name: '',
    avatar: '🤖',
    role: 'Custom Agent',
    greeting: 'Hey! How can I help you?',
    systemInstruction:
      'You are a helpful NPC agent in a pixel art RPG world.\nAnswer briefly, concretely, and friendly.\nImportant: Write in English.',
    spawnArea: 'outside',
    gender: 'female',
  }))

  const agentsInWorld = useMemo(() => {
    const byId = new Map<string, AgentNPC>()
    for (const a of allAgents ?? []) byId.set(a.id, a)

    const areaOrder: Record<WorldArea, number> = {
      outside: 0,
      ai_university: 1,
      ai_labor: 2,
      design_atelier: 3,
    }

    return [...byId.values()]
      .map((a) => {
        const spawnArea = a.spawnArea ?? 'outside'
        return {
          id: a.id,
          name: a.name,
          avatar: a.avatar,
          role: a.role,
          spawnArea,
          locationLabel: AREA_LABEL[spawnArea],
          locationHint: AREA_HINT[spawnArea],
          isHere: spawnArea === currentArea,
          ability: AGENT_ABILITY_BY_ID[a.id] ?? a.role,
          speaks: true,
          isCustom: a.id.startsWith('custom-'),
        }
      })
      .sort((a, b) => {
        const ao = areaOrder[a.spawnArea] - areaOrder[b.spawnArea]
        if (ao !== 0) return ao
        return a.name.localeCompare(b.name, 'en')
      })
  }, [allAgents, currentArea])

  return (
    <>
      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 z-40 px-4 pt-4">
        <div className="mx-auto max-w-5xl">
          <div className="relative flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-2 py-2 backdrop-blur-xl shadow-[0_0_0_1px_rgba(16,185,129,0.14),0_30px_80px_-40px_rgba(0,0,0,0.85)]">
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-linear-to-r from-primary/20 via-transparent to-emerald-500/10 blur-xl" />

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white/90 hover:text-white hover:bg-white/10"
            >
              <Link href="/">
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
            </Button>

            <button
              type="button"
              className="hidden md:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 max-w-[360px] text-left transition-colors hover:bg-white/10"
              onClick={() => setIsQuestOpen(true)}
              aria-label="Open quest details"
            >
              <div className="text-[11px] uppercase tracking-wide text-white/50">{DAILY_QUEST.title}</div>
              <div className="flex items-start gap-2 text-[11px] text-white/80 leading-snug">
                <span className="text-primary">•</span>
                <span>{DAILY_QUEST.text}</span>
              </div>
            </button>

            <button
              type="button"
              className="hidden md:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left transition-colors hover:bg-white/10"
              onClick={() => setIsQuestmasterOpen(true)}
              aria-label="Open quest log"
            >
              <ScrollText className="size-4 text-primary/80" />
              <div className="text-[11px] uppercase tracking-wide text-white/60">Lernlog</div>
            </button>

            <button
              type="button"
              className="md:hidden flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80"
              onClick={() => setIsQuestOpen(true)}
              aria-label="Open quest details"
            >
              <span className="uppercase tracking-wide text-white/50">Quest</span>
              <span className="font-semibold text-white/90">1</span>
            </button>

            <button
              type="button"
              className="md:hidden flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80"
              onClick={() => setIsQuestmasterOpen(true)}
              aria-label="Open quest log"
            >
              <ScrollText className="size-3 text-primary/80" />
              <span className="uppercase tracking-wide text-white/50">Lernlog</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="group relative flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 pt-2 pb-3 hover:bg-white/10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/70"
                aria-label="Show Character Stats"
                onClick={() => setIsStatsOpen(true)}
              >
                <div
                  className="relative size-7 overflow-hidden rounded-full border border-white/15 bg-white/10 shadow-sm"
                  aria-hidden="true"
                >
                  {spriteUrl ? (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${spriteUrl})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '400% 400%',
                        backgroundPosition: '0% 0%',
                        imageRendering: 'pixelated',
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white/80">
                      {(characterName || 'C').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <Gamepad2 className="size-4 text-white/80 group-hover:text-white/90" />
                <span className="text-white font-medium truncate max-w-[110px] sm:max-w-[160px]">
                  {characterName || 'Character'}
                </span>

                {/* XP progress (immer sichtbar, auch wenn die extra-Pills wegfallen) */}
                <div
                  className="pointer-events-none absolute left-3 right-3 bottom-1 h-1 rounded-full bg-white/10 overflow-hidden"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.round(xpPercent * 100)}%` }}
                  />
                </div>
              </button>

              <div
                className="sm:hidden flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"
                aria-label="XP Progress"
                title={`Level ${characterStats.level} • ${characterStats.xp}/${xpRequired} XP`}
              >
                <span className="text-xs font-semibold text-white/90 tabular-nums">
                  Lv {characterStats.level}
                </span>
                <div className="w-16">
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.round(xpPercent * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div
                className="hidden sm:flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2"
                aria-label="XP Progress"
                title={`Level ${characterStats.level} • ${characterStats.xp}/${xpRequired} XP`}
              >
                <div className="flex flex-col leading-none">
                  <span className="text-[11px] text-white/60">Level</span>
                  <span className="text-sm font-semibold text-white/90 tabular-nums">{characterStats.level}</span>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[11px] text-white/60">XP</span>
                  <span className="text-sm font-semibold text-white/90 tabular-nums">
                    {characterStats.xp}/{xpRequired}
                  </span>
                </div>
                <div className="w-28">
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.round(xpPercent * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Characters & Abilities"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => setIsInfoOpen(true)}
                >
                  <Info className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Characters & Abilities Modal */}
      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent className="max-w-[min(1000px,calc(100vw-2rem))] bg-black/85 text-white border-white/10 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-xl font-bold">Characters & Abilities</DialogTitle>
                <div className="mt-1 text-xs text-white/60">
                  Get close and press <span className="font-mono text-white/80 border border-white/10 rounded px-1">E</span> or <span className="font-mono text-white/80 border border-white/10 rounded px-1">Space</span> to talk.
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  setDraft((prev) => ({ ...prev, spawnArea: currentArea }))
                  setIsAgentManagerOpen(true)
                  setIsInfoOpen(false)
                }}
              >
                <Plus className="size-4" />
                Add Agent
              </Button>
            </div>
          </DialogHeader>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agentsInWorld.map((a) => (
              <div key={a.id} className="group relative flex flex-col rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-primary/30">
                <div className="flex items-start gap-3">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-black/40 text-3xl border border-white/5">
                    {a.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold truncate">{a.name}</span>
                      {a.speaks && (
                        <Volume2 className="size-3 text-primary/70" aria-hidden="true" />
                      )}
                    </div>
                    <div className="text-xs text-primary/80 font-medium">{a.role}</div>
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-white/70 line-clamp-3 flex-1 italic">
                  "{a.ability}"
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-primary/50" />
                    <span className="text-white/50">Location:</span>
                    <span className="text-white/80">{a.locationLabel}</span>
                  </div>
                  <span className={a.isHere ? 'text-emerald-400 font-medium' : 'text-white/30'}>
                    {a.isHere ? '• Currently here' : 'Elsewhere'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center border-t border-white/10 pt-4">
            <p className="text-xs text-white/40">
              Tip: Custom agents are saved in your local browser storage.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Daily Quest Modal */}
      <Dialog open={isQuestOpen} onOpenChange={setIsQuestOpen}>
        <DialogContent className="max-w-[min(620px,calc(100vw-2rem))] bg-black/85 text-white border-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Daily Quest</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-white/60">Quest</div>
              <div className="mt-1 text-base font-semibold text-white/90">{DAILY_QUEST.text}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-white/60">Hints</div>
              <ul className="mt-2 space-y-1 text-sm text-white/80">
                {DAILY_QUEST.details.map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Questmaster / Lernlog Modal */}
      <Dialog open={isQuestmasterOpen} onOpenChange={setIsQuestmasterOpen}>
        <DialogContent className="max-w-[min(760px,calc(100vw-2rem))] bg-black/85 text-white border-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Questmaster • Lernlog</DialogTitle>
          </DialogHeader>
          <div className="rounded-xl border border-white/10 bg-white/5">
            <QuestmasterPanel />
          </div>
        </DialogContent>
      </Dialog>

      {/* Character Stats Modal */}
      <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
        <DialogContent className="max-w-[min(720px,calc(100vw-2rem))] bg-black/80 text-white border-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div
                className="relative size-10 overflow-hidden rounded-full border border-white/15 bg-white/10"
                aria-hidden="true"
              >
                {spriteUrl ? (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${spriteUrl})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '400% 400%',
                      backgroundPosition: '0% 0%',
                      imageRendering: 'pixelated',
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white/80">
                    {(characterName || 'C').slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span>Stats</span>
                <span className="text-xs font-normal text-white/60">
                  {characterName || 'Character'}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/60">Level</div>
                <div className="mt-1 text-lg font-semibold">{characterStats.level}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/60">XP</div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{characterStats.xp}</div>
              </div>
            </div>

            <div className="text-xs text-white/45">
              Tip: These stats are saved locally and appear automatically after creating your character.
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Agent Manager / Create Custom Agent */}
      <Dialog open={isAgentManagerOpen} onOpenChange={setIsAgentManagerOpen}>
        <DialogContent className="max-w-[min(820px,calc(100vw-2rem))] bg-black/85 text-white border-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Manage Agents</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-white/90">Create New Agent</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <div className="text-xs text-white/60">Name</div>
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Nova"
                    maxLength={30}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs text-white/60">Avatar (Emoji)</div>
                  <Input
                    value={draft.avatar}
                    onChange={(e) => setDraft((p) => ({ ...p, avatar: e.target.value }))}
                    placeholder="🤖"
                    maxLength={6}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs text-white/60">Role</div>
                  <Input
                    value={draft.role}
                    onChange={(e) => setDraft((p) => ({ ...p, role: e.target.value }))}
                    placeholder="e.g. Tutor Agent"
                    maxLength={40}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs text-white/60">Area</div>
                  <select
                    value={draft.spawnArea}
                    onChange={(e) => setDraft((p) => ({ ...p, spawnArea: e.target.value as WorldArea }))}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
                  >
                    <option value="outside">Outside</option>
                    <option value="ai_university">AI University</option>
                    <option value="ai_labor">AI Lab</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs text-white/60">Gender (Voice)</div>
                  <select
                    value={draft.gender}
                    onChange={(e) => setDraft((p) => ({ ...p, gender: e.target.value as 'male' | 'female' }))}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="text-xs text-white/60">Greeting</div>
                  <Input
                    value={draft.greeting}
                    onChange={(e) => setDraft((p) => ({ ...p, greeting: e.target.value }))}
                    placeholder="First sentence when speaking to NPC..."
                    maxLength={140}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="text-xs text-white/60">System Instruction</div>
                  <Textarea
                    value={draft.systemInstruction}
                    onChange={(e) => setDraft((p) => ({ ...p, systemInstruction: e.target.value }))}
                    className="min-h-32 bg-white/5 border-white/10"
                  />
                  <div className="text-[11px] text-white/45">
                    Tip: Define role, style, output format, and constraints.
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl app-glass text-white/90 hover:bg-white/10 border-white/15"
                  onClick={() => setIsAgentManagerOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="rounded-xl"
                  onClick={() => {
                    const name = draft.name.trim() || 'Agent'
                    const avatar = draft.avatar.trim() || '🤖'
                    const role = draft.role.trim() || 'Custom Agent'
                    const greeting = draft.greeting.trim() || 'Hey!'
                    const systemInstruction = draft.systemInstruction.trim()
                    if (!systemInstruction) return

                    onAddCustomAgent({
                      id: makeAgentId(),
                      name,
                      avatar,
                      role,
                      greeting,
                      systemInstruction,
                      gender: draft.gender,
                      spawnArea: draft.spawnArea,
                      position: { x: 0, y: 0 }, // will be placed sensibly in `WorldPage`
                    })

                    setDraft((p) => ({ ...p, name: '' }))
                    setIsAgentManagerOpen(false)
                  }}
                >
                  Save Agent
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white/90">Custom Agents</div>
                <div className="text-xs text-white/50">
                  {customAgents.length} saved
                </div>
              </div>

              {customAgents.length === 0 ? (
                <div className="mt-3 text-sm text-white/60">
                  No custom agents yet. Create one above.
                </div>
              ) : (
                <div className="mt-3 grid gap-2">
                  {customAgents.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                      <div className="text-lg" aria-hidden="true">
                        {a.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-white/90 truncate">
                          {a.name}{' '}
                          <span className="text-xs text-white/50">
                            ({a.spawnArea ?? 'outside'})
                          </span>
                        </div>
                        <div className="text-xs text-white/55 truncate">{a.role}</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                        aria-label="Delete Agent"
                        onClick={() => onDeleteCustomAgent(a.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Controls Hint - Desktop */}
      <div className="absolute bottom-4 right-4 z-40 hidden md:block">
        <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl px-4 py-3 text-xs text-white/60 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)]">
          <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
            <span className="text-white/80 font-mono">WASD</span>
            <span>Move</span>
            <span className="text-white/80 font-mono">E / Space</span>
            <span>Interact</span>
            <span className="text-white/80 font-mono">ESC</span>
            <span>Close</span>
          </div>
        </div>
      </div>
    </>
  )
}
