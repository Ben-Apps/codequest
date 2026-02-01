'use client'

import { useEffect, useRef, useMemo, useCallback } from 'react'
import type { PointerEvent } from 'react'
import type { WorldConfig, PlayerState, SpriteSheet, AgentNPC, Mob, LearningStation, WorldMarker } from '@/types'
import { generateTiles, renderTiles } from '@/lib/tiles'
import type { Decoration, Rect } from '@/lib/decorations'
import { generateDecorationsWithTheme, drawDecoration, getDecorationBounds } from '@/lib/decorations'
import { drawFrame } from '@/lib/sprite-utils'

interface GameCanvasProps {
  worldConfig: WorldConfig
  player: PlayerState
  spriteSheet: SpriteSheet | null
  npcs: AgentNPC[]
  nearbyNPC: AgentNPC | null
  onNpcClick?: (npcId: string) => void
  /** Map of NPC ID to their SpriteSheet for sprite-based rendering */
  npcSprites?: Map<string, SpriteSheet>
  mobs?: Array<Mob & { defeated?: boolean }>
  nearbyMob?: (Mob & { defeated?: boolean }) | null
  onMobClick?: (mobId: string) => void
  /** Map of Mob ID to their SpriteSheet for sprite-based rendering */
  mobSprites?: Map<string, SpriteSheet>
  learningStations?: LearningStation[]
  nearbyLearningStation?: LearningStation | null
  completedLearningStationIds?: string[]
  onLearningStationClick?: (stationId: string) => void
  atelierStations?: Array<{ id: string; name: string; emoji: string; position: { x: number; y: number } }>
  nearbyAtelierStation?: { id: string; name: string; emoji: string; position: { x: number; y: number } } | null
  onAtelierStationClick?: (stationId: string) => void
  portalTargets?: Array<{ type: string; x: number; y: number }>
  onPortalClick?: (portalType: string) => void
  buildingTargets?: Array<{
    type: 'code_farm' | 'n8n_factory' | 'security_hub' | 'programming_hub' | 'ui_ux_atelier'
    x: number
    y: number
  }>
  onBuildingClick?: (
    buildingType: 'code_farm' | 'n8n_factory' | 'security_hub' | 'programming_hub' | 'ui_ux_atelier'
  ) => void
  interactionDistances?: {
    npc: number
    mob: number
    portal: number
    building: number
  }
  tileTheme?: 'outdoor' | 'ai_university' | 'ai_labor' | 'design_atelier' | 'security_hub'
  extraDecorations?: Decoration[]
  worldMarkers?: WorldMarker[]
  roadTargets?: Array<{ x: number; y: number }>
  pathRects?: Rect[]
}

