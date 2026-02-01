'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { WorldConfig, AgentNPC, Mob, WorldArea, PlayerState, LearningStation, WorldMarker } from '@/types'
import type { Decoration, Rect } from '@/lib/decorations'
import { AGENTS, FUTURE_AGENTS, LAB_AGENTS } from '@/lib/agents'
import { MOBS } from '@/lib/mobs'
import { generateMob } from '@/lib/challenge-generator'
import { ALL_LESSONS } from '@/lib/lesson-content'
import type { ChallengeTheme } from '@/types'
import { useSpriteSheet } from '@/hooks/use-sprite-sheet'
import { useNpcSprites } from '@/hooks/use-npc-sprites'
import { useMobSprites, getMobSpriteKey } from '@/hooks/use-mob-sprites'
import { useKeyboard } from '@/hooks/use-keyboard'
import { useCharacterMovement } from '@/hooks/use-character-movement'
import { GameCanvas } from '@/components/world/game-canvas'
import { GameHUD } from '@/components/world/game-hud'
import { MobileControls } from '@/components/world/mobile-controls'
import { RPGDialog } from '@/components/rpg-dialog'
import { MobChallengeDialog } from '@/components/world/mob-challenge-dialog'
import { LessonDialog } from '@/components/world/lesson-dialog'
import { CodeFarmDialog } from '@/components/world/code-farm-dialog'
import { N8nFactoryDialog } from '@/components/world/n8n-factory-dialog'
import { SecurityHubDialog } from '@/components/world/security-hub-dialog'
import { ProgrammingHubDialog } from '../../components/world/programming-hub-dialog'
import { DesignAtelierDialog, DESIGN_STATIONS } from '@/components/world/design-atelier-dialog'
import { WorldOverlays } from '@/components/world/world-overlays'
import { GamePrompts } from '@/components/world/game-prompts'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { BackgroundGrid } from '@/components/ui/background-grid'
import { AppLoadingScreen } from '@/components/ui/app-loading-screen'
import { applyXpReward, parseCharacterStatsV1 } from '@/lib/xp'

const TILE_SIZE = 32
// Welt bleibt fix groß (auch mobil); der Viewport ist nur der sichtbare Ausschnitt.
const OUTSIDE_WORLD_WIDTH = 1600
const OUTSIDE_WORLD_HEIGHT = 1000
const UNIVERSITY_WORLD_WIDTH = 1100
const UNIVERSITY_WORLD_HEIGHT = 760
const LAB_WORLD_WIDTH = 1000
const LAB_WORLD_HEIGHT = 720
const ATELIER_WORLD_WIDTH = 980
const ATELIER_WORLD_HEIGHT = 700
const SECURITY_HUB_WORLD_WIDTH = 1000
const SECURITY_HUB_WORLD_HEIGHT = 720

const getWorldDims = (area: WorldArea) => {
  if (area === 'ai_university') return { worldWidth: UNIVERSITY_WORLD_WIDTH, worldHeight: UNIVERSITY_WORLD_HEIGHT }
  if (area === 'ai_labor') return { worldWidth: LAB_WORLD_WIDTH, worldHeight: LAB_WORLD_HEIGHT }
  if (area === 'design_atelier') return { worldWidth: ATELIER_WORLD_WIDTH, worldHeight: ATELIER_WORLD_HEIGHT }
  if (area === 'security_hub') return { worldWidth: SECURITY_HUB_WORLD_WIDTH, worldHeight: SECURITY_HUB_WORLD_HEIGHT }
  return { worldWidth: OUTSIDE_WORLD_WIDTH, worldHeight: OUTSIDE_WORLD_HEIGHT }
}

const DEFAULT_WORLD_CONFIG: WorldConfig = {
  worldWidth: OUTSIDE_WORLD_WIDTH,
  worldHeight: OUTSIDE_WORLD_HEIGHT,
  viewportWidth: 800,
  viewportHeight: 500,
  tileSize: TILE_SIZE,
}

const NPC_INTERACTION_DISTANCE = 80
const MOB_INTERACTION_DISTANCE = 92
const BUILDING_INTERACTION_DISTANCE = 86
const LEARNING_INTERACTION_DISTANCE = 92
const MOB_DEFEATED_STORAGE_KEY = 'agentmind_mobs_defeated_v1'
const CHARACTER_STATS_STORAGE_KEY = 'agentmind_character_stats_v1'
const LESSONS_COMPLETED_STORAGE_KEY = 'agentmind_lessons_completed_v1'
const CUSTOM_AGENTS_STORAGE_KEY = 'agentmind_custom_agents_v1'
const SPAWNED_MOBS_STORAGE_KEY = 'agentmind_spawned_mobs_v1'
const FARMER_MODE_STORAGE_KEY = 'agentmind_farmer_mode_v1'

