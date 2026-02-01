import type { TileType } from '@/types'
import { TILE_SIZE } from '@/lib/tiles'

export type DecorationType =
  | 'tree'
  | 'rock'
  | 'bush'
  | 'flower_patch'
  | 'grass_tuft'
  | 'fallen_log'
  | 'house'
  | 'desk'
  | 'university'
  | 'ai_labor'
  | 'code_farm'
  | 'n8n_factory'
  | 'ui_ux_atelier'
  | 'security_hub'
  | 'programming_hub'
  | 'server_rack'
  // Labor-Innenraum
  | 'lab_bench'
  | 'microscope'
  | 'chem_set'
  | 'whiteboard'
  | 'incubator'
  // Atelier-Objekte
  | 'atelier_easel'
  | 'atelier_palette'
  | 'atelier_sculpture'
  | 'atelier_moodboard'

export interface Decoration {
  type: DecorationType
  x: number
  y: number
  seed: number
}

export type DecorationTheme = 'outdoor' | 'ai_university' | 'ai_labor' | 'design_atelier' | 'security_hub'

export type Rect = { x: number; y: number; w: number; h: number }

type DecorationGenerationOptions = {
  reservedRects?: Rect[]
}

function fract(n: number) {
  return n - Math.floor(n)
}

function hash2D(x: number, y: number) {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123)
}

function isWalkableGround(t: TileType) {
  return (
    t === 'grass' ||
    t === 'grass_dark' ||
    t === 'grass_flower' ||
    t === 'floor' ||
    t === 'carpet'
  )
}

function rectsIntersect(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function intersectsAny(rect: Rect, reserved: Rect[] | undefined) {
  if (!reserved || reserved.length === 0) return false
  for (const r of reserved) {
    if (rectsIntersect(rect, r)) return true
  }
  return false
}

export function getDecorationBounds(d: Decoration): Rect {
  switch (d.type) {
    case 'university':
      return { x: d.x + 6, y: d.y + 10, w: 248, h: 150 }
    case 'ai_labor':
      return { x: d.x + 8, y: d.y + 10, w: 228, h: 148 }
    case 'code_farm':
      // Barn + kleines Feld: ungefähr ähnlich groß wie Labor/Uni
      return { x: d.x + 8, y: d.y + 14, w: 240, h: 150 }
    case 'n8n_factory':
      // Factory: similar size to Code Farm, but without field
      return { x: d.x + 10, y: d.y + 12, w: 228, h: 150 }
    case 'ui_ux_atelier':
      // Atelier: slightly smaller, modern look
      return { x: d.x + 8, y: d.y + 10, w: 200, h: 140 }
    case 'security_hub':
      // Security Hub: similar size to Factory
      return { x: d.x + 10, y: d.y + 12, w: 220, h: 145 }
    case 'programming_hub':
      // Programming Hub: similar to factory, slightly wider
      return { x: d.x + 10, y: d.y + 12, w: 232, h: 150 }
    case 'house':
      return { x: d.x + 4, y: d.y + 4, w: 64, h: 66 }
    case 'desk':
      return { x: d.x + 6, y: d.y + 4, w: 78, h: 56 }
    case 'tree':
      return { x: d.x + 2, y: d.y + 4, w: 36, h: 54 }
    case 'bush':
      return { x: d.x + 2, y: d.y + 8, w: 28, h: 20 }
    case 'rock':
      return { x: d.x + 2, y: d.y + 6, w: 24, h: 18 }
    case 'flower_patch':
      return { x: d.x + 2, y: d.y + 6, w: 24, h: 18 }
    case 'grass_tuft':
      return { x: d.x + 2, y: d.y + 8, w: 20, h: 16 }
    case 'fallen_log':
      return { x: d.x + 2, y: d.y + 8, w: 36, h: 14 }
    case 'server_rack':
      return { x: d.x + 2, y: d.y + 10, w: 16, h: 40 }
    case 'lab_bench':
      return { x: d.x + 10, y: d.y + 18, w: 60, h: 30 }
    case 'microscope':
      return { x: d.x + 4, y: d.y + 8, w: 20, h: 22 }
    case 'chem_set':
      return { x: d.x + 4, y: d.y + 6, w: 26, h: 16 }
    case 'whiteboard':
      return { x: d.x + 2, y: d.y + 6, w: 68, h: 34 }
    case 'incubator':
      return { x: d.x + 6, y: d.y + 10, w: 22, h: 34 }
    case 'atelier_easel':
      return { x: d.x + 6, y: d.y + 10, w: 44, h: 58 }
    case 'atelier_palette':
      return { x: d.x + 6, y: d.y + 12, w: 40, h: 28 }
    case 'atelier_sculpture':
      return { x: d.x + 8, y: d.y + 6, w: 40, h: 56 }
    case 'atelier_moodboard':
      return { x: d.x + 6, y: d.y + 8, w: 56, h: 40 }
    default:
      return { x: d.x, y: d.y, w: TILE_SIZE, h: TILE_SIZE }
  }
}

function hasAdjacentPath(tiles: TileType[][], row: number, col: number) {
  const up = tiles[row - 1]?.[col]
  const down = tiles[row + 1]?.[col]
  const left = tiles[row]?.[col - 1]
  const right = tiles[row]?.[col + 1]
  return up === 'path' || down === 'path' || left === 'path' || right === 'path'
}

function hasAdjacentWater(tiles: TileType[][], row: number, col: number) {
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (tiles[r]?.[c] === 'water') return true
    }
  }
  return false
}

export function generateDecorations(tiles: TileType[][]): Decoration[] {
  return generateDecorationsWithTheme(tiles, 'outdoor')
}