export function GameCanvas({
  worldConfig,
  player,
  spriteSheet,
  npcs,
  nearbyNPC,
  onNpcClick,
  npcSprites = new Map(),
  mobs = [],
  nearbyMob = null,
  onMobClick,
  mobSprites = new Map(),
  learningStations = [],
  nearbyLearningStation = null,
  completedLearningStationIds = [],
  onLearningStationClick,
  atelierStations = [],
  nearbyAtelierStation = null,
  onAtelierStationClick,
  portalTargets = [],
  onPortalClick,
  buildingTargets = [],
  onBuildingClick,
  interactionDistances = {
    npc: 80,
    mob: 92,
    portal: 86,
    building: 86,
  },
  tileTheme = 'outdoor',
  extraDecorations = [],
  worldMarkers = [],
  roadTargets = [],
  pathRects = [],
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cameraRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Use stable keys so decoration generation doesn't rerun when mobs "wander".
  const npcKey = useMemo(() => npcs.map((n) => n.id).join('|'), [npcs])
  const mobKey = useMemo(() => mobs.map((m) => m.id).join('|'), [mobs])

  // Memoize tiles
  const tiles = useMemo(
    () =>
      generateTiles(worldConfig.worldWidth, worldConfig.worldHeight, tileTheme, {
        roadTargets,
        pathRects,
      }),
    [roadTargets, worldConfig.worldWidth, worldConfig.worldHeight, pathRects, tileTheme]
  )

  const reservedRects: Rect[] = useMemo(() => {
    const rects: Rect[] = []

    // Nur feste Gebäude und wichtige Orte reservieren, damit Dekorationen stabil bleiben.
    // NPCs und Mobs werden ignoriert, da sie sich bewegen oder dynamisch sind.

    // Reserve space for feste Gebäude (University/Labor/Forge)
    for (const d of extraDecorations) {
      rects.push(getDecorationBounds(d))
    }

    // Reserve learning stations a bit too (damit sie nicht in Häusern verschwinden).
    if (tileTheme !== 'ai_university') {
      for (const s of learningStations) {
        rects.push({ x: s.position.x - 18, y: s.position.y - 50, w: 36, h: 60 })
      }
    }

    return rects
  }, [extraDecorations, learningStations, tileTheme])

  const decorations: Decoration[] = useMemo(() => {
    const base = generateDecorationsWithTheme(tiles, tileTheme, { reservedRects })
    return extraDecorations.length ? [...base, ...extraDecorations] : base
  }, [extraDecorations, reservedRects, tileTheme, tiles])

  const handlePointerDown = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return

    const sx = ((e.clientX - rect.left) / rect.width) * worldConfig.viewportWidth
    const sy = ((e.clientY - rect.top) / rect.height) * worldConfig.viewportHeight
    const wx = sx + cameraRef.current.x
    const wy = sy + cameraRef.current.y

    const playerCenterX = player.x + 32
    const playerCenterY = player.y + 32
    const playerWithin = (x: number, y: number, maxDist: number) => {
      const dx = playerCenterX - x
      const dy = playerCenterY - y
      return Math.sqrt(dx * dx + dy * dy) <= maxDist
    }

    // 1) Learning station marker click (prefer this when user taps the "!").
    if (onLearningStationClick && learningStations.length) {
      const candidates = learningStations
        .filter((s) => !completedLearningStationIds.includes(s.id))
        .map((s) => {
          const markerX = s.position.x
          const markerY = s.position.y - 38
          const dx = wx - markerX
          const dy = wy - markerY
          return { station: s, dist: Math.sqrt(dx * dx + dy * dy) }
        })
        .sort((a, b) => a.dist - b.dist)[0]

      if (candidates && candidates.dist <= 22) {
        onLearningStationClick(candidates.station.id)
        return
      }
    }

    // 1b) Atelier object marker click
    if (onAtelierStationClick && atelierStations.length) {
      const candidates = atelierStations
        .map((s) => {
          const markerX = s.position.x
          const markerY = s.position.y - 34
          const dx = wx - markerX
          const dy = wy - markerY
          return { station: s, dist: Math.sqrt(dx * dx + dy * dy) }
        })
        .sort((a, b) => a.dist - b.dist)[0]

      if (candidates && candidates.dist <= 22 && playerWithin(candidates.station.position.x, candidates.station.position.y, interactionDistances.building)) {
        onAtelierStationClick(candidates.station.id)
        return
      }
    }

    // 2) Mob click (if enabled)
    if (onMobClick) {
      const hit = mobs
        .filter(m => !m.defeated)
        .map(m => {
          const cx = m.position.x + 24
          const cy = m.position.y + 26
          const dx = wx - cx
          const dy = wy - cy
          return { mob: m, dist: Math.sqrt(dx * dx + dy * dy) }
        })
        .sort((a, b) => a.dist - b.dist)[0]

      if (hit && hit.dist <= 46) {
        onMobClick(hit.mob.id)
        return
      }
    }

    // 3) NPC click (open dialog if nearby)
    if (onNpcClick && npcs.length) {
      const npcHit = npcs
        .map(npc => {
          const cx = npc.position.x + 24
          const cy = npc.position.y + 24
          const dx = wx - cx
          const dy = wy - cy
          return { npc, dist: Math.sqrt(dx * dx + dy * dy), cx, cy }
        })
        .sort((a, b) => a.dist - b.dist)[0]

      if (npcHit && npcHit.dist <= 40 && playerWithin(npcHit.cx, npcHit.cy, interactionDistances.npc)) {
        onNpcClick(npcHit.npc.id)
        return
      }
    }

    // 4) Portal click (enter/exit if nearby)
    if (onPortalClick && portalTargets.length) {
      const portalHit = portalTargets
        .map((p) => {
          const dx = wx - p.x
          const dy = wy - p.y
          return { portal: p, dist: Math.sqrt(dx * dx + dy * dy) }
        })
        .sort((a, b) => a.dist - b.dist)[0]

      if (portalHit && portalHit.dist <= 44 && playerWithin(portalHit.portal.x, portalHit.portal.y, interactionDistances.portal)) {
        onPortalClick(portalHit.portal.type)
        return
      }
    }

    // 5) Building click (open if nearby)
    if (onBuildingClick && buildingTargets.length) {
      const buildingHit = buildingTargets
        .map((b) => {
          const dx = wx - b.x
          const dy = wy - b.y
          return { building: b, dist: Math.sqrt(dx * dx + dy * dy) }
        })
        .sort((a, b) => a.dist - b.dist)[0]

      if (
        buildingHit &&
        buildingHit.dist <= 46 &&
        playerWithin(buildingHit.building.x, buildingHit.building.y, interactionDistances.building)
      ) {
        onBuildingClick(buildingHit.building.type)
      }
    }
  }, [
    atelierStations,
    completedLearningStationIds,
    interactionDistances.building,
    interactionDistances.npc,
    interactionDistances.portal,
    learningStations,
    mobs,
    npcs,
    onBuildingClick,
    onAtelierStationClick,
    onLearningStationClick,
    onNpcClick,
    onMobClick,
    onPortalClick,
    player.x,
    player.y,
    portalTargets,
    worldConfig.viewportHeight,
    worldConfig.viewportWidth,
    buildingTargets,
  ])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Match canvas backing store to DPR for crisp rendering
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    canvas.width = Math.floor(worldConfig.viewportWidth * dpr)
    canvas.height = Math.floor(worldConfig.viewportHeight * dpr)
    canvas.style.width = `${worldConfig.viewportWidth}px`
    canvas.style.height = `${worldConfig.viewportHeight}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Clear canvas (in CSS pixels)
    ctx.clearRect(0, 0, worldConfig.viewportWidth, worldConfig.viewportHeight)

    const viewW = worldConfig.viewportWidth
    const viewH = worldConfig.viewportHeight
    const worldW = worldConfig.worldWidth
    const worldH = worldConfig.worldHeight

    // Kamera: folgt dem Spieler, aber bleibt innerhalb der Welt.
    const playerCenterX = player.x + 32
    const playerCenterY = player.y + 32
    const maxCamX = Math.max(0, worldW - viewW)
    const maxCamY = Math.max(0, worldH - viewH)
    const cameraX = Math.max(0, Math.min(maxCamX, playerCenterX - viewW / 2))
    const cameraY = Math.max(0, Math.min(maxCamY, playerCenterY - viewH / 2))
    cameraRef.current = { x: cameraX, y: cameraY }

    // 1. Render world (tiles + objects) in world-coordinates with camera offset
    ctx.save()
    ctx.translate(-cameraX, -cameraY)
    renderTiles(ctx, tiles, viewW, viewH, cameraX, cameraY)

    const fillRoundedRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) => {
      const radius = Math.max(0, Math.min(r, w / 2, h / 2))
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + w - radius, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
      ctx.lineTo(x + w, y + h - radius)
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
      ctx.lineTo(x + radius, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
      ctx.fill()
    }

    const drawNpc = (npc: AgentNPC, isNearby: boolean) => {
      const npcSpriteSheet = npcSprites.get(npc.id)

      // NPC Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'
      ctx.beginPath()
      ctx.ellipse(npc.position.x + 24, npc.position.y + 46, 16, 6, 0, 0, Math.PI * 2)
      ctx.fill()

      if (npcSpriteSheet) {
        // Sprite-based rendering
        const animation = npcSpriteSheet.animations.walk_down
        if (animation && animation.frames[0]) {
          const frame = animation.frames[0] // Idle = first frame of walk_down
          // Center the sprite on the NPC position
          const spriteX = npc.position.x - 8
          const spriteY = npc.position.y - 16
          drawFrame(ctx, npcSpriteSheet, frame, spriteX, spriteY, 0.5)
        }
      } else {
        // Fallback: Emoji-box rendering
        // NPC Body
        ctx.fillStyle = isNearby ? '#10b981' : '#6b7280'
        fillRoundedRect(npc.position.x + 8, npc.position.y + 16, 32, 28, 9)

        // NPC Head
        ctx.fillStyle = '#fcd34d'
        ctx.beginPath()
        ctx.arc(npc.position.x + 24, npc.position.y + 12, 14, 0, Math.PI * 2)
        ctx.fill()

        // NPC Avatar (emoji)
        ctx.font = '24px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(npc.avatar, npc.position.x + 24, npc.position.y + 12)
      }

      // Name tag
      ctx.save()
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0,0,0,0.75)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 1
      ctx.fillStyle = isNearby ? '#f5f3ff' : '#ffffff'
      ctx.fillText(npc.name, npc.position.x + 24, npc.position.y + 58)
      ctx.restore()

      // Highlight ring if nearby
      if (isNearby) {
        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.ellipse(npc.position.x + 24, npc.position.y + 24, 28, 28, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    const hashSeed = (s: string) => {
      let h = 0
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
      return (h >>> 0) / 0xffffffff
    }

    // Pre-calculate bob offset once per frame (optimization)
    const frameTime = typeof performance !== 'undefined' ? performance.now() : Date.now()

    const drawMob = (mob: Mob & { defeated?: boolean }, isNearby: boolean) => {
      // Use cached frame time instead of calling performance.now() for each mob
      const seed = hashSeed(mob.id)
      const bob = Math.sin(frameTime / 240 + seed * Math.PI * 2) * 3
      const mobSpriteSheet = mobSprites.get(mob.id)

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'
      ctx.beginPath()
      ctx.ellipse(mob.position.x + 24, mob.position.y + 46, 16, 6, 0, 0, Math.PI * 2)
      ctx.fill()

      if (mobSpriteSheet && !mob.defeated) {
        // Sprite-based rendering
        const animation = mobSpriteSheet.animations.walk_down
        if (animation && animation.frames[0]) {
          const frame = animation.frames[0]
          const spriteX = mob.position.x - 8
          const spriteY = mob.position.y - 16 + bob
          drawFrame(ctx, mobSpriteSheet, frame, spriteX, spriteY, 0.5)
        }
      } else {
        // Fallback: Emoji-box rendering
        // Body
        ctx.fillStyle = mob.defeated ? 'rgba(107,114,128,0.6)' : (isNearby ? '#ef4444' : '#111827')
        fillRoundedRect(mob.position.x + 8, mob.position.y + 18 + bob, 32, 28, 9)

        // Head
        ctx.fillStyle = mob.defeated ? 'rgba(156,163,175,0.8)' : '#fcd34d'
        ctx.beginPath()
        ctx.arc(mob.position.x + 24, mob.position.y + 12 + bob, 14, 0, Math.PI * 2)
        ctx.fill()

        // Emoji
        ctx.font = '24px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(mob.emoji, mob.position.x + 24, mob.position.y + 12 + bob)
      }

      // Name tag - truncate long names and use smaller font
      ctx.save()
      // Shorter display name: remove "Lv.X" suffix for display
      let displayName = mob.name.replace(/ Lv\.\d+$/, '')
      // Further shorten very long names
      if (displayName.length > 12) {
        displayName = displayName.slice(0, 10) + '..'
      }
      ctx.font = displayName.length > 10 ? 'bold 8px sans-serif' : 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = mob.defeated ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 1
      ctx.fillStyle = mob.defeated ? 'rgba(229,231,235,0.85)' : (isNearby ? '#fee2e2' : '#ffffff')
      ctx.fillText(displayName, mob.position.x + 24, mob.position.y + 58)
      ctx.restore()

      // Nearby ring
      if (isNearby && !mob.defeated) {
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.ellipse(mob.position.x + 24, mob.position.y + 26, 28, 28, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Defeated marker
      if (mob.defeated) {
        ctx.strokeStyle = 'rgba(239,68,68,0.9)'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(mob.position.x + 10, mob.position.y + 8)
        ctx.lineTo(mob.position.x + 38, mob.position.y + 36)
        ctx.moveTo(mob.position.x + 38, mob.position.y + 8)
        ctx.lineTo(mob.position.x + 10, mob.position.y + 36)
        ctx.stroke()
      }
    }

    const drawPlayer = () => {
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'
      ctx.beginPath()
      ctx.ellipse(player.x + 32, player.y + 60, 20, 8, 0, 0, Math.PI * 2)
      ctx.fill()

      if (spriteSheet) {
        const animation = spriteSheet.animations[player.animation]
        if (animation && animation.frames[player.currentFrame]) {
          const frame = animation.frames[player.currentFrame]
          drawFrame(ctx, spriteSheet, frame, player.x, player.y, 0.5)
        }
      } else {
        // Fallback player rendering if no sprite
        ctx.fillStyle = '#3b82f6'
        ctx.fillRect(player.x + 16, player.y + 24, 32, 32)
        ctx.fillStyle = '#fcd34d'
        ctx.beginPath()
        ctx.arc(player.x + 32, player.y + 16, 12, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // 2. Depth-sorted world objects (decorations + NPCs + player)
    const drawables: Array<{ y: number; draw: () => void }> = []

    const decorationBaselineY = (d: Decoration) => {
      switch (d.type) {
        case 'tree':
          return d.y + 52
        case 'house':
          return d.y + 64
        case 'desk':
          return d.y + 54
        case 'university':
          return d.y + 156
        case 'ai_labor':
          return d.y + 154
        case 'code_farm':
          return d.y + 156
        case 'n8n_factory':
          return d.y + 156
        case 'ui_ux_atelier':
          return d.y + 146
        case 'security_hub':
          return d.y + 150
        case 'programming_hub':
          return d.y + 156
        case 'server_rack':
          return d.y + 52
        case 'lab_bench':
          return d.y + 48
        case 'microscope':
          return d.y + 30
        case 'chem_set':
          return d.y + 22
        case 'whiteboard':
          return d.y + 42
        case 'incubator':
          return d.y + 46
        case 'atelier_easel':
          return d.y + 60
        case 'atelier_palette':
          return d.y + 34
        case 'atelier_sculpture':
          return d.y + 58
        case 'atelier_moodboard':
          return d.y + 48
        case 'bush':
          return d.y + 22
        case 'flower_patch':
          return d.y + 20
        case 'grass_tuft':
          return d.y + 18
        case 'fallen_log':
          return d.y + 18
        case 'rock':
        default:
          return d.y + 18
      }
    }

    for (const d of decorations) {
      // Baseline near the bottom of each object for better layering
      drawables.push({
        y: decorationBaselineY(d),
        draw: () => drawDecoration(ctx, d),
      })
    }

    for (const npc of npcs) {
      const isNearby = nearbyNPC?.id === npc.id
      drawables.push({
        y: npc.position.y + 46,
        draw: () => drawNpc(npc, !!isNearby),
      })
    }

    for (const mob of mobs) {
      const isNearby = nearbyMob?.id === mob.id
      drawables.push({
        y: mob.position.y + 46,
        draw: () => drawMob(mob, !!isNearby),
      })
    }

    drawables.push({
      y: player.y + 60,
      draw: () => drawPlayer(),
    })

    drawables.sort((a, b) => a.y - b.y)
    for (const item of drawables) item.draw()

    // 2b) World markers (on top of world objects, but below vignette)
    for (const marker of worldMarkers) {
      const t = typeof performance !== 'undefined' ? performance.now() : Date.now()
      const seed = marker.id.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 0)
      const bob = Math.sin(t / 300 + (seed % 1000)) * 2
      const x = marker.position.x
      const y = marker.position.y + bob

      // Glow
      ctx.fillStyle = 'rgba(245,158,11,0.22)'
      ctx.beginPath()
      ctx.arc(x, y, 12, 0, Math.PI * 2)
      ctx.fill()

      // Badge
      ctx.fillStyle = 'rgba(245,158,11,0.95)'
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.45)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Exclamation
      ctx.fillStyle = '#111827'
      ctx.font = 'bold 13px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(marker.label ?? '!', x, y + 0.5)
    }

    // 2c) Learning markers (on top of world objects, but below vignette)
    const t = typeof performance !== 'undefined' ? performance.now() : Date.now()
    for (const s of learningStations) {
      if (completedLearningStationIds.includes(s.id)) continue
      const seed = s.id.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 0)
      const bob = Math.sin(t / 260 + (seed % 1000)) * 3
      // Marker direkt über der Station-Position (Monitor) platzieren
      const x = s.position.x
      const y = s.position.y - 26 + bob
      const isNearby = nearbyLearningStation?.id === s.id

      // Glow
      ctx.fillStyle = isNearby ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.22)'
      ctx.beginPath()
      ctx.arc(x, y, 14, 0, Math.PI * 2)
      ctx.fill()

      // Badge
      ctx.fillStyle = isNearby ? 'rgba(16,185,129,0.95)' : 'rgba(245,158,11,0.92)'
      ctx.beginPath()
      ctx.arc(x, y, 9, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.45)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Exclamation
      ctx.fillStyle = '#111827'
      ctx.font = 'bold 14px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('!', x, y + 0.5)
    }

    // 2d) Atelier markers
    if (atelierStations.length) {
      for (const s of atelierStations) {
        const seed = s.id.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 0)
        const bob = Math.sin(t / 240 + (seed % 1000)) * 2
        const x = s.position.x
        const y = s.position.y - 34 + bob
        const isNearby = nearbyAtelierStation?.id === s.id

        ctx.fillStyle = isNearby ? 'rgba(236,72,153,0.28)' : 'rgba(236,72,153,0.2)'
        ctx.beginPath()
        ctx.arc(x, y, 12, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = isNearby ? 'rgba(236,72,153,0.95)' : 'rgba(236,72,153,0.85)'
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,0.45)'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.fillStyle = '#111827'
        ctx.font = 'bold 12px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(s.emoji ?? '✦', x, y + 0.5)
      }
    }

    // 2e) Exit portal markers (für Indoor-Bereiche)
    for (const portal of portalTargets) {
      if (!portal.type.startsWith('exit_')) continue
      const bob = Math.sin(t / 320) * 2
      const x = portal.x
      const y = portal.y + bob

      // Glow
      ctx.fillStyle = 'rgba(59, 130, 246, 0.25)'
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, Math.PI * 2)
      ctx.fill()

      // Outer ring
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, 16, 0, Math.PI * 2)
      ctx.stroke()

      // Inner circle
      ctx.fillStyle = 'rgba(59, 130, 246, 0.6)'
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.fill()

      // Arrow pointing down (exit indicator)
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.moveTo(x, y + 4)
      ctx.lineTo(x - 5, y - 2)
      ctx.lineTo(x + 5, y - 2)
      ctx.closePath()
      ctx.fill()

      // Label
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 9px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('EXIT', x, y + 22)
    }
    ctx.restore()

    // 3. Subtle vignette for depth
    const g = ctx.createRadialGradient(
      viewW / 2,
      viewH / 2,
      Math.min(viewW, viewH) * 0.2,
      viewW / 2,
      viewH / 2,
      Math.max(viewW, viewH) * 0.75
    )
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,0.25)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, viewW, viewH)

  }, [
    atelierStations,
    completedLearningStationIds,
    decorations,
    learningStations,
    mobs,
    mobSprites,
    nearbyAtelierStation?.id,
    nearbyLearningStation?.id,
    nearbyMob,
    nearbyNPC,
    npcSprites,
    npcs,
    player,
    spriteSheet,
    tiles,
    worldMarkers,
    worldConfig,
  ])

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
      style={{ imageRendering: 'pixelated' }}
      onPointerDown={handlePointerDown}
    />
  )
}