export default function WorldPage() {
  const [area, setArea] = useState<WorldArea>('outside')
  const [worldConfig, setWorldConfig] = useState<WorldConfig>(() => {
    if (typeof window === 'undefined') return DEFAULT_WORLD_CONFIG
    const dims = getWorldDims('outside')
    const viewportWidth = Math.max(320, window.innerWidth)
    const viewportHeight = Math.max(320, window.innerHeight)
    return {
      worldWidth: Math.max(dims.worldWidth, viewportWidth),
      worldHeight: Math.max(dims.worldHeight, viewportHeight),
      viewportWidth,
      viewportHeight,
      tileSize: TILE_SIZE,
    }
  })
  const [spriteUrl] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem('agentmind_sprite')
  })
  const [agentName] = useState(() => {
    if (typeof window === 'undefined') return 'Character'
    const savedAgentName = sessionStorage.getItem('agentmind_agent_name')
    const savedCharacterName = sessionStorage.getItem('agentmind_character_name')
    return savedAgentName ?? savedCharacterName ?? 'Character'
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeAgent, setActiveAgent] = useState<AgentNPC | null>(null)
  const [isChallengeOpen, setIsChallengeOpen] = useState(false)
  const [activeMobId, setActiveMobId] = useState<string | null>(null)
  const [isLessonOpen, setIsLessonOpen] = useState(false)
  const [activeLessonStationId, setActiveLessonStationId] = useState<string | null>(null)
  const [defeatedMobIds, setDefeatedMobIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    const raw = sessionStorage.getItem(MOB_DEFEATED_STORAGE_KEY)
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw) as unknown
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
    } catch {
      return []
    }
  })
  const [completedLessonStationIds, setCompletedLessonStationIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    const raw = sessionStorage.getItem(LESSONS_COMPLETED_STORAGE_KEY)
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw) as unknown
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
    } catch {
      return []
    }
  })
  const mobileDirection = useRef<string | null>(null)
  const nearbyNPCRef = useRef<AgentNPC | null>(null)
  const nearbyMobRef = useRef<(Mob & { defeated?: boolean }) | null>(null)
  const nearbyCodeFarmRef = useRef<null | { type: 'code_farm' }>(null)
  const nearbyN8nFactoryRef = useRef<null | { type: 'n8n_factory' }>(null)
  const nearbySecurityHubRef = useRef<null | { type: 'security_hub' }>(null)
  const nearbyProgrammingHubRef = useRef<null | { type: 'programming_hub' }>(null)
  const nearbyDesignAtelierRef = useRef<null | { type: 'ui_ux_atelier' }>(null)
  const nearbyAtelierStationRef = useRef<null | { id: string; name: string; emoji: string; position: { x: number; y: number } }>(null)
  const nearbyPortalRef = useRef<
    | null
    | { type: 'enter_ai_university' }
    | { type: 'exit_ai_university' }
    | { type: 'enter_ai_labor' }
    | { type: 'exit_ai_labor' }
    | { type: 'exit_design_atelier' }
    | { type: 'enter_security_hub' }
    | { type: 'exit_security_hub' }
  >(null)
  const nearbyLearningStationRef = useRef<LearningStation | null>(null)
  const setPlayerRef = useRef<Dispatch<SetStateAction<PlayerState>> | null>(null)

  const [isFarmOpen, setIsFarmOpen] = useState(false)
  const [isFactoryOpen, setIsFactoryOpen] = useState(false)
  const [isSecurityHubOpen, setIsSecurityHubOpen] = useState(false)
  const [isProgrammingHubOpen, setIsProgrammingHubOpen] = useState(false)
  const [isDesignAtelierOpen, setIsDesignAtelierOpen] = useState(false)
  const [activeDesignStationId, setActiveDesignStationId] = useState<string | null>(null)
  const [isFarmer, setIsFarmer] = useState(() => {
    if (typeof window === 'undefined') return false
    const raw = sessionStorage.getItem(FARMER_MODE_STORAGE_KEY)
    return raw === '1'
  })
  const [characterStats, setCharacterStats] = useState(() => {
    if (typeof window === 'undefined') return { version: 1 as const, level: 1, xp: 0 }
    return parseCharacterStatsV1(sessionStorage.getItem(CHARACTER_STATS_STORAGE_KEY))
  })

  const [spawnedMobs, setSpawnedMobs] = useState<Mob[]>(() => {
    if (typeof window === 'undefined') return []
    const raw = sessionStorage.getItem(SPAWNED_MOBS_STORAGE_KEY)
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) return []
      return parsed.filter((x): x is Mob => {
        if (!x || typeof x !== 'object') return false
        const m = x as Partial<Mob>
        const pos = (m.position ?? null) as { x?: unknown; y?: unknown } | null
        const ch = (m.challenge ?? null) as
          | {
            id?: unknown
            title?: unknown
            description?: unknown
            starterCode?: unknown
            tests?: unknown
          }
          | null
        return (
          typeof m.id === 'string' &&
          typeof m.name === 'string' &&
          typeof m.emoji === 'string' &&
          !!pos &&
          typeof pos.x === 'number' &&
          typeof pos.y === 'number' &&
          !!ch &&
          typeof ch.id === 'string' &&
          typeof ch.title === 'string' &&
          typeof ch.description === 'string' &&
          typeof ch.starterCode === 'string' &&
          Array.isArray(ch.tests)
        )
      })
    } catch {
      return []
    }
  })

  // Farm state removed - now using level-based generation

  const [customAgents, setCustomAgents] = useState<AgentNPC[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(CUSTOM_AGENTS_STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) return []
      const validAgents = parsed
        .filter((x): x is AgentNPC => {
          if (!x || typeof x !== 'object') return false
          const a = x as Partial<AgentNPC>
          const pos = (a.position ?? null) as { x?: unknown; y?: unknown } | null
          const gender = a.gender
          // Only keep agents that have a spriteSheetBase64
          const hasSprite = typeof a.spriteSheetBase64 === 'string' && a.spriteSheetBase64.length > 0
          if (!hasSprite) return false
          return (
            typeof a.id === 'string' &&
            typeof a.name === 'string' &&
            typeof a.role === 'string' &&
            (gender === undefined || gender === 'male' || gender === 'female') &&
            typeof a.systemInstruction === 'string' &&
            typeof a.greeting === 'string' &&
            !!pos &&
            typeof pos === 'object' &&
            typeof pos.x === 'number' &&
            typeof pos.y === 'number' &&
            (a.spawnArea === undefined ||
              a.spawnArea === 'outside' ||
              a.spawnArea === 'ai_university' ||
              a.spawnArea === 'ai_labor' ||
              a.spawnArea === 'design_atelier')
          )
        })
        .map((a) => ({
          ...a,
          gender: a.gender ?? 'male',
          // Defensive: strip unknown ui for custom agents (optional future feature)
          ui: a.ui,
        }))
      // Immediately save cleaned list back to localStorage
      if (validAgents.length !== parsed.length) {
        try {
          localStorage.setItem(CUSTOM_AGENTS_STORAGE_KEY, JSON.stringify(validAgents))
        } catch {
          // ignore
        }
      }
      return validAgents
    } catch {
      return []
    }
  })

  // Fullscreen world sizing (client-only)
  useEffect(() => {
    const compute = (): WorldConfig => {
      const dims = getWorldDims(area)
      const viewportWidth = Math.max(320, window.innerWidth)
      const viewportHeight = Math.max(320, window.innerHeight)
      return {
        worldWidth: Math.max(dims.worldWidth, viewportWidth),
        worldHeight: Math.max(dims.worldHeight, viewportHeight),
        viewportWidth,
        viewportHeight,
        tileSize: TILE_SIZE,
      }
    }

    const onResize = () => setWorldConfig(compute())
    window.addEventListener('resize', onResize)
    queueMicrotask(onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [area])

  // When switching areas, update world dims immediately (not only on resize)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const dims = getWorldDims(area)
    queueMicrotask(() => {
      const viewportWidth = Math.max(320, window.innerWidth)
      const viewportHeight = Math.max(320, window.innerHeight)
      setWorldConfig((prev) => ({
        ...prev,
        worldWidth: Math.max(dims.worldWidth, viewportWidth),
        worldHeight: Math.max(dims.worldHeight, viewportHeight),
        viewportWidth,
        viewportHeight,
        tileSize: TILE_SIZE,
      }))
    })
  }, [area])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(CUSTOM_AGENTS_STORAGE_KEY, JSON.stringify(customAgents))
    } catch {
      // ignore
    }
  }, [customAgents])

  useEffect(() => {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(FARMER_MODE_STORAGE_KEY, isFarmer ? '1' : '0')
  }, [isFarmer])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.setItem(CHARACTER_STATS_STORAGE_KEY, JSON.stringify(characterStats))
    } catch {
      // ignore
    }
  }, [characterStats])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.setItem(SPAWNED_MOBS_STORAGE_KEY, JSON.stringify(spawnedMobs))
    } catch {
      // ignore
    }
  }, [spawnedMobs])

  // Load sprite sheet
  const { spriteSheet, isLoading: spriteLoading } = useSpriteSheet(spriteUrl)

  const outsideUniversity = useMemo(
    (): {
      decoration: Decoration
      entrance: { x: number; y: number }
      spawnOutside: { x: number; y: number }
      spawnInside: { x: number; y: number }
    } => {
      // Gebäude weiter unten links platzieren.
      // (Fixe Koordinaten, damit es zuverlässig "bottom-left" ist.)
      const x = 3 * TILE_SIZE
      const y = 20 * TILE_SIZE

      // Das ist der Punkt direkt "vor" der Tür.
      const entrance = { x: x + 137, y: y + 154 }

      // Spawn-Punkte beim Wechsel
      const spawnOutside = { x: entrance.x - 32, y: entrance.y + 10 }
      const spawnInside = { x: UNIVERSITY_WORLD_WIDTH / 2 - 32, y: UNIVERSITY_WORLD_HEIGHT - 160 }

      return {
        decoration: { type: 'university' as const, x, y, seed: 0.42 },
        entrance,
        spawnOutside,
        spawnInside,
      }
    }, [])

  const insideUniversityExit = useMemo(() => {
    // Exit-Punkt näher am unteren Rand, damit er leichter erreichbar ist
    const exitPoint = { x: UNIVERSITY_WORLD_WIDTH / 2, y: UNIVERSITY_WORLD_HEIGHT - 80 }
    return { exitPoint }
  }, [])

  const outsideLab = useMemo(
    (): {
      decoration: Decoration
      entrance: { x: number; y: number }
      spawnOutside: { x: number; y: number }
      spawnInside: { x: number; y: number }
    } => {
      const labWidth = 228
      const labHeight = 148

      // AI Labor direkt neben die University platzieren.
      const baseX = outsideUniversity.decoration.x + 300
      const baseY = outsideUniversity.decoration.y + 4

      const x = Math.max(16, Math.min(OUTSIDE_WORLD_WIDTH - labWidth - 16, baseX))
      const y = Math.max(16, Math.min(OUTSIDE_WORLD_HEIGHT - labHeight - 16, baseY))

      const entrance = { x: x + 122, y: y + 150 }
      const spawnOutside = { x: entrance.x - 32, y: entrance.y + 10 }
      const spawnInside = { x: LAB_WORLD_WIDTH / 2 - 32, y: LAB_WORLD_HEIGHT - 160 }

      return {
        decoration: { type: 'ai_labor' as const, x, y, seed: 0.58 },
        entrance,
        spawnOutside,
        spawnInside,
      }
    }, [outsideUniversity.decoration.x, outsideUniversity.decoration.y])

  const outsideCodeFarm = useMemo(
    (): {
      decoration: Decoration
      entrance: { x: number; y: number }
      spawnPoint: { x: number; y: number }
    } => {
      // Code Farm rechts unten platzieren (fixe Koordinaten).
      const x = OUTSIDE_WORLD_WIDTH - 330
      const y = 18 * TILE_SIZE

      // Tür/Terminal ungefähr mittig an der Scheune.
      const entrance = { x: x + 196, y: y + 150 }

      // Spawn-Punkt: ein Stück vor dem Eingang (auf "dem Feld")
      const spawnPoint = { x: entrance.x - 64, y: entrance.y + 12 }

      return {
        decoration: { type: 'code_farm' as const, x, y, seed: 0.73 },
        entrance,
        spawnPoint,
      }
    }, [])

  const outsideN8nFactory = useMemo(
    (): {
      decoration: Decoration
      entrance: { x: number; y: number }
    } => {
      // n8n Automation Forge etwas nach links schieben, damit Atelier rechts daneben passt.
      const x = OUTSIDE_WORLD_WIDTH - 750
      const y = 5 * TILE_SIZE

      // Tür/Eingang
      const entrance = { x: x + 120, y: y + 140 }

      return {
        decoration: { type: 'n8n_factory' as const, x, y, seed: 0.88 },
        entrance,
      }
    }, [])

  const outsideSecurityHub = useMemo(
    (): {
      decoration: Decoration
      entrance: { x: number; y: number }
      spawnOutside: { x: number; y: number }
      spawnInside: { x: number; y: number }
    } => {
      // Security Hub links mittig platzieren, damit es sichtbar ist.
      const x = 6 * TILE_SIZE
      const y = 10 * TILE_SIZE

      // Tür/Eingang
      const entrance = { x: x + 115, y: y + 140 }
      const spawnOutside = { x: entrance.x - 32, y: entrance.y + 10 }
      const spawnInside = { x: SECURITY_HUB_WORLD_WIDTH / 2 - 32, y: SECURITY_HUB_WORLD_HEIGHT - 160 }

      return {
        decoration: { type: 'security_hub' as const, x, y, seed: 0.75 },
        entrance,
        spawnOutside,
        spawnInside,
      }
    }, [])

  const outsideProgrammingHub = useMemo(
    (): {
      decoration: Decoration
      entrance: { x: number; y: number }
    } => {
      // Programmierhub weiter unten rechts auf die Flaeche mit Weg.
      const x = OUTSIDE_WORLD_WIDTH - 520
      const y = 22 * TILE_SIZE

      // Tür/Eingang
      const entrance = { x: x + 122, y: y + 142 }

      return {
        decoration: { type: 'programming_hub' as const, x, y, seed: 0.82 },
        entrance,
      }
    }, [])

  const outsideAtelier = useMemo(
    (): {
      decoration: Decoration
      entrance: { x: number; y: number }
      spawnInside: { x: number; y: number }
      spawnOutside: { x: number; y: number }
    } => {
      // UI/UX Atelier rechts neben der n8n Factory.
      const x = OUTSIDE_WORLD_WIDTH - 350
      const y = 5 * TILE_SIZE

      const entrance = { x: x + 158, y: y + 140 }
      const spawnOutside = { x: entrance.x - 32, y: entrance.y + 24 }
      const spawnInside = { x: ATELIER_WORLD_WIDTH / 2 - 32, y: ATELIER_WORLD_HEIGHT - 170 }

      return {
        decoration: { type: 'ui_ux_atelier' as const, x, y, seed: 0.99 },
        entrance,
        spawnInside,
        spawnOutside,
      }
    }, [])

  const outsideNpcPlazaRect = useMemo<Rect>(() => {
    const x = 2 * TILE_SIZE
    const y = 2 * TILE_SIZE
    const w = 14 * TILE_SIZE
    const h = 9 * TILE_SIZE
    return { x, y, w, h }
  }, [])

  const outsideNpcPlazaCenter = useMemo(
    () => ({
      x: outsideNpcPlazaRect.x + outsideNpcPlazaRect.w / 2,
      y: outsideNpcPlazaRect.y + outsideNpcPlazaRect.h / 2,
    }),
    [outsideNpcPlazaRect]
  )

  const outsideNpcPlazaHouses = useMemo<Decoration[]>(() => {
    const rightX = outsideNpcPlazaRect.x + outsideNpcPlazaRect.w + 64
    const bottomY = outsideNpcPlazaRect.y + outsideNpcPlazaRect.h + 64
    return [
      { type: 'house', x: rightX, y: outsideNpcPlazaRect.y + 24, seed: 0.12 },
      { type: 'house', x: outsideNpcPlazaRect.x + 40, y: bottomY, seed: 0.36 },
    ]
  }, [outsideNpcPlazaRect])

  const outsideMarkers = useMemo<WorldMarker[]>(() => {
    // Marker direkt über dem Moltbot positionieren (unten links bei 150, 850)
    const x = 174  // Mitte des Moltbot (150 + 24)
    const y = 826  // über dem Moltbot (850 - 24)

    return [
      {
        id: 'moltbot-path-marker',
        position: { x, y },
        label: '!',
      },
    ]
  }, [])

  const outsideRoadTargets = useMemo(
    () => [
      outsideNpcPlazaCenter,
      outsideUniversity.entrance,
      outsideLab.entrance,
      outsideSecurityHub.entrance,
      outsideCodeFarm.entrance,
      outsideN8nFactory.entrance,
      outsideProgrammingHub.entrance,
      outsideAtelier.entrance,
    ],
    [
      outsideNpcPlazaCenter,
      outsideN8nFactory.entrance,
      outsideCodeFarm.entrance,
      outsideLab.entrance,
      outsideUniversity.entrance,
      outsideSecurityHub.entrance,
      outsideProgrammingHub.entrance,
      outsideAtelier.entrance,
    ]
  )

  const outsideExtraDecorations = useMemo<Decoration[]>(() => {
    return [
      ...outsideNpcPlazaHouses,
      outsideUniversity.decoration,
      outsideLab.decoration,
      outsideSecurityHub.decoration,
      outsideCodeFarm.decoration,
      outsideN8nFactory.decoration,
      outsideProgrammingHub.decoration,
      outsideAtelier.decoration,
    ]
  }, [
    outsideNpcPlazaHouses,
    outsideCodeFarm.decoration,
    outsideLab.decoration,
    outsideUniversity.decoration,
    outsideSecurityHub.decoration,
    outsideN8nFactory.decoration,
    outsideProgrammingHub.decoration,
    outsideAtelier.decoration,
  ])

  const insideLabExit = useMemo(() => {
    // Exit-Punkt näher am unteren Rand, damit er leichter erreichbar ist
    const exitPoint = { x: LAB_WORLD_WIDTH / 2, y: LAB_WORLD_HEIGHT - 80 }
    return { exitPoint }
  }, [])

  const insideAtelierExit = useMemo(() => {
    // Exit-Punkt näher am unteren Rand, damit er leichter erreichbar ist
    const exitPoint = { x: ATELIER_WORLD_WIDTH / 2, y: ATELIER_WORLD_HEIGHT - 70 }
    return { exitPoint }
  }, [])

  const insideSecurityHubExit = useMemo(() => {
    // Exit-Punkt näher am unteren Rand, damit er leichter erreichbar ist
    const exitPoint = { x: SECURITY_HUB_WORLD_WIDTH / 2, y: SECURITY_HUB_WORLD_HEIGHT - 80 }
    return { exitPoint }
  }, [])

  const learningStations = useMemo<LearningStation[]>(() => {
    // Diese Koordinaten sind an den automatisch generierten "Desk+PC" Spots ausgerichtet
    // (siehe `lib/decorations.ts` für theme === 'ai_university').
    // Desk wird bei (col * TILE_SIZE - 18, row * TILE_SIZE - 28) gezeichnet.
    // Der Monitor ist bei desk.x + 39, desk.y + 10 (Mitte).
    const posFromDeskTile = (row: number, col: number) => ({
      x: col * TILE_SIZE - 18 + 39, // Mitte des Monitors
      y: row * TILE_SIZE - 28 + 10, // Oberer Bereich des Monitors
    })

    // Import comprehensive lessons and add positions
    const promptingLesson = ALL_LESSONS.find(l => l.id === 'lesson_prompting_basics')!
    const contextLesson = ALL_LESSONS.find(l => l.id === 'lesson_context_tokens')!
    const structuredLesson = ALL_LESSONS.find(l => l.id === 'lesson_json_outputs')!
    const fewShotLesson = ALL_LESSONS.find(l => l.id === 'lesson_few_shot_prompting')!

    // Security Hub Lessons
    const securityFundamentals = ALL_LESSONS.find(l => l.id === 'lesson_security_fundamentals')!
    const owaspTop10 = ALL_LESSONS.find(l => l.id === 'lesson_owasp_top10')!
    const encryptionBasics = ALL_LESSONS.find(l => l.id === 'lesson_encryption_basics')!

    return [
      // ========================================
      // PROMPTING MASTERCLASS - 12 Steps
      // ========================================
      {
        ...promptingLesson,
        position: posFromDeskTile(12, 11),
      },
      // ========================================
      // CONTEXT WINDOW MASTERY - 11 Steps
      // ========================================
      {
        ...contextLesson,
        position: posFromDeskTile(12, 23),
      },
      // ========================================
      // STRUCTURED OUTPUT ENGINEERING - 11 Steps
      // ========================================
      {
        ...structuredLesson,
        position: posFromDeskTile(7, 17),
      },
      // ========================================
      // FEW-SHOT LEARNING DEEP DIVE - 11 Steps (Lab)
      // ========================================
      {
        ...fewShotLesson,
        position: { x: 280, y: 180 },
      },
      // ========================================
      // SECURITY HUB LESSONS
      // ========================================
      {
        ...securityFundamentals,
        position: { x: 200, y: 180 },
        area: 'security_hub' as const,
      },
      {
        ...owaspTop10,
        position: { x: 500, y: 180 },
        area: 'security_hub' as const,
      },
      {
        ...encryptionBasics,
        position: { x: 800, y: 180 },
        area: 'security_hub' as const,
      },
    ]
  }, [outsideAtelier.entrance.x, outsideAtelier.entrance.y])

  const atelierLayout = useMemo(
    () => {
      const midX = ATELIER_WORLD_WIDTH / 2
      const midY = ATELIER_WORLD_HEIGHT / 2
      return [
        { type: 'atelier_easel' as const, x: midX - 220, y: midY - 170, seed: 0.11 },
        { type: 'atelier_palette' as const, x: midX + 90, y: midY - 160, seed: 0.22 },
        { type: 'atelier_sculpture' as const, x: midX - 200, y: midY + 20, seed: 0.33 },
        { type: 'atelier_moodboard' as const, x: midX + 100, y: midY + 20, seed: 0.44 },
      ]
    },
    []
  )

  const atelierStations = useMemo(() => {
    if (area !== 'design_atelier') return []
    return DESIGN_STATIONS.map((station, idx) => {
      const spot = atelierLayout[idx] ?? atelierLayout[0]
      return {
        id: station.id,
        name: station.name,
        emoji: station.emoji,
        position: { x: spot.x + 24, y: spot.y + 52 },
        decoration: spot.type,
      }
    })
  }, [area, atelierLayout])

  const atelierDecorations = useMemo<Decoration[]>(() => {
    if (area !== 'design_atelier') return []
    return atelierLayout.map((spot) => ({
      type: spot.type,
      x: spot.x,
      y: spot.y,
      seed: spot.seed,
    }))
  }, [area, atelierLayout])

  const activeLessonStation = useMemo(() => {
    if (!activeLessonStationId) return null
    return learningStations.find((s) => s.id === activeLessonStationId) ?? null
  }, [activeLessonStationId, learningStations])

  // `nearbyPortal` wird weiter unten berechnet (nachdem `player` existiert).

  const handlePortalInteraction = useCallback((portalType: 'enter_ai_university' | 'exit_ai_university' | 'enter_ai_labor' | 'exit_ai_labor' | 'exit_design_atelier' | 'enter_security_hub' | 'exit_security_hub') => {
    if (isDialogOpen || isChallengeOpen || isLessonOpen || isDesignAtelierOpen) return false

    if (portalType === 'enter_ai_university') {
      setArea('ai_university')
      setPlayerRef.current?.((prev) => ({ ...prev, x: outsideUniversity.spawnInside.x, y: outsideUniversity.spawnInside.y }))
      return true
    }

    if (portalType === 'exit_ai_university') {
      setArea('outside')
      setPlayerRef.current?.((prev) => ({ ...prev, x: outsideUniversity.spawnOutside.x, y: outsideUniversity.spawnOutside.y }))
      return true
    }

    if (portalType === 'enter_ai_labor') {
      setArea('ai_labor')
      setPlayerRef.current?.((prev) => ({ ...prev, x: outsideLab.spawnInside.x, y: outsideLab.spawnInside.y }))
      return true
    }

    if (portalType === 'exit_ai_labor') {
      setArea('outside')
      setPlayerRef.current?.((prev) => ({ ...prev, x: outsideLab.spawnOutside.x, y: outsideLab.spawnOutside.y }))
      return true
    }

    if (portalType === 'exit_design_atelier') {
      setArea('outside')
      setPlayerRef.current?.((prev) => ({ ...prev, x: outsideAtelier.spawnOutside.x, y: outsideAtelier.spawnOutside.y }))
      return true
    }

    if (portalType === 'enter_security_hub') {
      setArea('security_hub')
      setPlayerRef.current?.((prev) => ({ ...prev, x: outsideSecurityHub.spawnInside.x, y: outsideSecurityHub.spawnInside.y }))
      return true
    }

    if (portalType === 'exit_security_hub') {
      setArea('outside')
      setPlayerRef.current?.((prev) => ({ ...prev, x: outsideSecurityHub.spawnOutside.x, y: outsideSecurityHub.spawnOutside.y }))
      return true
    }

    return false
  }, [
    isChallengeOpen,
    isDialogOpen,
    isDesignAtelierOpen,
    isLessonOpen,
    outsideLab.spawnInside.x,
    outsideLab.spawnInside.y,
    outsideLab.spawnOutside.x,
    outsideLab.spawnOutside.y,
    outsideAtelier.spawnOutside.x,
    outsideAtelier.spawnOutside.y,
    outsideUniversity.spawnInside.x,
    outsideUniversity.spawnInside.y,
    outsideUniversity.spawnOutside.x,
    outsideUniversity.spawnOutside.y,
    outsideSecurityHub.spawnInside.x,
    outsideSecurityHub.spawnInside.y,
    outsideSecurityHub.spawnOutside.x,
    outsideSecurityHub.spawnOutside.y,
    setArea,
  ])

  const handleBuildingInteraction = useCallback(
    (buildingType: 'code_farm' | 'n8n_factory' | 'security_hub' | 'programming_hub' | 'ui_ux_atelier') => {
      if (isDialogOpen || isChallengeOpen || isLessonOpen || isDesignAtelierOpen) return false

      if (buildingType === 'code_farm') {
        setIsFarmOpen(true)
        setIsFarmer(true)
        return true
      }

      if (buildingType === 'n8n_factory') {
        setIsFactoryOpen(true)
        return true
      }

      if (buildingType === 'security_hub') {
        // Security Hub ist jetzt ein betretbarer Bereich
        setArea('security_hub')
        setPlayerRef.current?.((prev) => ({ ...prev, x: outsideSecurityHub.spawnInside.x, y: outsideSecurityHub.spawnInside.y }))
        return true
      }

      if (buildingType === 'programming_hub') {
        setIsProgrammingHubOpen(true)
        return true
      }

      if (buildingType === 'ui_ux_atelier') {
        setArea('design_atelier')
        setPlayerRef.current?.((prev) => ({ ...prev, x: outsideAtelier.spawnInside.x, y: outsideAtelier.spawnInside.y }))
        return true
      }

      return false
    },
    [
      isChallengeOpen,
      isDesignAtelierOpen,
      isDialogOpen,
      isLessonOpen,
      outsideAtelier.spawnInside.x,
      outsideAtelier.spawnInside.y,
      outsideSecurityHub.spawnInside.x,
      outsideSecurityHub.spawnInside.y,
      setIsFarmer,
      setIsFactoryOpen,
      setIsProgrammingHubOpen,
      setArea,
    ])

  const handleAtelierStationInteraction = useCallback((stationId: string) => {
    if (isDialogOpen || isChallengeOpen || isLessonOpen || isDesignAtelierOpen) return false
    setActiveDesignStationId(stationId)
    setIsDesignAtelierOpen(true)
    return true
  }, [isChallengeOpen, isDesignAtelierOpen, isDialogOpen, isLessonOpen])

  // Handle interaction
  const handleInteract = useCallback(() => {
    const portal = nearbyPortalRef.current
    if (portal && handlePortalInteraction(portal.type)) {
      return
    }

    const farm = nearbyCodeFarmRef.current
    if (farm && handleBuildingInteraction('code_farm')) return

    const factory = nearbyN8nFactoryRef.current
    if (factory && handleBuildingInteraction('n8n_factory')) return

    const securityHub = nearbySecurityHubRef.current
    if (securityHub && handleBuildingInteraction('security_hub')) return

    const programmingHub = nearbyProgrammingHubRef.current
    if (programmingHub && handleBuildingInteraction('programming_hub')) return

    const designAtelier = nearbyDesignAtelierRef.current
    if (designAtelier && handleBuildingInteraction('ui_ux_atelier')) return

    const atelierStation = nearbyAtelierStationRef.current
    if (atelierStation && handleAtelierStationInteraction(atelierStation.id)) return

    const station = nearbyLearningStationRef.current
    if (station && !isDialogOpen && !isChallengeOpen && !isLessonOpen) {
      setActiveLessonStationId(station.id)
      setIsLessonOpen(true)
      return
    }

    const npc = nearbyNPCRef.current
    // Dialog soll nicht "automatisch" verschwinden, nur weil man sich bewegt.
    // Deshalb erlauben wir Bewegung bei offenem Dialog, blocken aber neue Interaktionen.
    if (npc && !isDialogOpen && !isChallengeOpen && !isLessonOpen) {
      setActiveAgent(npc)
      setIsDialogOpen(true)
    }
  }, [
    handleAtelierStationInteraction,
    handleBuildingInteraction,
    handlePortalInteraction,
    isLessonOpen,
    isChallengeOpen,
    isDialogOpen,
  ])

  const handleAttack = useCallback(() => {
    const mob = nearbyMobRef.current
    // Während eines NPC-Dialogs keine neuen Kämpfe starten.
    if (mob && !mob.defeated && !isChallengeOpen && !isDialogOpen && !isLessonOpen && !isFarmOpen) {
      setActiveMobId(mob.id)
      setIsChallengeOpen(true)
    }
  }, [isChallengeOpen, isDialogOpen, isFarmOpen, isLessonOpen])

  // Handle escape
  const handleEscape = useCallback(() => {
    if (isFarmOpen) {
      setIsFarmOpen(false)
      return
    }
    if (isProgrammingHubOpen) {
      setIsProgrammingHubOpen(false)
      return
    }
    if (isDesignAtelierOpen) {
      setIsDesignAtelierOpen(false)
      setActiveDesignStationId(null)
      return
    }
    if (isLessonOpen) {
      setIsLessonOpen(false)
      setActiveLessonStationId(null)
      return
    }
    if (isChallengeOpen) {
      setIsChallengeOpen(false)
      setActiveMobId(null)
      return
    }
    if (isDialogOpen) {
      setIsDialogOpen(false)
      setActiveAgent(null)
    }
  }, [isChallengeOpen, isDesignAtelierOpen, isDialogOpen, isFarmOpen, isLessonOpen, isProgrammingHubOpen])

  // Keyboard controls
  // Challenge ist ein echtes Modal: blockt Bewegung/Keyboard.
  // Der NPC-Dialog soll dagegen offen bleiben können, auch wenn der Spieler sich bewegt.
  const movementIsBlocked = isChallengeOpen || isLessonOpen || isFarmOpen
  const keysPressed = useKeyboard({
    onInteract: handleInteract,
    onAttack: handleAttack,
    onEscape: handleEscape,
    disabled: movementIsBlocked,
  })

  // Mobile controls
  const handleMobileMove = useCallback((direction: 'up' | 'down' | 'left' | 'right' | null) => {
    if (direction) {
      const keyMap = { up: 'w', down: 's', left: 'a', right: 'd' }
      keysPressed.current.add(keyMap[direction])
      mobileDirection.current = keyMap[direction]
    } else if (mobileDirection.current) {
      keysPressed.current.delete(mobileDirection.current)
      mobileDirection.current = null
    }
  }, [keysPressed])

  // Character movement
  const { player, setPlayer } = useCharacterMovement({
    worldConfig,
    keysPressed,
    disabled: movementIsBlocked,
  })

  useEffect(() => {
    setPlayerRef.current = setPlayer
  }, [setPlayer])

  const nearbyPortal = useMemo(() => {
    if (isChallengeOpen || isLessonOpen || isFarmOpen) return null

    const playerCenterX = player.x + 32
    const playerCenterY = player.y + 32

    if (area === 'outside') {
      const dux = playerCenterX - outsideUniversity.entrance.x
      const duy = playerCenterY - outsideUniversity.entrance.y
      const uniDist = Math.sqrt(dux * dux + duy * duy)

      const dlx = playerCenterX - outsideLab.entrance.x
      const dly = playerCenterY - outsideLab.entrance.y
      const labDist = Math.sqrt(dlx * dlx + dly * dly)

      const uniOk = uniDist < BUILDING_INTERACTION_DISTANCE
      const labOk = labDist < BUILDING_INTERACTION_DISTANCE

      if (uniOk && labOk) {
        return uniDist <= labDist ? ({ type: 'enter_ai_university' } as const) : ({ type: 'enter_ai_labor' } as const)
      }
      if (uniOk) return { type: 'enter_ai_university' } as const
      if (labOk) return { type: 'enter_ai_labor' } as const
      return null
    }

    if (area === 'ai_university') {
      const dx = playerCenterX - insideUniversityExit.exitPoint.x
      const dy = playerCenterY - insideUniversityExit.exitPoint.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < BUILDING_INTERACTION_DISTANCE) return { type: 'exit_ai_university' } as const
      return null
    }

    if (area === 'ai_labor') {
      const dx = playerCenterX - insideLabExit.exitPoint.x
      const dy = playerCenterY - insideLabExit.exitPoint.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < BUILDING_INTERACTION_DISTANCE) return { type: 'exit_ai_labor' } as const
      return null
    }

    if (area === 'design_atelier') {
      const dx = playerCenterX - insideAtelierExit.exitPoint.x
      const dy = playerCenterY - insideAtelierExit.exitPoint.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < BUILDING_INTERACTION_DISTANCE) return { type: 'exit_design_atelier' } as const
      return null
    }

    if (area === 'security_hub') {
      const dx = playerCenterX - insideSecurityHubExit.exitPoint.x
      const dy = playerCenterY - insideSecurityHubExit.exitPoint.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < BUILDING_INTERACTION_DISTANCE) return { type: 'exit_security_hub' } as const
      return null
    }

    return null
  }, [
    area,
    insideAtelierExit.exitPoint.x,
    insideAtelierExit.exitPoint.y,
    insideLabExit.exitPoint.x,
    insideLabExit.exitPoint.y,
    insideSecurityHubExit.exitPoint.x,
    insideSecurityHubExit.exitPoint.y,
    insideUniversityExit.exitPoint.x,
    insideUniversityExit.exitPoint.y,
    isChallengeOpen,
    isFarmOpen,
    isLessonOpen,
    outsideLab.entrance.x,
    outsideLab.entrance.y,
    outsideUniversity.entrance.x,
    outsideUniversity.entrance.y,
    player.x,
    player.y,
  ])

  useEffect(() => {
    nearbyPortalRef.current = nearbyPortal
  }, [nearbyPortal])

  const portalTargets = useMemo<
    { type: 'enter_ai_university' | 'exit_ai_university' | 'enter_ai_labor' | 'exit_ai_labor' | 'exit_design_atelier' | 'exit_security_hub'; x: number; y: number }[]
  >(() => {
    if (area === 'outside') {
      return [
        { type: 'enter_ai_university', x: outsideUniversity.entrance.x, y: outsideUniversity.entrance.y },
        { type: 'enter_ai_labor', x: outsideLab.entrance.x, y: outsideLab.entrance.y },
      ]
    }
    if (area === 'ai_university') {
      return [{ type: 'exit_ai_university', x: insideUniversityExit.exitPoint.x, y: insideUniversityExit.exitPoint.y }]
    }
    if (area === 'ai_labor') {
      return [{ type: 'exit_ai_labor', x: insideLabExit.exitPoint.x, y: insideLabExit.exitPoint.y }]
    }
    if (area === 'design_atelier') {
      return [{ type: 'exit_design_atelier', x: insideAtelierExit.exitPoint.x, y: insideAtelierExit.exitPoint.y }]
    }
    if (area === 'security_hub') {
      return [{ type: 'exit_security_hub', x: insideSecurityHubExit.exitPoint.x, y: insideSecurityHubExit.exitPoint.y }]
    }
    return []
  }, [
    area,
    insideAtelierExit.exitPoint.x,
    insideAtelierExit.exitPoint.y,
    insideLabExit.exitPoint.x,
    insideLabExit.exitPoint.y,
    insideSecurityHubExit.exitPoint.x,
    insideSecurityHubExit.exitPoint.y,
    insideUniversityExit.exitPoint.x,
    insideUniversityExit.exitPoint.y,
    outsideLab.entrance.x,
    outsideLab.entrance.y,
    outsideUniversity.entrance.x,
    outsideUniversity.entrance.y,
  ])

  const nearbyCodeFarm = useMemo(() => {
    if (area !== 'outside') return null
    if (isChallengeOpen || isLessonOpen || isFarmOpen) return null

    const playerCenterX = player.x + 32
    const playerCenterY = player.y + 32
    const dx = playerCenterX - outsideCodeFarm.entrance.x
    const dy = playerCenterY - outsideCodeFarm.entrance.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < BUILDING_INTERACTION_DISTANCE) return { type: 'code_farm' } as const
    return null
  }, [area, isChallengeOpen, isFarmOpen, isLessonOpen, outsideCodeFarm.entrance.x, outsideCodeFarm.entrance.y, player.x, player.y])

  useEffect(() => {
    nearbyCodeFarmRef.current = nearbyCodeFarm
  }, [nearbyCodeFarm])

  const nearbyN8nFactory = useMemo(() => {
    if (area !== 'outside') return null
    if (isChallengeOpen || isLessonOpen || isFarmOpen || isFactoryOpen) return null

    const playerCenterX = player.x + 32
    const playerCenterY = player.y + 32
    const dx = playerCenterX - outsideN8nFactory.entrance.x
    const dy = playerCenterY - outsideN8nFactory.entrance.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < BUILDING_INTERACTION_DISTANCE) return { type: 'n8n_factory' } as const
    return null
  }, [area, isChallengeOpen, isFarmOpen, isFactoryOpen, isLessonOpen, outsideN8nFactory.entrance.x, outsideN8nFactory.entrance.y, player.x, player.y])

  useEffect(() => {
    nearbyN8nFactoryRef.current = nearbyN8nFactory
  }, [nearbyN8nFactory])

  const nearbySecurityHub = useMemo(() => {
    if (area !== 'outside') return null
    if (isChallengeOpen || isLessonOpen || isFarmOpen || isFactoryOpen || isSecurityHubOpen) return null

    const playerCenterX = player.x + 32
    const playerCenterY = player.y + 32
    const dx = playerCenterX - outsideSecurityHub.entrance.x
    const dy = playerCenterY - outsideSecurityHub.entrance.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < BUILDING_INTERACTION_DISTANCE) return { type: 'security_hub' } as const
    return null
  }, [area, isChallengeOpen, isFarmOpen, isFactoryOpen, isSecurityHubOpen, isLessonOpen, outsideSecurityHub.entrance.x, outsideSecurityHub.entrance.y, player.x, player.y])

  useEffect(() => {
    nearbySecurityHubRef.current = nearbySecurityHub
  }, [nearbySecurityHub])

  const nearbyProgrammingHub = useMemo(() => {
    if (area !== 'outside') return null
    if (isChallengeOpen || isLessonOpen || isFarmOpen || isFactoryOpen || isSecurityHubOpen || isProgrammingHubOpen) return null

    const playerCenterX = player.x + 32
    const playerCenterY = player.y + 32
    const dx = playerCenterX - outsideProgrammingHub.entrance.x
    const dy = playerCenterY - outsideProgrammingHub.entrance.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < BUILDING_INTERACTION_DISTANCE) return { type: 'programming_hub' } as const
    return null
  }, [
    area,
    isChallengeOpen,
    isFarmOpen,
    isFactoryOpen,
    isSecurityHubOpen,
    isProgrammingHubOpen,
    isLessonOpen,
    outsideProgrammingHub.entrance.x,
    outsideProgrammingHub.entrance.y,
    player.x,
    player.y,
  ])

  useEffect(() => {
    nearbyProgrammingHubRef.current = nearbyProgrammingHub
  }, [nearbyProgrammingHub])

  const nearbyDesignAtelier = useMemo(() => {
    if (area !== 'outside') return null
    if (isChallengeOpen || isLessonOpen || isFarmOpen || isFactoryOpen || isSecurityHubOpen || isProgrammingHubOpen || isDesignAtelierOpen) {
      return null
    }

    const playerCenterX = player.x + 32
    const playerCenterY = player.y + 32
    const dx = playerCenterX - outsideAtelier.entrance.x
    const dy = playerCenterY - outsideAtelier.entrance.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < BUILDING_INTERACTION_DISTANCE) return { type: 'ui_ux_atelier' } as const
    return null
  }, [
    area,
    isChallengeOpen,
    isFarmOpen,
    isFactoryOpen,
    isSecurityHubOpen,
    isProgrammingHubOpen,
    isDesignAtelierOpen,
    isLessonOpen,
    outsideAtelier.entrance.x,
    outsideAtelier.entrance.y,
    player.x,
    player.y,
  ])

  useEffect(() => {
    nearbyDesignAtelierRef.current = nearbyDesignAtelier
  }, [nearbyDesignAtelier])

  const nearbyAtelierStation = useMemo(() => {
    if (area !== 'design_atelier') return null
    if (isChallengeOpen || isLessonOpen || isFarmOpen || isFactoryOpen || isSecurityHubOpen || isProgrammingHubOpen || isDesignAtelierOpen || isDialogOpen) {
      return null
    }

    const playerCenterX = player.x + 32
    const playerCenterY = player.y + 32

    let closest: { id: string; name: string; emoji: string; position: { x: number; y: number } } | null = null
    let closestDist = LEARNING_INTERACTION_DISTANCE

    for (const s of atelierStations) {
      const dx = playerCenterX - s.position.x
      const dy = playerCenterY - s.position.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < closestDist) {
        closest = { id: s.id, name: s.name, emoji: s.emoji, position: s.position }
        closestDist = dist
      }
    }

    return closest
  }, [
    area,
    atelierStations,
    isChallengeOpen,
    isDesignAtelierOpen,
    isDialogOpen,
    isFarmOpen,
    isFactoryOpen,
    isLessonOpen,
    isProgrammingHubOpen,
    isSecurityHubOpen,
    player.x,
    player.y,
  ])

  useEffect(() => {
    nearbyAtelierStationRef.current = nearbyAtelierStation
  }, [nearbyAtelierStation])

  const buildingTargets = useMemo<
    { type: 'code_farm' | 'n8n_factory' | 'security_hub' | 'programming_hub' | 'ui_ux_atelier'; x: number; y: number }[]
  >(() => {
    if (area !== 'outside') return []
    return [
      { type: 'code_farm', x: outsideCodeFarm.entrance.x, y: outsideCodeFarm.entrance.y },
      { type: 'n8n_factory', x: outsideN8nFactory.entrance.x, y: outsideN8nFactory.entrance.y },
      { type: 'security_hub', x: outsideSecurityHub.entrance.x, y: outsideSecurityHub.entrance.y },
      { type: 'programming_hub', x: outsideProgrammingHub.entrance.x, y: outsideProgrammingHub.entrance.y },
      { type: 'ui_ux_atelier', x: outsideAtelier.entrance.x, y: outsideAtelier.entrance.y },
    ]
  }, [
    area,
    outsideCodeFarm.entrance.x,
    outsideCodeFarm.entrance.y,
    outsideN8nFactory.entrance.x,
    outsideN8nFactory.entrance.y,
    outsideSecurityHub.entrance.x,
    outsideSecurityHub.entrance.y,
    outsideProgrammingHub.entrance.x,
    outsideProgrammingHub.entrance.y,
    outsideAtelier.entrance.x,
    outsideAtelier.entrance.y,
  ])

  const nearbyLearningStation = useMemo(() => {
    if (isChallengeOpen || isLessonOpen || isFarmOpen) return null

    const playerCenterX = player.x + 32
    const playerCenterY = player.y + 32

    let closest: LearningStation | null = null
    let closestDist = LEARNING_INTERACTION_DISTANCE

    const availableStations = learningStations.filter(s => (s.area || 'ai_university') === area)

    for (const s of availableStations) {
      if (completedLessonStationIds.includes(s.id)) continue
      const dx = playerCenterX - s.position.x
      const dy = playerCenterY - s.position.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < closestDist) {
        closest = s
        closestDist = dist
      }
    }

    return closest
  }, [area, completedLessonStationIds, isChallengeOpen, isFarmOpen, isLessonOpen, learningStations, player.x, player.y])

  useEffect(() => {
    nearbyLearningStationRef.current = nearbyLearningStation
  }, [nearbyLearningStation])

  const allAgents = useMemo<AgentNPC[]>(() => {
    const builtinsOutside = [...AGENTS, ...FUTURE_AGENTS].map((a) => ({ ...a, spawnArea: 'outside' as const }))
    const builtinsLab = LAB_AGENTS.map((a) => ({ ...a, spawnArea: 'ai_labor' as const }))
    const customs = customAgents.map((a) => ({ ...a, spawnArea: (a.spawnArea ?? 'outside') as WorldArea }))
    return [...builtinsOutside, ...builtinsLab, ...customs]
  }, [customAgents])

  const placeNpcsOnPlaza = useCallback(
    (agents: AgentNPC[]) => {
      if (agents.length === 0) return agents
      const anchoredIds = new Set(['factory-npc-otto', 'security-npc-shield', 'creative-agent', 'moltbot-crab'])
      const plazaAgents = agents.filter((npc) => !anchoredIds.has(npc.id))
      const anchoredAgents = agents.filter((npc) => anchoredIds.has(npc.id))
      const padding = 18
      const innerW = Math.max(64, outsideNpcPlazaRect.w - padding * 2)
      const innerH = Math.max(64, outsideNpcPlazaRect.h - padding * 2)
      const cols = Math.min(6, Math.max(2, Math.ceil(Math.sqrt(plazaAgents.length || 1))))
      const rows = Math.ceil((plazaAgents.length || 1) / cols)
      const cellW = innerW / cols
      const cellH = innerH / rows

      const placedPlaza = plazaAgents.map((npc, index) => {
        const col = index % cols
        const row = Math.floor(index / cols)
        const centerX = outsideNpcPlazaRect.x + padding + cellW * 0.5 + col * cellW
        const centerY = outsideNpcPlazaRect.y + padding + cellH * 0.5 + row * cellH
        return {
          ...npc,
          position: {
            x: centerX - 24,
            y: centerY - 24,
          },
        }
      })

      const colsCount = Math.ceil(OUTSIDE_WORLD_WIDTH / TILE_SIZE)
      const rowsCount = Math.ceil(OUTSIDE_WORLD_HEIGHT / TILE_SIZE)
      const pathCenterX = Math.floor(colsCount / 2) * TILE_SIZE + 16
      const pathCenterY = Math.floor(rowsCount / 2) * TILE_SIZE + 16

      const anchoredPlaced = anchoredAgents.map((npc) => {
        if (npc.id !== 'moltbot-crab') return npc
        // Moltbot unten links platzieren
        return {
          ...npc,
          position: { x: 150, y: 850 },
        }
      })

      return [...anchoredPlaced, ...placedPlaza]
    },
    [outsideNpcPlazaRect]
  )

  // Clamp NPCs into the world bounds
  const npcs = useMemo(() => {
    const base = allAgents.filter((a) => (a.spawnArea ?? 'outside') === area)
    const placed = area === 'outside' ? placeNpcsOnPlaza(base) : base
    return placed.map((npc) => ({
      ...npc,
      position: {
        x: Math.max(20, Math.min(worldConfig.worldWidth - 68, npc.position.x)),
        y: Math.max(20, Math.min(worldConfig.worldHeight - 88, npc.position.y)),
      },
    }))
  }, [allAgents, area, placeNpcsOnPlaza, worldConfig.worldHeight, worldConfig.worldWidth])

  // Load NPC sprites (from cache or generate on-demand)
  const { sprites: npcSprites, isLoading: npcSpritesLoading } = useNpcSprites(npcs)

  const nearbyNPC = useMemo(() => {
    if (isChallengeOpen || isLessonOpen || isFarmOpen) return null

    let closest: AgentNPC | null = null
    let closestDist = NPC_INTERACTION_DISTANCE

    for (const npc of npcs) {
      const dx = (player.x + 32) - (npc.position.x + 24)
      const dy = (player.y + 32) - (npc.position.y + 24)
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < closestDist) {
        closest = npc
        closestDist = dist
      }
    }

    return closest
  }, [isChallengeOpen, isFarmOpen, isLessonOpen, npcs, player.x, player.y])

  useEffect(() => {
    nearbyNPCRef.current = nearbyNPC
  }, [nearbyNPC])

  useEffect(() => {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(MOB_DEFEATED_STORAGE_KEY, JSON.stringify(defeatedMobIds))
  }, [defeatedMobIds])

  useEffect(() => {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(LESSONS_COMPLETED_STORAGE_KEY, JSON.stringify(completedLessonStationIds))
  }, [completedLessonStationIds])

  const baseMobs = useMemo(() => {
    if (area !== 'outside') return []
    return [...MOBS, ...spawnedMobs]
  }, [area, spawnedMobs])

  const clampMobPos = useCallback((p: { x: number; y: number }) => {
    return {
      x: Math.max(20, Math.min(worldConfig.worldWidth - 68, p.x)),
      y: Math.max(20, Math.min(worldConfig.worldHeight - 88, p.y)),
    }
  }, [worldConfig.worldHeight, worldConfig.worldWidth])

  // Track dynamic mob positions so they can wander a bit.
  // We use a ref-map + a small "version" state to trigger re-render,
  // avoiding "sync setState in effect" patterns.
  const mobPositionsRef = useRef<Record<string, { x: number; y: number }>>({})
  const [mobWanderVersion, setMobWanderVersion] = useState(0)

  // Occasionally move mobs (simple random walk).
  useEffect(() => {
    if (area !== 'outside') return
    // Pause wandering while dialogs/menus are open to avoid weird interaction edge-cases.
    if (isDialogOpen || isChallengeOpen || isLessonOpen || isFarmOpen) return
    if (baseMobs.length === 0) return

    const tickMs = 1500 // Slower tick for better performance
    const moveChance = 0.25 // Lower chance = fewer updates = smoother

    const timer = window.setInterval(() => {
      const prev = mobPositionsRef.current
      let changed = false
      const next: Record<string, { x: number; y: number }> = { ...prev }

      for (const mob of baseMobs) {
        if (defeatedMobIds.includes(mob.id)) continue
        if (Math.random() > moveChance) continue

        const cur = prev[mob.id] ?? mob.position
        const step = Math.random() < 0.25 ? 14 : 10
        const dirs = [
          { dx: 1, dy: 0 },
          { dx: -1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: 0, dy: -1 },
          { dx: 1, dy: 1 },
          { dx: -1, dy: 1 },
          { dx: 1, dy: -1 },
          { dx: -1, dy: -1 },
        ]
        const d = dirs[(Math.random() * dirs.length) | 0]!
        const proposed = clampMobPos({ x: cur.x + d.dx * step, y: cur.y + d.dy * step })

        if (proposed.x !== cur.x || proposed.y !== cur.y) {
          next[mob.id] = proposed
          changed = true
        }
      }

      if (changed) {
        mobPositionsRef.current = next
        setMobWanderVersion((v) => (v + 1) % 1_000_000_000)
      }
    }, tickMs)

    return () => window.clearInterval(timer)
  }, [
    area,
    baseMobs,
    clampMobPos,
    defeatedMobIds,
    isChallengeOpen,
    isDialogOpen,
    isFarmOpen,
    isLessonOpen,
  ])

  const mobs = useMemo(() => {
    if (area !== 'outside') return []
    return baseMobs.map((mob) => ({
      ...mob,
      defeated: defeatedMobIds.includes(mob.id),
      position: clampMobPos(mobPositionsRef.current[mob.id] ?? mob.position),
    }))
  }, [area, baseMobs, clampMobPos, defeatedMobIds, mobWanderVersion])

  // Load Mob sprites (from public/sprites/mobs/)
  const { sprites: mobSpritesRaw } = useMobSprites(mobs)
  
  // Create a Map that maps mob IDs to their sprites (handling the type-based lookup)
  const mobSprites = useMemo(() => {
    const result = new Map<string, typeof mobSpritesRaw extends Map<string, infer V> ? V : never>()
    for (const mob of mobs) {
      const typeId = getMobSpriteKey(mob)
      const sprite = mobSpritesRaw.get(typeId)
      if (sprite) {
        result.set(mob.id, sprite)
      }
    }
    return result
  }, [mobs, mobSpritesRaw])

  const nearbyMob = useMemo(() => {
    if (isChallengeOpen || isLessonOpen || isFarmOpen) return null

    let closest: (Mob & { defeated?: boolean }) | null = null
    let closestDist = MOB_INTERACTION_DISTANCE

    for (const mob of mobs) {
      if (mob.defeated) continue
      const dx = (player.x + 32) - (mob.position.x + 24)
      const dy = (player.y + 32) - (mob.position.y + 24)
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < closestDist) {
        closest = mob
        closestDist = dist
      }
    }

    return closest
  }, [isChallengeOpen, isFarmOpen, isLessonOpen, mobs, player.x, player.y])

  useEffect(() => {
    nearbyMobRef.current = nearbyMob
  }, [nearbyMob])

  const activeMob = useMemo(() => {
    if (!activeMobId) return null
    return mobs.find((m) => m.id === activeMobId) ?? null
  }, [activeMobId, mobs])

  const spawnFarmMobs = useCallback((level: number, theme: ChallengeTheme | 'random', count: number) => {
    const validCount = Math.max(1, Math.min(5, Number.isFinite(count) ? Math.floor(count) : 1))
    const validLevel = Math.max(1, Math.min(10, Number.isFinite(level) ? Math.floor(level) : 1))
    const dims = getWorldDims('outside')

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

    const THEMES: ChallengeTheme[] = ['strings', 'arrays', 'math', 'algorithms']

    const makeId = (i: number) => {
      const maybeCrypto = globalThis.crypto as (Crypto & { randomUUID?: () => string }) | undefined
      const base = maybeCrypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
      return `farm-lv${validLevel}-${base}-${i}`
    }

    const clamp = (p: { x: number; y: number }) => ({
      x: Math.max(20, Math.min(dims.worldWidth - 68, p.x)),
      y: Math.max(20, Math.min(dims.worldHeight - 88, p.y)),
    })

    const base = outsideCodeFarm.spawnPoint
    const next: Mob[] = Array.from({ length: validCount }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const r = 22 + i * 16 + Math.random() * 20
      const pos = clamp({ x: base.x + Math.cos(angle) * r, y: base.y + Math.sin(angle) * r })

      // Pick random appearance based on level range
      const appearanceIndex = Math.min(validLevel - 1 + Math.floor(Math.random() * 2), MOB_APPEARANCES.length - 1)
      const appearance = MOB_APPEARANCES[appearanceIndex]

      // Pick theme (random if 'random', else specific)
      const selectedTheme: ChallengeTheme = theme === 'random'
        ? THEMES[Math.floor(Math.random() * THEMES.length)]
        : theme

      return generateMob(
        makeId(i),
        appearance.baseName,
        appearance.emoji,
        pos,
        validLevel,
        selectedTheme
      )
    })

    setSpawnedMobs((prev) => [...prev, ...next])
  }, [outsideCodeFarm.spawnPoint])

  const clearFarmMobs = useCallback(() => {
    setSpawnedMobs([])
  }, [])

  const awardXp = useCallback((amount: number) => {
    if (typeof window === 'undefined') return
    if (!Number.isFinite(amount) || amount <= 0) return
    setCharacterStats((prev) => {
      const next = applyXpReward(prev, amount)
      try {
        sessionStorage.setItem(CHARACTER_STATS_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  const makeCustomAgentId = useCallback(() => {
    const maybeCrypto = globalThis.crypto as (Crypto & { randomUUID?: () => string }) | undefined
    return `custom-${maybeCrypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`
  }, [])

  const placeCustomAgent = useCallback(
    (agent: AgentNPC, options?: { preferNear?: { x: number; y: number }; areaOverride?: WorldArea }) => {
      const targetArea = options?.areaOverride ?? agent.spawnArea ?? area
      const dims = getWorldDims(targetArea)
      const near =
        options?.preferNear ??
        (targetArea === area
          ? { x: player.x + 96, y: player.y + 12 }
          : { x: dims.worldWidth / 2 - 32, y: dims.worldHeight / 2 - 32 })

      const clamped = {
        x: Math.max(20, Math.min(dims.worldWidth - 68, near.x)),
        y: Math.max(20, Math.min(dims.worldHeight - 88, near.y)),
      }

      setCustomAgents((prev) => {
        if (prev.some((a) => a.id === agent.id)) return prev
        return [...prev, { ...agent, spawnArea: targetArea, position: clamped }]
      })
    },
    [area, player.x, player.y]
  )

  // Loading state
  if (spriteLoading) {
    return (
      <AppLoadingScreen
        title="Loading World"
        subtitle="Building terrain • Spawning NPCs • Preparing dialogs"
      />
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* Aceternity-style backdrop */}
      <BackgroundBeams className="opacity-55" />
      <BackgroundGrid className="opacity-30" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.55),transparent_60%)]"
      />

      {/* World Container */}
      <div className="relative z-10 w-screen h-screen min-h-dvh">
        {/* Game Canvas */}
        <GameCanvas
          worldConfig={worldConfig}
          player={player}
          spriteSheet={spriteSheet}
          npcs={npcs}
          nearbyNPC={nearbyNPC}
          npcSprites={npcSprites}
          onNpcClick={(npcId) => {
            if (isDialogOpen || isChallengeOpen || isLessonOpen) return
            const npc = npcs.find((n) => n.id === npcId)
            if (!npc) return
            setActiveAgent(npc)
            setIsDialogOpen(true)
          }}
          mobs={mobs}
          nearbyMob={nearbyMob}
          mobSprites={mobSprites}
          learningStations={learningStations.filter(s => (s.area || 'ai_university') === area)}
          nearbyLearningStation={nearbyLearningStation}
          completedLearningStationIds={completedLessonStationIds}
          onLearningStationClick={(stationId) => {
            setActiveLessonStationId(stationId)
            setIsLessonOpen(true)
          }}
          atelierStations={atelierStations}
          nearbyAtelierStation={nearbyAtelierStation}
          onAtelierStationClick={(stationId) => {
            setActiveDesignStationId(stationId)
            setIsDesignAtelierOpen(true)
          }}
          portalTargets={portalTargets}
          onPortalClick={(portalType) => {
            handlePortalInteraction(
              portalType as
              | 'enter_ai_university'
              | 'exit_ai_university'
              | 'enter_ai_labor'
              | 'exit_ai_labor'
              | 'exit_design_atelier'
              | 'enter_security_hub'
              | 'exit_security_hub'
            )
          }}
          buildingTargets={buildingTargets}
          onBuildingClick={(buildingType) => {
            handleBuildingInteraction(buildingType)
          }}
          interactionDistances={{
            npc: NPC_INTERACTION_DISTANCE,
            mob: MOB_INTERACTION_DISTANCE,
            portal: BUILDING_INTERACTION_DISTANCE,
            building: BUILDING_INTERACTION_DISTANCE,
          }}
          tileTheme={
            area === 'ai_university'
              ? 'ai_university'
              : area === 'ai_labor'
                ? 'ai_labor'
                : area === 'design_atelier'
                  ? 'design_atelier'
                  : area === 'security_hub'
                    ? 'security_hub'
                    : 'outdoor'
          }
          extraDecorations={area === 'outside' ? outsideExtraDecorations : area === 'design_atelier' ? atelierDecorations : undefined}
          worldMarkers={area === 'outside' ? outsideMarkers : []}
          roadTargets={area === 'outside' ? outsideRoadTargets : []}
          pathRects={area === 'outside' ? [outsideNpcPlazaRect] : []}
          onMobClick={(mobId) => {
            const mob = mobs.find(m => m.id === mobId)
            if (!mob || mob.defeated) return
            setActiveMobId(mobId)
            setIsChallengeOpen(true)
          }}
        />

        {/* HUD */}
        <GameHUD
          characterName={agentName}
          characterStats={characterStats}
          allAgents={allAgents}
          customAgents={customAgents}
          currentArea={area}
          onAddCustomAgent={(agent) => {
            placeCustomAgent(agent)
          }}
          onDeleteCustomAgent={(agentId) => {
            setCustomAgents((prev) => prev.filter((a) => a.id !== agentId))
          }}
        />

        <WorldOverlays
          area={area}
          isFarmer={isFarmer}
          learningStations={learningStations}
          completedLessonStationIds={completedLessonStationIds}
          onStationClick={(stationId) => {
            setActiveLessonStationId(stationId)
            setIsLessonOpen(true)
          }}
        />

        <GamePrompts
          nearbyNPC={nearbyNPC}
          nearbyMob={nearbyMob}
          nearbyPortal={nearbyPortal}
          nearbyCodeFarm={nearbyCodeFarm}
          nearbyN8nFactory={nearbyN8nFactory}
          nearbySecurityHub={nearbySecurityHub}
          nearbyProgrammingHub={nearbyProgrammingHub}
          nearbyDesignAtelier={nearbyDesignAtelier}
          nearbyAtelierStation={nearbyAtelierStation}
          nearbyLearningStation={nearbyLearningStation}
          isDialogOpen={isDialogOpen}
          isChallengeOpen={isChallengeOpen}
          isLessonOpen={isLessonOpen}
          isFarmOpen={isFarmOpen}
          isProgrammingHubOpen={isProgrammingHubOpen}
          isDesignAtelierOpen={isDesignAtelierOpen}
        />

        {/* Mobile Controls */}
        <MobileControls
          onMove={handleMobileMove}
          onInteract={handleInteract}
          onAttack={area === 'outside' ? handleAttack : undefined}
          disabled={isChallengeOpen || isLessonOpen || isFarmOpen}
          zIndexClassName={isDialogOpen || isLessonOpen ? 'z-[60]' : 'z-40'}
        />
      </div>

      {/* RPG Dialog */}
      <RPGDialog
        agent={activeAgent}
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setActiveAgent(null)
        }}
      />

      <MobChallengeDialog
        mob={activeMob}
        open={isChallengeOpen}
        onOpenChange={(open) => {
          setIsChallengeOpen(open)
          if (!open) setActiveMobId(null)
        }}
        onDefeated={(mobId, rewardXp) => {
          setDefeatedMobIds((prev) => (prev.includes(mobId) ? prev : [...prev, mobId]))
          awardXp(rewardXp)
        }}
      />

      <LessonDialog
        station={activeLessonStation}
        open={isLessonOpen}
        completed={!!activeLessonStation && completedLessonStationIds.includes(activeLessonStation.id)}
        onOpenChange={(open) => {
          setIsLessonOpen(open)
          if (!open) setActiveLessonStationId(null)
        }}
        onComplete={(stationId) => {
          const station = learningStations.find((s) => s.id === stationId)
          if (!station) return
          setCompletedLessonStationIds((prev) => {
            if (prev.includes(stationId)) return prev
            awardXp(station.rewardXp)
            return [...prev, stationId]
          })
        }}
      />

      <CodeFarmDialog
        open={isFarmOpen}
        onOpenChange={(open) => setIsFarmOpen(open)}
        onSpawn={spawnFarmMobs}
        onClearSpawned={clearFarmMobs}
        spawnedCount={spawnedMobs.length}
      />

      <N8nFactoryDialog
        open={isFactoryOpen}
        onOpenChange={(open) => setIsFactoryOpen(open)}
        onCreateWebhookAgent={(config) => {
          const spawnArea = 'outside' as const
          placeCustomAgent(
            {
              id: makeCustomAgentId(),
              name: config.name,
              role: config.role,
              gender: config.gender,
              systemInstruction: `You are ${config.name}, a webhook-based agent. ${config.role}`,
              avatar: config.emoji,
              greeting: config.greeting,
              spawnArea,
              position: { x: 0, y: 0 },
              webhookUrl: config.webhookUrl,
              spriteSheetBase64: config.spriteSheetBase64,
            },
            {
              areaOverride: spawnArea,
              preferNear: { x: outsideN8nFactory.entrance.x - 32, y: outsideN8nFactory.entrance.y + 24 },
            }
          )
        }}
      />

      <SecurityHubDialog
        open={isSecurityHubOpen}
        onOpenChange={(open) => setIsSecurityHubOpen(open)}
      />

      <ProgrammingHubDialog
        open={isProgrammingHubOpen}
        onOpenChange={(open) => setIsProgrammingHubOpen(open)}
        onSummonAgent={(agent) => {
          const spawnArea: WorldArea = 'outside'
          placeCustomAgent(
            {
              id: makeCustomAgentId(),
              name: agent.name,
              role: agent.role,
              gender: agent.gender,
              systemInstruction: agent.systemInstruction,
              avatar: agent.emoji,
              greeting: agent.greeting,
              spawnArea,
              position: { x: 0, y: 0 },
            },
            {
              areaOverride: spawnArea,
              preferNear: { x: outsideProgrammingHub.entrance.x - 32, y: outsideProgrammingHub.entrance.y + 12 },
            }
          )
        }}
      />

      <DesignAtelierDialog
        open={isDesignAtelierOpen}
        initialStationId={activeDesignStationId}
        onOpenChange={(open) => {
          setIsDesignAtelierOpen(open)
          if (!open) setActiveDesignStationId(null)
        }}
      />

    </div>
  )
}