export function generateDecorationsWithTheme(
  tiles: TileType[][],
  theme: DecorationTheme = 'outdoor',
  options: DecorationGenerationOptions = {}
): Decoration[] {
  const decorations: Decoration[] = []
  const rows = tiles.length
  const cols = tiles[0]?.length ?? 0

  if (theme === 'ai_university') {
    // Innenraum: ein paar "Studierplätze" (Desks) + ein zentrales Pult
    const placeDeskAt = (row: number, col: number, seedOffset: number) => {
      const x = col * TILE_SIZE - 18
      const y = row * TILE_SIZE - 28
      const d: Decoration = {
        type: 'desk',
        x,
        y,
        seed: hash2D(col + 9000 + seedOffset, row + 9000 + seedOffset),
      }
      if (intersectsAny(getDecorationBounds(d), options.reservedRects)) return
      decorations.push(d)
    }

    const midRow = Math.floor(rows / 2)
    const midCol = Math.floor(cols / 2)

    // 2 Reihen links/rechts neben dem Teppich
    const deskRows = [midRow - 3, midRow, midRow + 3].filter((r) => r >= 3 && r <= rows - 4)
    const leftCols = [midCol - 6, midCol - 4].filter((c) => c >= 3)
    const rightCols = [midCol + 4, midCol + 6].filter((c) => c <= cols - 4)

    let i = 0
    for (const r of deskRows) {
      for (const c of [...leftCols, ...rightCols]) {
        const t = tiles[r]?.[c]
        if (!t || !isWalkableGround(t)) continue
        placeDeskAt(r, c, i++)
      }
    }

    // Pult oben am Ende des Teppichs
    const lecternRow = Math.max(3, Math.floor(rows * 0.32))
    const lecternCol = midCol
    if (isWalkableGround(tiles[lecternRow]?.[lecternCol] ?? 'wall')) {
      placeDeskAt(lecternRow, lecternCol, 4242)
    }

    return decorations
  }

  if (theme === 'ai_labor') {
    const midRow = Math.floor(rows / 2)
    const midCol = Math.floor(cols / 2)

    const place = (type: DecorationType, row: number, col: number, seedOffset: number, dx = 0, dy = 0) => {
      const t = tiles[row]?.[col]
      if (!t || !isWalkableGround(t)) return
      const d: Decoration = {
        type,
        x: col * TILE_SIZE + dx,
        y: row * TILE_SIZE + dy,
        seed: hash2D(col + 8200 + seedOffset, row + 8200 + seedOffset),
      }
      if (intersectsAny(getDecorationBounds(d), options.reservedRects)) return
      decorations.push(d)
    }

    // Labor-Benches in 2 "Inseln" links/rechts vom Teppich (kein PC-Look)
    const benchRows = [midRow - 6, midRow - 3, midRow, midRow + 3].filter((r) => r >= 4 && r <= rows - 5)
    const leftBenchCols = [midCol - 8, midCol - 6].filter((c) => c >= 4)
    const rightBenchCols = [midCol + 6, midCol + 8].filter((c) => c <= cols - 5)

    let i = 0
    for (const r of benchRows) {
      for (const c of [...leftBenchCols, ...rightBenchCols]) {
        // Bench footprint ~80x44: center it a bit
        place('lab_bench', r, c, i++, -20, -20)

        // Add small equipment on/near benches
        const seed = hash2D(c + 9000, r + 9000)
        if (seed > 0.78) {
          place('microscope', r, c, i++, -2, -30)
        } else if (seed > 0.52) {
          place('chem_set', r, c, i++, 8, -30)
        }
      }
    }

    // Whiteboard near the top end of the carpet
    const boardRow = Math.max(3, Math.floor(rows * 0.26))
    place('whiteboard', boardRow, midCol, 4242, -34, -26)

    // Incubator / device on one side
    const deviceRow = Math.max(4, Math.floor(rows * 0.28))
    place('incubator', deviceRow, Math.max(4, midCol - 10), 777, -10, -28)

    return decorations
  }

  if (theme === 'design_atelier') {
    // Interior items are provided via extra decorations from the world.
    return decorations
  }

  if (theme === 'security_hub') {
    const midRow = Math.floor(rows / 2)
    const midCol = Math.floor(cols / 2)

    const place = (type: DecorationType, row: number, col: number, seedOffset: number, dx = 0, dy = 0) => {
      const t = tiles[row]?.[col]
      if (!t || !isWalkableGround(t)) return
      const d: Decoration = {
        type,
        x: col * TILE_SIZE + dx,
        y: row * TILE_SIZE + dy,
        seed: hash2D(col + 7500 + seedOffset, row + 7500 + seedOffset),
      }
      if (intersectsAny(getDecorationBounds(d), options.reservedRects)) return
      decorations.push(d)
    }

    // Server Racks in rows on both sides
    const rackRows = [midRow - 5, midRow - 2, midRow + 1, midRow + 4].filter((r) => r >= 3 && r <= rows - 4)
    const leftCols = [midCol - 10, midCol - 8, midCol - 6].filter((c) => c >= 3)
    const rightCols = [midCol + 6, midCol + 8, midCol + 10].filter((c) => c <= cols - 4)

    let i = 0
    for (const r of rackRows) {
      for (const c of [...leftCols, ...rightCols]) {
        place('server_rack', r, c, i++, 6, -24)
      }
    }

    // Whiteboards for security monitoring
    const boardRow = Math.max(3, Math.floor(rows * 0.25))
    place('whiteboard', boardRow, midCol - 4, 5001, -34, -26)
    place('whiteboard', boardRow, midCol + 4, 5002, -34, -26)

    // Central "command center" desk area
    const deskRows = [midRow - 2, midRow + 2].filter((r) => r >= 4 && r <= rows - 5)
    for (const r of deskRows) {
      const x = midCol * TILE_SIZE - 18
      const y = r * TILE_SIZE - 28
      const d: Decoration = {
        type: 'desk',
        x,
        y,
        seed: hash2D(midCol + 9500, r + 9500),
      }
      if (!intersectsAny(getDecorationBounds(d), options.reservedRects)) {
        decorations.push(d)
      }
    }

    return decorations
  }

  // Avoid placing multiple large objects too close
  const occupied = new Set<string>()
  const occupy = (row: number, col: number, radius: number) => {
    for (let r = row - radius; r <= row + radius; r++) {
      for (let c = col - radius; c <= col + radius; c++) {
        occupied.add(`${r},${c}`)
      }
    }
  }

  // Houses: deterministically pick "best" candidates so small maps still get houses.
  const candidates: Array<{ row: number; col: number; score: number; seed: number; rand2: number }> = []
  const margin = 2 // keep larger sprites away from edges
  for (let row = margin; row < rows - margin; row++) {
    for (let col = margin; col < cols - margin; col++) {
      const t = tiles[row][col]
      if (!isWalkableGround(t)) continue
      if (!hasAdjacentPath(tiles, row, col)) continue
      if (hasAdjacentWater(tiles, row, col)) continue

      candidates.push({
        row,
        col,
        score: hash2D(col + 5000, row + 5000),
        seed: hash2D(col, row),
        rand2: hash2D(col + 991, row + 227),
      })
    }
  }

  candidates.sort((a, b) => b.score - a.score)

  // User request: place only 2 houses in the world.
  // Note: if the map doesn't offer 2 valid candidates, we'll place fewer.
  const targetHouses = 2
  let housesPlaced = 0

  for (const c of candidates) {
    if (housesPlaced >= targetHouses) break
    if (occupied.has(`${c.row},${c.col}`)) continue

    const x = c.col * TILE_SIZE - 16 + Math.floor(c.rand2 * 8) - 4
    const y = c.row * TILE_SIZE - 32 + Math.floor(hash2D(c.col + 12, c.row + 77) * 6) - 3
    const d: Decoration = {
      type: 'house',
      x,
      y,
      seed: c.seed,
    }
    if (intersectsAny(getDecorationBounds(d), options.reservedRects)) continue
    decorations.push(d)

    occupy(c.row, c.col, 2)
    housesPlaced++
  }

  // Schreibtisch mit Computer: exakt 1x, deterministisch in der Nähe des Zentrums/Path
  // (damit er leicht zu finden ist) und nicht direkt auf dem Pfad.
  const midRow = Math.floor(rows / 2)
  const midCol = Math.floor(cols / 2)
  const deskSearchStart = { row: midRow + 3, col: midCol + 4 }

  const isValidDeskSpot = (row: number, col: number) => {
    const margin2 = 2
    if (row < margin2 || col < margin2 || row >= rows - margin2 || col >= cols - margin2) return false
    if (occupied.has(`${row},${col}`)) return false
    const t = tiles[row]?.[col]
    if (!t || !isWalkableGround(t)) return false
    if (!hasAdjacentPath(tiles, row, col)) return false
    if (hasAdjacentWater(tiles, row, col)) return false
    return true
  }

  let deskPlaced = false
  const maxRadius = 10
  for (let r = 0; r <= maxRadius && !deskPlaced; r++) {
    for (let dy = -r; dy <= r && !deskPlaced; dy++) {
      for (let dx = -r; dx <= r && !deskPlaced; dx++) {
        const row = deskSearchStart.row + dy
        const col = deskSearchStart.col + dx
        if (!isValidDeskSpot(row, col)) continue

        const jitterX = Math.floor(hash2D(col + 1337, row + 7331) * 8) - 4
        const jitterY = Math.floor(hash2D(col + 4242, row + 1717) * 6) - 3
        const seed = hash2D(col + 9000, row + 9000)

        const d: Decoration = {
          type: 'desk',
          // ~78px wide, ~52px tall sprite footprint
          x: col * TILE_SIZE - 18 + jitterX,
          y: row * TILE_SIZE - 28 + jitterY,
          seed,
        }
        if (intersectsAny(getDecorationBounds(d), options.reservedRects)) continue
        decorations.push(d)

        occupy(row, col, 2)
        deskPlaced = true
      }
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const t = tiles[row][col]
      if (!isWalkableGround(t)) continue
      if (occupied.has(`${row},${col}`)) continue

      const rand = hash2D(col, row)
      const rand2 = hash2D(col + 991, row + 227)
      const rand3 = hash2D(col + 431, row + 911)
      const rand4 = hash2D(col + 1721, row + 621)

      // Slightly prefer edges for trees to frame the scene
      const edgeBoost =
        row < 3 || col < 3 || row > rows - 4 || col > cols - 4 ? 0.012 : 0

      // Trees: more common to enrich the landscape
      if (rand > 0.985 - edgeBoost) {
        const d: Decoration = {
          type: 'tree',
          x: col * TILE_SIZE + Math.floor(rand2 * 10) - 5,
          y: row * TILE_SIZE + Math.floor(hash2D(col + 12, row + 77) * 10) - 6,
          seed: rand,
        }
        if (intersectsAny(getDecorationBounds(d), options.reservedRects)) continue
        decorations.push(d)
        continue
      }

      // Bushes: more common for denser greenery
      if (rand > 0.958 && rand <= 0.985) {
        const d: Decoration = {
          type: 'bush',
          x: col * TILE_SIZE + Math.floor(rand2 * 8) - 4,
          y: row * TILE_SIZE + Math.floor(hash2D(col + 33, row + 44) * 8) - 4,
          seed: rand,
        }
        if (intersectsAny(getDecorationBounds(d), options.reservedRects)) continue
        decorations.push(d)
        continue
      }

      // Rocks: still sparse
      if (rand > 0.948 && rand <= 0.958) {
        const d: Decoration = {
          type: 'rock',
          x: col * TILE_SIZE + Math.floor(rand2 * 10) - 5,
          y: row * TILE_SIZE + Math.floor(hash2D(col + 55, row + 66) * 10) - 5,
          seed: rand,
        }
        if (intersectsAny(getDecorationBounds(d), options.reservedRects)) continue
        decorations.push(d)
        continue
      }

      // Flower patches: colorful details on grass tiles
      if (rand3 > 0.88 && rand3 <= 0.945) {
        const d: Decoration = {
          type: 'flower_patch',
          x: col * TILE_SIZE + Math.floor(rand2 * 8) - 4,
          y: row * TILE_SIZE + Math.floor(hash2D(col + 77, row + 88) * 6) - 3,
          seed: rand3,
        }
        if (intersectsAny(getDecorationBounds(d), options.reservedRects)) continue
        decorations.push(d)
        continue
      }

      // Grass tufts: subtle variety
      if (rand3 > 0.945 && rand3 <= 0.985) {
        const d: Decoration = {
          type: 'grass_tuft',
          x: col * TILE_SIZE + Math.floor(rand2 * 6) - 3,
          y: row * TILE_SIZE + Math.floor(hash2D(col + 23, row + 41) * 6) - 3,
          seed: rand3,
        }
        if (intersectsAny(getDecorationBounds(d), options.reservedRects)) continue
        decorations.push(d)
        continue
      }

      // Fallen logs: rare but noticeable
      if (rand4 > 0.992) {
        const d: Decoration = {
          type: 'fallen_log',
          x: col * TILE_SIZE + Math.floor(rand2 * 8) - 4,
          y: row * TILE_SIZE + Math.floor(hash2D(col + 199, row + 301) * 6) - 3,
          seed: rand4,
        }
        if (intersectsAny(getDecorationBounds(d), options.reservedRects)) continue
        decorations.push(d)
      }
    }
  }

  return decorations
}

export function drawDecoration(ctx: CanvasRenderingContext2D, d: Decoration) {
  // All drawings are in "CSS pixels" with imageRendering: pixelated on canvas.
  // Keep shapes chunky and low-detail to read well.
  switch (d.type) {
    case 'code_farm': {
      // "Code Farm" – Scheune + Pixel-Feld (Monster-Spawn Area)
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.26)'
      ctx.beginPath()
      ctx.ellipse(d.x + 126, d.y + 156, 94, 14, 0, 0, Math.PI * 2)
      ctx.fill()

      // Field (left) - plowed rows
      ctx.fillStyle = '#3b2a1a'
      ctx.fillRect(d.x + 14, d.y + 92, 104, 58)
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(d.x + 18, d.y + 96 + i * 9, 96, 2)
      }
      // Sprouts
      ctx.fillStyle = '#22c55e'
      for (let i = 0; i < 8; i++) {
        const sx = d.x + 22 + i * 12
        const sy = d.y + 126 + (i % 2) * 6
        ctx.fillRect(sx, sy, 2, 3)
      }

      // Barn (right)
      // Base
      ctx.fillStyle = '#7c2d12'
      ctx.fillRect(d.x + 124, d.y + 62, 126, 88)
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillRect(d.x + 126, d.y + 64, 122, 4)
      // Roof
      ctx.fillStyle = '#111827'
      ctx.fillRect(d.x + 118, d.y + 46, 138, 20)
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.fillRect(d.x + 122, d.y + 50, 130, 4)

      // Door (center)
      ctx.fillStyle = '#0b1220'
      ctx.fillRect(d.x + 174, d.y + 92, 44, 58)
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.fillRect(d.x + 176, d.y + 96, 4, 50)
      ctx.fillStyle = '#fcd34d'
      ctx.fillRect(d.x + 214, d.y + 120, 2, 2)

      // "Terminal" sign
      ctx.fillStyle = 'rgba(0,0,0,0.70)'
      ctx.fillRect(d.x + 136, d.y + 18, 120, 18)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('CODE FARM', d.x + 196, d.y + 27)

      // Little antenna / wifi
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(d.x + 236, d.y + 60)
      ctx.lineTo(d.x + 236, d.y + 44)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(d.x + 236, d.y + 40, 5, 0, Math.PI * 2)
      ctx.stroke()
      break
    }
    case 'n8n_factory': {
      // "n8n Factory" – Industrial factory with robots and conveyors
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.26)'
      ctx.beginPath()
      ctx.ellipse(d.x + 120, d.y + 156, 92, 14, 0, 0, Math.PI * 2)
      ctx.fill()

      // Base shell (darker industrial look)
      ctx.fillStyle = '#1a1f2e'
      ctx.fillRect(d.x + 20, d.y + 62, 200, 90)
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillRect(d.x + 22, d.y + 64, 196, 4)

      // Roof
      ctx.fillStyle = '#0b1220'
      ctx.fillRect(d.x + 14, d.y + 46, 212, 20)
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.fillRect(d.x + 18, d.y + 50, 204, 4)

      // Conveyor belt (bottom of building)
      ctx.fillStyle = '#374151'
      ctx.fillRect(d.x + 30, d.y + 142, 80, 8)
      ctx.fillStyle = '#4b5563'
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(d.x + 34 + i * 10, d.y + 144, 4, 4)
      }
      ctx.fillStyle = 'rgba(249,115,22,0.3)'
      ctx.fillRect(d.x + 30, d.y + 140, 80, 2)

      // Neon strip (n8n orange accent)
      ctx.fillStyle = '#f97316'
      ctx.fillRect(d.x + 20, d.y + 84, 200, 3)
      ctx.fillStyle = 'rgba(249,115,22,0.25)'
      ctx.fillRect(d.x + 20, d.y + 88, 200, 2)

      // Windows
      ctx.fillStyle = '#1f6aa8'
      for (let i = 0; i < 6; i++) {
        const wx = d.x + 30 + i * 30
        // Avoid door region
        if (Math.abs(wx - (d.x + 112)) < 14) continue
        ctx.fillRect(wx, d.y + 70, 14, 10)
        ctx.fillStyle = 'rgba(255,255,255,0.16)'
        ctx.fillRect(wx + 2, d.y + 72, 5, 2)
        ctx.fillStyle = '#1f6aa8'
      }

      // Door (center)
      ctx.fillStyle = '#0b1220'
      ctx.fillRect(d.x + 106, d.y + 100, 28, 52)
      ctx.fillStyle = 'rgba(255,255,255,0.10)'
      ctx.fillRect(d.x + 108, d.y + 104, 4, 44)
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(d.x + 130, d.y + 126, 2, 2)

      // Robot 1 (left side)
      // Body
      ctx.fillStyle = '#6b7280'
      ctx.fillRect(d.x + 38, d.y + 118, 16, 20)
      ctx.fillStyle = '#9ca3af'
      ctx.fillRect(d.x + 40, d.y + 120, 12, 4)
      // Head
      ctx.fillStyle = '#4b5563'
      ctx.fillRect(d.x + 40, d.y + 112, 12, 8)
      // Eyes (LED)
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(d.x + 42, d.y + 114, 3, 3)
      ctx.fillRect(d.x + 47, d.y + 114, 3, 3)
      // Antenna
      ctx.fillStyle = '#374151'
      ctx.fillRect(d.x + 45, d.y + 106, 2, 6)
      ctx.fillStyle = '#f97316'
      ctx.fillRect(d.x + 44, d.y + 104, 4, 3)

      // Robot 2 (right side, near conveyor)
      ctx.fillStyle = '#4b5563'
      ctx.fillRect(d.x + 158, d.y + 120, 14, 18)
      ctx.fillStyle = '#6b7280'
      ctx.fillRect(d.x + 160, d.y + 122, 10, 3)
      // Head
      ctx.fillStyle = '#374151'
      ctx.fillRect(d.x + 159, d.y + 114, 12, 7)
      // Eyes
      ctx.fillStyle = '#60a5fa'
      ctx.fillRect(d.x + 161, d.y + 116, 2, 2)
      ctx.fillRect(d.x + 166, d.y + 116, 2, 2)
      // Arm reaching to conveyor
      ctx.fillStyle = '#6b7280'
      ctx.fillRect(d.x + 148, d.y + 126, 12, 4)

      // Workflow machine / console (right of door)
      ctx.fillStyle = '#1f2937'
      ctx.fillRect(d.x + 138, d.y + 100, 24, 36)
      ctx.fillStyle = '#111827'
      ctx.fillRect(d.x + 140, d.y + 102, 20, 18)
      // Screen glow
      ctx.fillStyle = 'rgba(249,115,22,0.6)'
      ctx.fillRect(d.x + 142, d.y + 104, 16, 12)
      // Screen content (workflow nodes)
      ctx.fillStyle = '#fff'
      ctx.fillRect(d.x + 144, d.y + 107, 3, 3)
      ctx.fillRect(d.x + 150, d.y + 109, 3, 3)
      ctx.fillRect(d.x + 154, d.y + 106, 3, 3)
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(d.x + 147, d.y + 108)
      ctx.lineTo(d.x + 150, d.y + 110)
      ctx.lineTo(d.x + 154, d.y + 108)
      ctx.stroke()
      // Buttons
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(d.x + 144, d.y + 124, 4, 4)
      ctx.fillStyle = '#f97316'
      ctx.fillRect(d.x + 150, d.y + 124, 4, 4)

      // Chimney with smoke particles
      ctx.fillStyle = '#374151'
      ctx.fillRect(d.x + 186, d.y + 34, 10, 20)
      ctx.fillStyle = 'rgba(255,255,255,0.10)'
      ctx.fillRect(d.x + 188, d.y + 36, 2, 16)
      // Smoke puffs
      ctx.fillStyle = 'rgba(148,163,184,0.4)'
      ctx.beginPath()
      ctx.arc(d.x + 191, d.y + 30, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(148,163,184,0.3)'
      ctx.beginPath()
      ctx.arc(d.x + 188, d.y + 24, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(148,163,184,0.2)'
      ctx.beginPath()
      ctx.arc(d.x + 193, d.y + 18, 4, 0, Math.PI * 2)
      ctx.fill()

      // Sign
      ctx.fillStyle = 'rgba(0,0,0,0.72)'
      ctx.fillRect(d.x + 44, d.y + 16, 152, 18)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('N8N FACTORY', d.x + 120, d.y + 25)

      // Small node icon (3 circles connected) on left
      ctx.strokeStyle = 'rgba(249,115,22,0.9)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(d.x + 66, d.y + 126)
      ctx.lineTo(d.x + 78, d.y + 118)
      ctx.lineTo(d.x + 90, d.y + 126)
      ctx.stroke()
      ctx.fillStyle = '#f97316'
      ctx.beginPath()
      ctx.arc(d.x + 66, d.y + 126, 3, 0, Math.PI * 2)
      ctx.arc(d.x + 78, d.y + 118, 3, 0, Math.PI * 2)
      ctx.arc(d.x + 90, d.y + 126, 3, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'security_hub': {
      // "Security Hub" – Cybersecurity themed building with shield and monitors
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.26)'
      ctx.beginPath()
      ctx.ellipse(d.x + 115, d.y + 150, 88, 14, 0, 0, Math.PI * 2)
      ctx.fill()

      // Base shell (dark blue/gray security building)
      ctx.fillStyle = '#0a1628'
      ctx.fillRect(d.x + 18, d.y + 55, 195, 90)
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      ctx.fillRect(d.x + 20, d.y + 57, 191, 4)

      // Roof (angled security center style)
      ctx.fillStyle = '#1e3a5f'
      ctx.beginPath()
      ctx.moveTo(d.x + 10, d.y + 55)
      ctx.lineTo(d.x + 115, d.y + 20)
      ctx.lineTo(d.x + 220, d.y + 55)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.beginPath()
      ctx.moveTo(d.x + 12, d.y + 55)
      ctx.lineTo(d.x + 115, d.y + 24)
      ctx.lineTo(d.x + 115, d.y + 20)
      ctx.lineTo(d.x + 10, d.y + 55)
      ctx.closePath()
      ctx.fill()

      // Neon accent stripe (cyan/teal for security)
      ctx.fillStyle = '#06b6d4'
      ctx.fillRect(d.x + 18, d.y + 80, 195, 3)
      ctx.fillStyle = 'rgba(6,182,212,0.3)'
      ctx.fillRect(d.x + 18, d.y + 83, 195, 6)

      // Shield logo on roof
      ctx.fillStyle = '#22d3ee'
      ctx.beginPath()
      ctx.moveTo(d.x + 115, d.y + 30)
      ctx.lineTo(d.x + 130, d.y + 38)
      ctx.lineTo(d.x + 127, d.y + 50)
      ctx.lineTo(d.x + 115, d.y + 55)
      ctx.lineTo(d.x + 103, d.y + 50)
      ctx.lineTo(d.x + 100, d.y + 38)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#0891b2'
      ctx.beginPath()
      ctx.moveTo(d.x + 115, d.y + 34)
      ctx.lineTo(d.x + 125, d.y + 40)
      ctx.lineTo(d.x + 123, d.y + 48)
      ctx.lineTo(d.x + 115, d.y + 52)
      ctx.lineTo(d.x + 107, d.y + 48)
      ctx.lineTo(d.x + 105, d.y + 40)
      ctx.closePath()
      ctx.fill()
      // Checkmark on shield
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(d.x + 109, d.y + 43)
      ctx.lineTo(d.x + 113, d.y + 47)
      ctx.lineTo(d.x + 121, d.y + 39)
      ctx.stroke()

      // Door (center)
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(d.x + 95, d.y + 105, 40, 40)
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(d.x + 98, d.y + 108, 34, 34)
      // Door handle with keypad
      ctx.fillStyle = '#475569'
      ctx.fillRect(d.x + 127, d.y + 120, 3, 10)
      // Keypad
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(d.x + 101, d.y + 118, 12, 16)
      ctx.fillStyle = '#22d3ee'
      ctx.fillRect(d.x + 103, d.y + 120, 8, 3)
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.fillStyle = '#475569'
          ctx.fillRect(d.x + 103 + c * 3, d.y + 125 + r * 3, 2, 2)
        }
      }

      // Left monitor station
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(d.x + 32, d.y + 95, 40, 45)
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(d.x + 35, d.y + 98, 34, 24)
      // Screen content - security feed
      ctx.fillStyle = '#14532d'
      ctx.fillRect(d.x + 37, d.y + 100, 30, 20)
      ctx.fillStyle = '#22c55e'
      ctx.font = '6px monospace'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('SECURE', d.x + 39, d.y + 103)
      ctx.fillStyle = '#4ade80'
      ctx.fillRect(d.x + 39, d.y + 112, 26, 1)
      ctx.fillStyle = 'rgba(74,222,128,0.5)'
      ctx.fillRect(d.x + 39, d.y + 115, 20, 1)
      // Monitor stand
      ctx.fillStyle = '#374151'
      ctx.fillRect(d.x + 49, d.y + 122, 6, 8)
      ctx.fillRect(d.x + 44, d.y + 128, 16, 4)

      // Right monitor station
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(d.x + 158, d.y + 95, 40, 45)
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(d.x + 161, d.y + 98, 34, 24)
      // Screen content - access logs
      ctx.fillStyle = '#0c4a6e'
      ctx.fillRect(d.x + 163, d.y + 100, 30, 20)
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#7dd3fc'
        ctx.fillRect(d.x + 165, d.y + 102 + i * 3, 14 + (i % 3) * 3, 1)
      }
      // Monitor stand
      ctx.fillStyle = '#374151'
      ctx.fillRect(d.x + 175, d.y + 122, 6, 8)
      ctx.fillRect(d.x + 170, d.y + 128, 16, 4)

      // Padlock decorations on building sides
      // Left padlock
      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(d.x + 26, d.y + 108, 16, 12)
      ctx.fillStyle = '#f59e0b'
      ctx.fillRect(d.x + 28, d.y + 110, 12, 8)
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(d.x + 34, d.y + 106, 5, Math.PI, 0)
      ctx.stroke()
      // Keyhole
      ctx.fillStyle = '#1f2937'
      ctx.beginPath()
      ctx.arc(d.x + 34, d.y + 113, 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillRect(d.x + 33, d.y + 113, 2, 4)

      // Right padlock
      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(d.x + 188, d.y + 108, 16, 12)
      ctx.fillStyle = '#f59e0b'
      ctx.fillRect(d.x + 190, d.y + 110, 12, 8)
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(d.x + 196, d.y + 106, 5, Math.PI, 0)
      ctx.stroke()
      // Keyhole
      ctx.fillStyle = '#1f2937'
      ctx.beginPath()
      ctx.arc(d.x + 196, d.y + 113, 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillRect(d.x + 195, d.y + 113, 2, 4)

      // Antenna / sensor on roof
      ctx.fillStyle = '#475569'
      ctx.fillRect(d.x + 185, d.y + 35, 4, 20)
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(d.x + 187, d.y + 33, 3, 0, Math.PI * 2)
      ctx.fill()

      // Sign
      ctx.fillStyle = 'rgba(0,0,0,0.75)'
      ctx.fillRect(d.x + 40, d.y + 62, 150, 16)
      ctx.fillStyle = '#22d3ee'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('SECURITY HUB', d.x + 115, d.y + 70)

      // Binary decorations (floating)
      ctx.fillStyle = 'rgba(34,211,238,0.3)'
      ctx.font = '8px monospace'
      ctx.textAlign = 'left'
      ctx.fillText('01101', d.x + 50, d.y + 135)
      ctx.fillText('10010', d.x + 140, d.y + 138)
      break
    }
    case 'programming_hub': {
      // "Programming Hub" – modern dev studio with code accents
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.26)'
      ctx.beginPath()
      ctx.ellipse(d.x + 122, d.y + 156, 94, 14, 0, 0, Math.PI * 2)
      ctx.fill()

      // Base shell
      ctx.fillStyle = '#111827'
      ctx.fillRect(d.x + 18, d.y + 60, 210, 92)
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.fillRect(d.x + 20, d.y + 62, 206, 4)

      // Roof
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(d.x + 12, d.y + 44, 222, 20)
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.fillRect(d.x + 16, d.y + 48, 214, 4)

      // Neon strip (emerald)
      ctx.fillStyle = '#10b981'
      ctx.fillRect(d.x + 18, d.y + 84, 210, 3)
      ctx.fillStyle = 'rgba(16,185,129,0.25)'
      ctx.fillRect(d.x + 18, d.y + 87, 210, 2)

      // Windows
      ctx.fillStyle = '#1d4ed8'
      for (let i = 0; i < 6; i++) {
        const wx = d.x + 28 + i * 32
        if (Math.abs(wx - (d.x + 118)) < 16) continue
        ctx.fillRect(wx, d.y + 72, 14, 10)
        ctx.fillStyle = 'rgba(255,255,255,0.18)'
        ctx.fillRect(wx + 2, d.y + 74, 5, 2)
        ctx.fillStyle = '#1d4ed8'
      }

      // Door (center)
      ctx.fillStyle = '#0b1220'
      ctx.fillRect(d.x + 108, d.y + 102, 30, 50)
      ctx.fillStyle = 'rgba(255,255,255,0.10)'
      ctx.fillRect(d.x + 110, d.y + 106, 4, 42)
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(d.x + 134, d.y + 126, 2, 2)

      // Code consoles (left/right)
      ctx.fillStyle = '#1f2937'
      ctx.fillRect(d.x + 36, d.y + 108, 28, 26)
      ctx.fillRect(d.x + 170, d.y + 108, 28, 26)
      ctx.fillStyle = 'rgba(16,185,129,0.7)'
      ctx.fillRect(d.x + 40, d.y + 112, 20, 12)
      ctx.fillRect(d.x + 174, d.y + 112, 20, 12)
      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(d.x + 42, d.y + 114, 6, 2)
      ctx.fillRect(d.x + 176, d.y + 114, 6, 2)
      ctx.fillRect(d.x + 50, d.y + 118, 6, 2)
      ctx.fillRect(d.x + 184, d.y + 118, 6, 2)

      // Sign
      ctx.fillStyle = 'rgba(0,0,0,0.72)'
      ctx.fillRect(d.x + 38, d.y + 16, 168, 18)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('PROGRAMMIERHUB', d.x + 122, d.y + 25)

      // Small code icon
      ctx.strokeStyle = 'rgba(16,185,129,0.9)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(d.x + 70, d.y + 128)
      ctx.lineTo(d.x + 62, d.y + 122)
      ctx.lineTo(d.x + 70, d.y + 116)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(d.x + 174, d.y + 116)
      ctx.lineTo(d.x + 182, d.y + 122)
      ctx.lineTo(d.x + 174, d.y + 128)
      ctx.stroke()
      break
    }
    case 'ui_ux_atelier': {
      // "UI/UX Atelier" – Modern, artistic, glass elements, colorful
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.24)'
      ctx.beginPath()
      ctx.ellipse(d.x + 108, d.y + 146, 80, 12, 0, 0, Math.PI * 2)
      ctx.fill()

      // Main structure (White/Clean)
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(d.x + 16, d.y + 50, 184, 90)
      ctx.fillStyle = '#e2e8f0' // side/depth
      ctx.fillRect(d.x + 200, d.y + 54, 8, 86)
      
      // Top colored band (Gradient-ish via stripes)
      ctx.fillStyle = '#ec4899' // Pink
      ctx.fillRect(d.x + 16, d.y + 46, 60, 4)
      ctx.fillStyle = '#8b5cf6' // Purple
      ctx.fillRect(d.x + 76, d.y + 46, 60, 4)
      ctx.fillStyle = '#3b82f6' // Blue
      ctx.fillRect(d.x + 136, d.y + 46, 64, 4)

      // Large Glass Front
      ctx.fillStyle = 'rgba(148, 163, 184, 0.3)'
      ctx.fillRect(d.x + 24, d.y + 60, 100, 60)
      // Glass reflections
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.beginPath()
      ctx.moveTo(d.x + 24, d.y + 120)
      ctx.lineTo(d.x + 60, d.y + 60)
      ctx.lineTo(d.x + 80, d.y + 60)
      ctx.lineTo(d.x + 44, d.y + 120)
      ctx.fill()

      // Door (Modern glass door)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)'
      ctx.fillRect(d.x + 140, d.y + 80, 36, 60)
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 2
      ctx.strokeRect(d.x + 140, d.y + 80, 36, 60)
      // Handle
      ctx.fillStyle = '#334155'
      ctx.fillRect(d.x + 170, d.y + 110, 2, 8)

      // Signage "ATELIER"
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('DESIGN ATELIER', d.x + 108, d.y + 35)

      // Decor: Easel / Art outside
      // Stand
      ctx.fillStyle = '#92400e'
      ctx.fillRect(d.x + 184, d.y + 120, 2, 20)
      ctx.fillRect(d.x + 194, d.y + 120, 2, 20)
      ctx.fillRect(d.x + 189, d.y + 120, 2, 18)
      // Canvas
      ctx.fillStyle = '#fff'
      ctx.fillRect(d.x + 182, d.y + 105, 16, 20)
      // Art on canvas
      ctx.fillStyle = '#f43f5e'
      ctx.beginPath()
      ctx.arc(d.x + 190, d.y + 115, 4, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'ai_labor': {
      // "AI Labor" – moderner, technoid wirkender Bau (ca. 7–8 Tiles breit)
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.26)'
      ctx.beginPath()
      ctx.ellipse(d.x + 122, d.y + 148, 88, 14, 0, 0, Math.PI * 2)
      ctx.fill()

      // Base shell
      ctx.fillStyle = '#0b1220'
      ctx.fillRect(d.x + 12, d.y + 50, 220, 92)
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillRect(d.x + 14, d.y + 52, 216, 4)

      // Neon band
      ctx.fillStyle = '#10b981'
      ctx.fillRect(d.x + 12, d.y + 78, 220, 3)
      ctx.fillStyle = 'rgba(16,185,129,0.25)'
      ctx.fillRect(d.x + 12, d.y + 82, 220, 2)

      // Windows (blue)
      ctx.fillStyle = '#1f6aa8'
      for (let i = 0; i < 7; i++) {
        const wx = d.x + 20 + i * 30
        ctx.fillRect(wx, d.y + 60, 14, 10)
        ctx.fillStyle = 'rgba(255,255,255,0.16)'
        ctx.fillRect(wx + 2, d.y + 62, 5, 2)
        ctx.fillStyle = '#1f6aa8'
      }

      // Door (center)
      ctx.fillStyle = '#111827'
      ctx.fillRect(d.x + 108, d.y + 96, 28, 46)
      ctx.fillStyle = 'rgba(255,255,255,0.10)'
      ctx.fillRect(d.x + 110, d.y + 100, 4, 38)
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(d.x + 132, d.y + 118, 2, 2)

      // Steps
      ctx.fillStyle = '#374151'
      ctx.fillRect(d.x + 96, d.y + 142, 52, 8)
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.fillRect(d.x + 96, d.y + 148, 52, 2)

      // Sign
      ctx.fillStyle = 'rgba(0,0,0,0.70)'
      ctx.fillRect(d.x + 58, d.y + 16, 128, 18)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('AI LABOR', d.x + 122, d.y + 25)
      break
    }
    case 'university': {
      // "AI University" – größeres Gebäude (ca. 8 Tiles breit)
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.26)'
      ctx.beginPath()
      ctx.ellipse(d.x + 130, d.y + 152, 92, 14, 0, 0, Math.PI * 2)
      ctx.fill()

      // Main body
      ctx.fillStyle = '#e5e7eb'
      ctx.fillRect(d.x + 18, d.y + 54, 224, 92)
      ctx.fillStyle = 'rgba(0,0,0,0.10)'
      ctx.fillRect(d.x + 18, d.y + 142, 224, 4)

      // Roof band
      ctx.fillStyle = '#111827'
      ctx.fillRect(d.x + 10, d.y + 36, 240, 22)
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.fillRect(d.x + 14, d.y + 40, 232, 4)

      // Columns
      ctx.fillStyle = '#cbd5e1'
      for (let i = 0; i < 6; i++) {
        const cx = d.x + 34 + i * 34
        ctx.fillRect(cx, d.y + 64, 10, 72)
        ctx.fillStyle = 'rgba(255,255,255,0.10)'
        ctx.fillRect(cx + 1, d.y + 66, 2, 68)
        ctx.fillStyle = '#cbd5e1'
      }

      // Door (center)
      ctx.fillStyle = '#6b4a2b'
      ctx.fillRect(d.x + 122, d.y + 104, 30, 42)
      ctx.fillStyle = 'rgba(255,255,255,0.10)'
      ctx.fillRect(d.x + 124, d.y + 108, 4, 34)
      ctx.fillStyle = '#fcd34d'
      ctx.fillRect(d.x + 146, d.y + 126, 2, 2)

      // Stairs
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(d.x + 110, d.y + 146, 54, 8)
      ctx.fillStyle = 'rgba(0,0,0,0.16)'
      ctx.fillRect(d.x + 110, d.y + 152, 54, 2)

      // Windows
      ctx.fillStyle = '#1f6aa8'
      for (let i = 0; i < 6; i++) {
        const wx = d.x + 28 + i * 34
        if (Math.abs(wx - (d.x + 122)) < 12) continue // around door
        ctx.fillRect(wx, d.y + 78, 14, 12)
        ctx.fillStyle = 'rgba(255,255,255,0.16)'
        ctx.fillRect(wx + 2, d.y + 80, 5, 3)
        ctx.fillStyle = '#1f6aa8'
      }

      // Sign
      ctx.fillStyle = 'rgba(0,0,0,0.70)'
      ctx.fillRect(d.x + 58, d.y + 18, 144, 18)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('AI UNIVERSITY', d.x + 130, d.y + 27)
      break
    }
    case 'server_rack': {
      // Server rack footprint: ~20x52px
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.beginPath()
      ctx.ellipse(d.x + 10, d.y + 46, 10, 5, 0, 0, Math.PI * 2)
      ctx.fill()

      // Rack body
      ctx.fillStyle = '#111827'
      ctx.fillRect(d.x + 2, d.y + 10, 16, 40)
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillRect(d.x + 3, d.y + 12, 14, 2)

      // Slots + LEDs
      for (let i = 0; i < 5; i++) {
        const sy = d.y + 16 + i * 7
        ctx.fillStyle = 'rgba(255,255,255,0.06)'
        ctx.fillRect(d.x + 4, sy, 12, 3)
        ctx.fillStyle = d.seed > 0.66 ? '#22c55e' : d.seed > 0.33 ? '#60a5fa' : '#a855f7'
        ctx.fillRect(d.x + 14, sy + 1, 1, 1)
      }
      break
    }
    case 'lab_bench': {
      // Bench footprint ~80x44px
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.beginPath()
      ctx.ellipse(d.x + 40, d.y + 40, 34, 9, 0, 0, Math.PI * 2)
      ctx.fill()

      // Stainless top
      ctx.fillStyle = '#cbd5e1'
      ctx.fillRect(d.x + 10, d.y + 18, 60, 12)
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.fillRect(d.x + 12, d.y + 20, 56, 3)
      ctx.fillStyle = 'rgba(0,0,0,0.14)'
      ctx.fillRect(d.x + 10, d.y + 29, 60, 1)

      // Cabinet base
      ctx.fillStyle = '#111827'
      ctx.fillRect(d.x + 14, d.y + 30, 52, 18)
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillRect(d.x + 16, d.y + 32, 48, 2)

      // Handles
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(d.x + 38, d.y + 38, 4, 2)
      ctx.fillRect(d.x + 48, d.y + 38, 4, 2)

      // Small hazard sticker (varies by seed)
      if (d.seed > 0.55) {
        ctx.fillStyle = '#f59e0b'
        ctx.fillRect(d.x + 18, d.y + 36, 4, 4)
        ctx.fillStyle = 'rgba(0,0,0,0.35)'
        ctx.fillRect(d.x + 19, d.y + 37, 2, 2)
      }
      break
    }
    case 'microscope': {
      // Microscope footprint ~26x30px
      ctx.fillStyle = 'rgba(0,0,0,0.16)'
      ctx.beginPath()
      ctx.ellipse(d.x + 13, d.y + 28, 12, 4, 0, 0, Math.PI * 2)
      ctx.fill()

      // Base
      ctx.fillStyle = '#374151'
      ctx.fillRect(d.x + 5, d.y + 20, 16, 8)
      ctx.fillStyle = 'rgba(255,255,255,0.10)'
      ctx.fillRect(d.x + 6, d.y + 21, 14, 2)

      // Arm
      ctx.fillStyle = '#6b7280'
      ctx.fillRect(d.x + 13, d.y + 10, 4, 12)
      ctx.fillRect(d.x + 10, d.y + 12, 8, 3)

      // Lens (emerald glow)
      ctx.fillStyle = '#10b981'
      ctx.fillRect(d.x + 11, d.y + 8, 8, 3)
      ctx.fillStyle = 'rgba(16,185,129,0.25)'
      ctx.fillRect(d.x + 12, d.y + 7, 6, 1)
      break
    }
    case 'chem_set': {
      // Beakers / test tubes set ~30x22px
      ctx.fillStyle = 'rgba(0,0,0,0.14)'
      ctx.beginPath()
      ctx.ellipse(d.x + 15, d.y + 20, 14, 4, 0, 0, Math.PI * 2)
      ctx.fill()

      const c1 = d.seed > 0.66 ? '#22c55e' : d.seed > 0.33 ? '#60a5fa' : '#f97316'
      const c2 = d.seed > 0.5 ? '#a855f7' : '#22c55e'

      // Tube 1
      ctx.fillStyle = 'rgba(255,255,255,0.14)'
      ctx.fillRect(d.x + 6, d.y + 6, 6, 14)
      ctx.fillStyle = c1
      ctx.fillRect(d.x + 7, d.y + 14, 4, 5)

      // Tube 2
      ctx.fillStyle = 'rgba(255,255,255,0.14)'
      ctx.fillRect(d.x + 14, d.y + 8, 6, 12)
      ctx.fillStyle = c2
      ctx.fillRect(d.x + 15, d.y + 15, 4, 4)

      // Small beaker
      ctx.fillStyle = 'rgba(255,255,255,0.12)'
      ctx.fillRect(d.x + 22, d.y + 10, 6, 10)
      ctx.fillStyle = '#fcd34d'
      ctx.fillRect(d.x + 23, d.y + 16, 4, 3)
      break
    }
    case 'whiteboard': {
      // Whiteboard ~68x34px
      ctx.fillStyle = 'rgba(0,0,0,0.16)'
      ctx.fillRect(d.x + 2, d.y + 6, 68, 34)

      // Frame
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(d.x + 2, d.y + 6, 68, 34)
      ctx.fillStyle = '#e5e7eb'
      ctx.fillRect(d.x + 4, d.y + 8, 64, 30)

      // Scribbles (AI diagrams)
      ctx.strokeStyle = 'rgba(17,24,39,0.55)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(d.x + 10, d.y + 16)
      ctx.lineTo(d.x + 24, d.y + 16)
      ctx.lineTo(d.x + 30, d.y + 22)
      ctx.lineTo(d.x + 44, d.y + 22)
      ctx.stroke()

      ctx.fillStyle = '#a855f7'
      ctx.fillRect(d.x + 12, d.y + 26, 10, 2)
      ctx.fillStyle = '#60a5fa'
      ctx.fillRect(d.x + 26, d.y + 28, 12, 2)
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(d.x + 42, d.y + 26, 10, 2)
      break
    }
    case 'incubator': {
      // Device ~34x44px
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.beginPath()
      ctx.ellipse(d.x + 17, d.y + 42, 16, 6, 0, 0, Math.PI * 2)
      ctx.fill()

      // Body
      ctx.fillStyle = '#111827'
      ctx.fillRect(d.x + 6, d.y + 10, 22, 34)
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillRect(d.x + 7, d.y + 12, 20, 2)

      // Door window (cyan)
      ctx.fillStyle = 'rgba(34,211,238,0.18)'
      ctx.fillRect(d.x + 9, d.y + 18, 16, 14)
      ctx.fillStyle = 'rgba(34,211,238,0.30)'
      ctx.fillRect(d.x + 10, d.y + 19, 14, 2)

      // Status LEDs
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(d.x + 10, d.y + 36, 2, 2)
      ctx.fillStyle = '#a855f7'
      ctx.fillRect(d.x + 14, d.y + 36, 2, 2)
      ctx.fillStyle = '#60a5fa'
      ctx.fillRect(d.x + 18, d.y + 36, 2, 2)
      break
    }
    case 'atelier_easel': {
      // Easel + canvas ~50x64px
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.beginPath()
      ctx.ellipse(d.x + 24, d.y + 58, 20, 6, 0, 0, Math.PI * 2)
      ctx.fill()

      // Legs
      ctx.strokeStyle = '#7c3f22'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(d.x + 14, d.y + 18)
      ctx.lineTo(d.x + 6, d.y + 58)
      ctx.moveTo(d.x + 34, d.y + 18)
      ctx.lineTo(d.x + 42, d.y + 58)
      ctx.stroke()

      // Crossbar
      ctx.strokeStyle = '#9a5a2c'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(d.x + 10, d.y + 34)
      ctx.lineTo(d.x + 38, d.y + 34)
      ctx.stroke()

      // Canvas
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(d.x + 14, d.y + 8, 24, 26)
      ctx.fillStyle = 'rgba(0,0,0,0.06)'
      ctx.fillRect(d.x + 14, d.y + 30, 24, 2)
      ctx.fillStyle = '#f472b6'
      ctx.fillRect(d.x + 18, d.y + 14, 6, 4)
      ctx.fillStyle = '#60a5fa'
      ctx.fillRect(d.x + 26, d.y + 20, 8, 4)
      break
    }
    case 'atelier_palette': {
      // Palette + stool
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.beginPath()
      ctx.ellipse(d.x + 24, d.y + 28, 20, 6, 0, 0, Math.PI * 2)
      ctx.fill()

      // Table top
      ctx.fillStyle = '#6b4a2b'
      ctx.fillRect(d.x + 6, d.y + 12, 36, 10)
      ctx.fillStyle = '#8a5a33'
      ctx.fillRect(d.x + 8, d.y + 14, 32, 6)

      // Paint dabs
      ctx.fillStyle = '#f97316'
      ctx.fillRect(d.x + 12, d.y + 15, 4, 3)
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(d.x + 18, d.y + 15, 4, 3)
      ctx.fillStyle = '#60a5fa'
      ctx.fillRect(d.x + 24, d.y + 15, 4, 3)
      ctx.fillStyle = '#e879f9'
      ctx.fillRect(d.x + 30, d.y + 15, 4, 3)

      // Stool
      ctx.fillStyle = '#4b3422'
      ctx.fillRect(d.x + 18, d.y + 22, 10, 8)
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.fillRect(d.x + 19, d.y + 23, 8, 2)
      break
    }
    case 'atelier_sculpture': {
      // Pedestal
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.beginPath()
      ctx.ellipse(d.x + 26, d.y + 56, 18, 6, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#1f2937'
      ctx.fillRect(d.x + 12, d.y + 36, 28, 16)
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.fillRect(d.x + 14, d.y + 38, 24, 2)

      // Sculpture
      ctx.fillStyle = '#94a3b8'
      ctx.beginPath()
      ctx.arc(d.x + 26, d.y + 24, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#cbd5f5'
      ctx.fillRect(d.x + 22, d.y + 24, 8, 12)
      ctx.fillStyle = '#a855f7'
      ctx.fillRect(d.x + 24, d.y + 16, 4, 4)
      break
    }
    case 'atelier_moodboard': {
      // Moodboard on a stand
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.beginPath()
      ctx.ellipse(d.x + 28, d.y + 44, 20, 6, 0, 0, Math.PI * 2)
      ctx.fill()

      // Board
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(d.x + 6, d.y + 8, 48, 28)
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(d.x + 8, d.y + 10, 44, 24)

      // Notes
      ctx.fillStyle = '#fef08a'
      ctx.fillRect(d.x + 12, d.y + 14, 8, 6)
      ctx.fillStyle = '#bae6fd'
      ctx.fillRect(d.x + 24, d.y + 12, 10, 7)
      ctx.fillStyle = '#fecdd3'
      ctx.fillRect(d.x + 38, d.y + 18, 8, 6)

      // Stand legs
      ctx.strokeStyle = '#475569'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(d.x + 14, d.y + 36)
      ctx.lineTo(d.x + 10, d.y + 52)
      ctx.moveTo(d.x + 44, d.y + 36)
      ctx.lineTo(d.x + 48, d.y + 52)
      ctx.stroke()
      break
    }
    case 'desk': {
      // Desk + monitor footprint: ~78x52px
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.20)'
      ctx.beginPath()
      ctx.ellipse(d.x + 38, d.y + 46, 34, 9, 0, 0, Math.PI * 2)
      ctx.fill()

      // Monitor stand
      ctx.fillStyle = '#374151'
      ctx.fillRect(d.x + 37, d.y + 18, 5, 14)
      ctx.fillStyle = 'rgba(255,255,255,0.10)'
      ctx.fillRect(d.x + 38, d.y + 19, 2, 12)

      // Monitor frame
      ctx.fillStyle = '#111827'
      ctx.fillRect(d.x + 24, d.y + 4, 30, 18)
      // Screen (color varies by seed)
      const screen = d.seed > 0.66 ? '#22c55e' : d.seed > 0.33 ? '#60a5fa' : '#a855f7'
      ctx.fillStyle = screen
      ctx.fillRect(d.x + 27, d.y + 7, 24, 12)
      // Screen highlight
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.fillRect(d.x + 28, d.y + 8, 8, 3)

      // Desk top
      const topDark = '#6b4a2b'
      const topMid = '#8a5a33'
      ctx.fillStyle = topDark
      ctx.fillRect(d.x + 10, d.y + 32, 56, 10)
      ctx.fillStyle = topMid
      ctx.fillRect(d.x + 12, d.y + 34, 52, 6)
      ctx.fillStyle = 'rgba(0,0,0,0.14)'
      ctx.fillRect(d.x + 10, d.y + 41, 56, 1)

      // Legs
      ctx.fillStyle = '#4b3422'
      ctx.fillRect(d.x + 16, d.y + 42, 5, 12)
      ctx.fillRect(d.x + 54, d.y + 42, 5, 12)

      // Keyboard
      ctx.fillStyle = '#0b1220'
      ctx.fillRect(d.x + 26, d.y + 38, 28, 4)
      ctx.fillStyle = 'rgba(255,255,255,0.10)'
      ctx.fillRect(d.x + 27, d.y + 39, 26, 1)

      // PC tower (right)
      ctx.fillStyle = '#1f2937'
      ctx.fillRect(d.x + 66, d.y + 26, 12, 28)
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.fillRect(d.x + 67, d.y + 27, 2, 26)
      // Power LED
      ctx.fillStyle = '#fcd34d'
      ctx.fillRect(d.x + 75, d.y + 32, 1, 1)
      break
    }
    case 'house': {
      // House footprint: ~64x64px (2 tiles wide, 2 tiles tall)
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.22)'
      ctx.beginPath()
      ctx.ellipse(d.x + 32, d.y + 64, 28, 8, 0, 0, Math.PI * 2)
      ctx.fill()

      // Roof
      const roofDark = '#7c2d12'
      const roofMid = '#9a3412'
      const roofLight = '#c2410c'

      ctx.fillStyle = roofDark
      ctx.fillRect(d.x + 6, d.y + 10, 52, 20)
      ctx.fillRect(d.x + 10, d.y + 6, 44, 8)

      ctx.fillStyle = roofMid
      ctx.fillRect(d.x + 8, d.y + 12, 48, 16)

      if (d.seed > 0.35) {
        ctx.fillStyle = roofLight
        ctx.fillRect(d.x + 14, d.y + 14, 10, 3)
        ctx.fillRect(d.x + 30, d.y + 18, 12, 3)
      }

      // Chimney (optional)
      if (d.seed > 0.6) {
        ctx.fillStyle = '#4b5563'
        ctx.fillRect(d.x + 44, d.y + 4, 6, 10)
        ctx.fillStyle = 'rgba(255,255,255,0.10)'
        ctx.fillRect(d.x + 45, d.y + 5, 2, 8)
      }

      // Walls
      ctx.fillStyle = '#d6c2a8'
      ctx.fillRect(d.x + 10, d.y + 30, 44, 30)
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.fillRect(d.x + 10, d.y + 58, 44, 2)

      // Door
      ctx.fillStyle = '#6b4a2b'
      ctx.fillRect(d.x + 30, d.y + 42, 10, 18)
      ctx.fillStyle = 'rgba(255,255,255,0.10)'
      ctx.fillRect(d.x + 31, d.y + 44, 2, 14)
      ctx.fillStyle = '#fcd34d'
      ctx.fillRect(d.x + 38, d.y + 51, 2, 2)

      // Windows
      ctx.fillStyle = '#1f6aa8'
      ctx.fillRect(d.x + 16, d.y + 40, 8, 8)
      ctx.fillRect(d.x + 44, d.y + 40, 6, 8)
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.fillRect(d.x + 17, d.y + 41, 3, 2)
      ctx.fillRect(d.x + 45, d.y + 41, 2, 2)

      // Roof outline hint
      ctx.fillStyle = 'rgba(0,0,0,0.14)'
      ctx.fillRect(d.x + 6, d.y + 30, 52, 2)
      break
    }
    case 'tree': {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.beginPath()
      ctx.ellipse(d.x + 18, d.y + 50, 18, 6, 0, 0, Math.PI * 2)
      ctx.fill()

      // Trunk
      ctx.fillStyle = '#6b4a2b'
      ctx.fillRect(d.x + 14, d.y + 34, 8, 18)
      ctx.fillStyle = 'rgba(255,255,255,0.10)'
      ctx.fillRect(d.x + 15, d.y + 36, 2, 14)

      // Canopy (pixel blob)
      const dark = '#1f5d2a'
      const mid = '#2f7a3a'
      const light = '#49a04f'

      ctx.fillStyle = dark
      ctx.fillRect(d.x + 2, d.y + 10, 32, 18)
      ctx.fillRect(d.x + 6, d.y + 4, 24, 10)
      ctx.fillRect(d.x + 8, d.y + 26, 20, 10)

      ctx.fillStyle = mid
      ctx.fillRect(d.x + 4, d.y + 12, 28, 14)
      ctx.fillRect(d.x + 8, d.y + 6, 20, 8)

      if (d.seed > 0.3) {
        ctx.fillStyle = light
        ctx.fillRect(d.x + 10, d.y + 10, 8, 4)
        ctx.fillRect(d.x + 20, d.y + 16, 6, 3)
      }

      // Outline hint
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.fillRect(d.x + 2, d.y + 28, 32, 2)
      break
    }
    case 'bush': {
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.beginPath()
      ctx.ellipse(d.x + 14, d.y + 22, 14, 5, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#2f7a3a'
      ctx.fillRect(d.x + 4, d.y + 10, 20, 14)
      ctx.fillRect(d.x + 2, d.y + 14, 24, 10)
      ctx.fillStyle = '#49a04f'
      if (d.seed > 0.5) ctx.fillRect(d.x + 8, d.y + 12, 6, 3)
      if (d.seed > 0.75) ctx.fillRect(d.x + 16, d.y + 16, 6, 3)
      break
    }
    case 'flower_patch': {
      ctx.fillStyle = 'rgba(0,0,0,0.16)'
      ctx.beginPath()
      ctx.ellipse(d.x + 12, d.y + 18, 12, 4, 0, 0, Math.PI * 2)
      ctx.fill()

      const colors = ['#f97316', '#e879f9', '#facc15', '#60a5fa', '#f472b6']
      const c1 = colors[Math.floor(d.seed * colors.length)]
      const c2 = colors[Math.floor(hash2D(d.seed * 100, 3) * colors.length)]

      ctx.fillStyle = '#2f7a3a'
      ctx.fillRect(d.x + 4, d.y + 8, 16, 10)
      ctx.fillRect(d.x + 6, d.y + 14, 18, 8)

      ctx.fillStyle = c1
      ctx.fillRect(d.x + 6, d.y + 10, 2, 2)
      ctx.fillRect(d.x + 12, d.y + 12, 2, 2)
      ctx.fillRect(d.x + 18, d.y + 10, 2, 2)

      ctx.fillStyle = c2
      ctx.fillRect(d.x + 9, d.y + 16, 2, 2)
      ctx.fillRect(d.x + 15, d.y + 16, 2, 2)
      break
    }
    case 'grass_tuft': {
      ctx.fillStyle = 'rgba(0,0,0,0.14)'
      ctx.beginPath()
      ctx.ellipse(d.x + 10, d.y + 16, 10, 3, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#2f7a3a'
      ctx.fillRect(d.x + 4, d.y + 8, 12, 8)
      ctx.fillStyle = '#49a04f'
      ctx.fillRect(d.x + 6, d.y + 6, 2, 6)
      ctx.fillRect(d.x + 10, d.y + 5, 2, 7)
      ctx.fillRect(d.x + 14, d.y + 7, 2, 6)
      break
    }
    case 'fallen_log': {
      ctx.fillStyle = 'rgba(0,0,0,0.16)'
      ctx.beginPath()
      ctx.ellipse(d.x + 18, d.y + 16, 16, 4, 0, 0, Math.PI * 2)
      ctx.fill()

      const bark = d.seed > 0.5 ? '#8b5e3c' : '#7c4a2b'
      ctx.fillStyle = bark
      ctx.fillRect(d.x + 4, d.y + 8, 28, 8)
      ctx.fillStyle = 'rgba(255,255,255,0.12)'
      ctx.fillRect(d.x + 6, d.y + 10, 24, 2)
      ctx.fillStyle = '#4b3422'
      ctx.fillRect(d.x + 30, d.y + 8, 4, 8)
      break
    }
    case 'rock': {
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.beginPath()
      ctx.ellipse(d.x + 12, d.y + 18, 12, 4, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#6b7280'
      ctx.fillRect(d.x + 4, d.y + 8, 16, 12)
      ctx.fillStyle = '#9ca3af'
      ctx.fillRect(d.x + 6, d.y + 10, 6, 3)
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.fillRect(d.x + 4, d.y + 18, 16, 2)
      break
    }
  }
}

