import type { TileType } from '@/types'

export const TILE_SIZE = 32

type Rect = { x: number; y: number; w: number; h: number }

function rectsIntersect(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function intersectsAny(rect: Rect, rects: Rect[] | undefined) {
  if (!rects || rects.length === 0) return false
  for (const r of rects) {
    if (rectsIntersect(rect, r)) return true
  }
  return false
}

function fract(n: number) {
  return n - Math.floor(n)
}

function hash2D(x: number, y: number) {
  // Deterministic pseudo-random in [0,1)
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123)
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

// Generate tiles with seeded pseudo-random for consistency
export function generateTiles(
  width: number,
  height: number,
  theme: 'outdoor' | 'ai_university' | 'ai_labor' | 'design_atelier' | 'security_hub' = 'outdoor',
  options: { avoidRects?: Rect[]; roadTargets?: Array<{ x: number; y: number }>; pathRects?: Rect[] } = {}
): TileType[][] {
  const cols = Math.ceil(width / TILE_SIZE)
  const rows = Math.ceil(height / TILE_SIZE)
  const tiles: TileType[][] = []

  if (theme === 'design_atelier') {
    for (let row = 0; row < rows; row++) {
      tiles[row] = []
      for (let col = 0; col < cols; col++) {
        const isBorder = row === 0 || col === 0 || row === rows - 1 || col === cols - 1
        const isInnerBorder = row === 1 || col === 1 || row === rows - 2 || col === cols - 2

        if (isBorder) {
          tiles[row][col] = 'wall'
          continue
        }

        if (isInnerBorder && hash2D(col + 1337, row + 1337) > 0.38) {
          tiles[row][col] = 'wall'
          continue
        }

        const midCol = Math.floor(cols / 2)
        const midRow = Math.floor(rows / 2)
        const carpetHalfWidth = 3
        const carpetStartRow = Math.max(2, rows - 6)
        const carpetEndRow = Math.max(2, Math.floor(rows * 0.3))
        const inCarpetX = Math.abs(col - midCol) <= carpetHalfWidth
        const inCarpetY = row <= carpetStartRow && row >= carpetEndRow

        const studioRect =
          row >= midRow - 3 &&
          row <= midRow + 3 &&
          col >= midCol - 9 &&
          col <= midCol + 9

        if ((inCarpetX && inCarpetY) || studioRect) {
          tiles[row][col] = 'carpet'
        } else {
          tiles[row][col] = 'floor'
        }
      }
    }

    return tiles
  }

  if (theme === 'ai_university' || theme === 'ai_labor') {
    for (let row = 0; row < rows; row++) {
      tiles[row] = []
      for (let col = 0; col < cols; col++) {
        const isBorder = row === 0 || col === 0 || row === rows - 1 || col === cols - 1
        const isInnerBorder = row === 1 || col === 1 || row === rows - 2 || col === cols - 2

        if (isBorder) {
          tiles[row][col] = 'wall'
          continue
        }

        // a slightly thicker wall band for a "room" feel
        if (isInnerBorder && hash2D(col + 999, row + 999) > 0.35) {
          tiles[row][col] = 'wall'
          continue
        }

        // Carpet runner from entrance (bottom center) to the hall
        const midCol = Math.floor(cols / 2)
        const carpetHalfWidth = theme === 'ai_labor' ? 1 : 2
        const inCarpetX = Math.abs(col - midCol) <= carpetHalfWidth
        const carpetStartRow = Math.max(2, rows - 6)
        const carpetEndRow = Math.max(2, Math.floor(rows * (theme === 'ai_labor' ? 0.42 : 0.35)))
        const inCarpetY = row <= carpetStartRow && row >= carpetEndRow

        if (inCarpetX && inCarpetY) {
          tiles[row][col] = 'carpet'
        } else {
          tiles[row][col] = 'floor'
        }
      }
    }

    return tiles
  }

  if (theme === 'security_hub') {
    for (let row = 0; row < rows; row++) {
      tiles[row] = []
      for (let col = 0; col < cols; col++) {
        const isBorder = row === 0 || col === 0 || row === rows - 1 || col === cols - 1
        const isInnerBorder = row === 1 || col === 1 || row === rows - 2 || col === cols - 2

        if (isBorder) {
          tiles[row][col] = 'wall'
          continue
        }

        // Security Hub has thicker walls for a "bunker" feel
        if (isInnerBorder && hash2D(col + 777, row + 777) > 0.30) {
          tiles[row][col] = 'wall'
          continue
        }

        // Carpet runner from entrance (bottom center) to the command center
        const midCol = Math.floor(cols / 2)
        const carpetHalfWidth = 2
        const inCarpetX = Math.abs(col - midCol) <= carpetHalfWidth
        const carpetStartRow = Math.max(2, rows - 6)
        const carpetEndRow = Math.max(2, Math.floor(rows * 0.30))
        const inCarpetY = row <= carpetStartRow && row >= carpetEndRow

        if (inCarpetX && inCarpetY) {
          tiles[row][col] = 'carpet'
        } else {
          tiles[row][col] = 'floor'
        }
      }
    }

    return tiles
  }

  // Outdoor water should not overlap important world objects (e.g. fixed buildings).
  // We apply padding so water doesn't visually "touch" those objects either.
  const WATER_AVOID_PADDING = 48
  const avoidRects: Rect[] | undefined =
    options.avoidRects && options.avoidRects.length
      ? options.avoidRects.map((r) => ({
          x: r.x - WATER_AVOID_PADDING,
          y: r.y - WATER_AVOID_PADDING,
          w: r.w + WATER_AVOID_PADDING * 2,
          h: r.h + WATER_AVOID_PADDING * 2,
        }))
      : undefined

  const roadTiles = new Set<string>()
  const forcedPathTiles = new Set<string>()
  const markRoad = (row: number, col: number, radius = 0) => {
    for (let r = row - radius; r <= row + radius; r++) {
      for (let c = col - radius; c <= col + radius; c++) {
        if (r < 0 || c < 0 || r >= rows || c >= cols) continue
        roadTiles.add(`${r},${c}`)
      }
    }
  }
  const markRectAsPath = (rect: Rect) => {
    const startCol = Math.max(0, Math.floor(rect.x / TILE_SIZE))
    const endCol = Math.min(cols - 1, Math.floor((rect.x + rect.w - 1) / TILE_SIZE))
    const startRow = Math.max(0, Math.floor(rect.y / TILE_SIZE))
    const endRow = Math.min(rows - 1, Math.floor((rect.y + rect.h - 1) / TILE_SIZE))
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        forcedPathTiles.add(`${r},${c}`)
      }
    }
  }

  if (theme === 'outdoor' && options.pathRects?.length) {
    for (const rect of options.pathRects) {
      markRectAsPath(rect)
    }
  }

  if (theme === 'outdoor' && options.roadTargets?.length) {
    const midCol = Math.floor(cols / 2)
    const midRow = Math.floor(rows / 2)

    for (const t of options.roadTargets) {
      const targetCol = Math.max(0, Math.min(cols - 1, Math.floor(t.x / TILE_SIZE)))
      const targetRow = Math.max(0, Math.min(rows - 1, Math.floor(t.y / TILE_SIZE)))

      const colStep = targetCol >= midCol ? 1 : -1
      for (let c = midCol; c !== targetCol; c += colStep) {
        markRoad(midRow, c, 0)
      }
      markRoad(midRow, targetCol, 0)

      const rowStep = targetRow >= midRow ? 1 : -1
      for (let r = midRow; r !== targetRow; r += rowStep) {
        markRoad(r, targetCol, 0)
      }
      markRoad(targetRow, targetCol, 1)
    }
  }

  for (let row = 0; row < rows; row++) {
    tiles[row] = []
    for (let col = 0; col < cols; col++) {
      // Create a path cross in the middle
      const midCol = Math.floor(cols / 2)
      const midRow = Math.floor(rows / 2)

      const rand = hash2D(col, row)

  // --- Water: a single lake (elliptical blob) with soft edges ---
      const nx = col / Math.max(1, cols - 1)
      const ny = row / Math.max(1, rows - 1)

  // Place a smaller lake in the far bottom-left so it stays out of the way.
  const lakeX = 0.03
  const lakeY = 0.92

  const lakeMask =
    Math.sqrt(((nx - lakeX) / 0.10) ** 2 + ((ny - lakeY) / 0.08) ** 2) +
        (hash2D(col * 3, row * 3) - 0.5) * 0.14

  const waterChance = 1 - smoothstep(0.88, 1.10, lakeMask)
  const candidateWater = waterChance > 0.78 && rand > 0.45

      // Keep center cross and roads walkable
      const isPath =
        Math.abs(col - midCol) <= 1 ||
        Math.abs(row - midRow) <= 1 ||
        roadTiles.has(`${row},${col}`) ||
        forcedPathTiles.has(`${row},${col}`)

      if (isPath) {
        tiles[row][col] = 'path'
      } else if (candidateWater) {
        const tileRect: Rect = { x: col * TILE_SIZE, y: row * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE }
        const isBlocked = intersectsAny(tileRect, avoidRects)
        tiles[row][col] = isBlocked ? (rand > 0.55 ? 'grass_dark' : 'grass') : 'water'
      } else if (rand > 0.86) {
        tiles[row][col] = 'grass_flower'
      } else if (rand > 0.50) {
        tiles[row][col] = 'grass_dark'
      } else {
        tiles[row][col] = 'grass'
      }
    }
  }

  return tiles
}

// Draw a single tile on canvas
export function drawTile(
  ctx: CanvasRenderingContext2D,
  type: TileType,
  x: number,
  y: number,
  seed: number
): void {
  const size = TILE_SIZE

  switch (type) {
    case 'grass':
      ctx.fillStyle = '#3f7a2a'
      ctx.fillRect(x, y, size, size)
      // Grass detail
      if (seed > 0.7) {
        ctx.fillStyle = '#4f8c32'
        ctx.fillRect(x + 3, y + 5, 5, 3)
      }
      if (seed > 0.3) {
        ctx.fillStyle = '#2f6320'
        ctx.fillRect(x + 20, y + 16, 4, 3)
      }
      if (seed > 0.85) {
        ctx.fillStyle = 'rgba(0,0,0,0.12)'
        ctx.fillRect(x + 10, y + 22, 8, 2)
      }
      break

    case 'grass_dark':
      ctx.fillStyle = '#2f6320'
      ctx.fillRect(x, y, size, size)
      ctx.fillStyle = '#3f7a2a'
      ctx.fillRect(x + 7, y + 9, 6, 4)
      if (seed > 0.6) {
        ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.fillRect(x + 18, y + 6, 6, 2)
      }
      break

    case 'grass_flower':
      // Base grass
      ctx.fillStyle = '#3f7a2a'
      ctx.fillRect(x, y, size, size)
      // Flower
      const flowerColors = ['#e74c3c', '#f39c12', '#9b59b6', '#e91e63', '#ff5722']
      ctx.fillStyle = flowerColors[Math.floor(seed * flowerColors.length)]
      ctx.fillRect(x + 15, y + 14, 2, 2)
      ctx.fillRect(x + 14, y + 15, 4, 2)
      ctx.fillRect(x + 15, y + 16, 2, 2)
      // Flower center
      ctx.fillStyle = '#f1c40f'
      ctx.fillRect(x + 15, y + 15, 2, 2)
      break

    case 'path':
      ctx.fillStyle = '#c9a56a'
      ctx.fillRect(x, y, size, size)
      // Path texture
      ctx.fillStyle = '#b99355'
      if (seed > 0.5) {
        ctx.fillRect(x + 6, y + 10, 6, 5)
      }
      if (seed > 0.7) {
        ctx.fillRect(x + 18, y + 4, 4, 4)
      }
      if (seed > 0.82) {
        ctx.fillStyle = 'rgba(0,0,0,0.10)'
        ctx.fillRect(x + 10, y + 20, 10, 3)
      }
      break

    case 'water':
      // Deeper, more layered water
      ctx.fillStyle = '#1f6aa8'
      ctx.fillRect(x, y, size, size)
      // Subtle depth gradient
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillRect(x, y, size, 2)
      ctx.fillStyle = 'rgba(0,0,0,0.10)'
      ctx.fillRect(x, y + size - 2, size, 2)

      // Waves (pixel clusters)
      ctx.fillStyle = '#58b6ff'
      if (seed > 0.25) ctx.fillRect(x + 4, y + 7, 10, 2)
      if (seed > 0.55) ctx.fillRect(x + 14, y + 15, 12, 2)
      if (seed > 0.78) ctx.fillRect(x + 6, y + 22, 8, 2)
      break

    case 'floor': {
      // Indoor stone floor
      ctx.fillStyle = '#0b1220'
      ctx.fillRect(x, y, size, size)
      // subtle tile variation
      ctx.fillStyle = seed > 0.6 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.14)'
      ctx.fillRect(x + 2, y + 2, size - 4, 1)
      ctx.fillRect(x + 2, y + size - 3, size - 4, 1)
      if (seed > 0.72) {
        ctx.fillStyle = 'rgba(16,185,129,0.10)'
        ctx.fillRect(x + 5, y + 10, 4, 2)
      }
      break
    }

    case 'carpet': {
      // Emerald runner
      ctx.fillStyle = '#0b2922'
      ctx.fillRect(x, y, size, size)
      ctx.fillStyle = 'rgba(16,185,129,0.18)'
      ctx.fillRect(x, y + 2, size, 2)
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.fillRect(x, y + size - 3, size, 2)
      if (seed > 0.55) {
        ctx.fillStyle = 'rgba(255,255,255,0.06)'
        ctx.fillRect(x + 6, y + 15, 6, 2)
      }
      break
    }

    case 'wall': {
      // Dark wall blocks
      ctx.fillStyle = '#111827'
      ctx.fillRect(x, y, size, size)
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillRect(x + 2, y + 2, size - 4, 2)
      ctx.fillStyle = 'rgba(0,0,0,0.20)'
      ctx.fillRect(x + 2, y + size - 4, size - 4, 2)
      // brick-ish seams
      if (seed > 0.35) {
        ctx.fillStyle = 'rgba(0,0,0,0.22)'
        ctx.fillRect(x + 1, y + 14, size - 2, 1)
        ctx.fillRect(x + 1, y + 22, size - 2, 1)
      }
      break
    }
  }
}

// Render all tiles
export function renderTiles(
  ctx: CanvasRenderingContext2D,
  tiles: TileType[][],
  viewportWidth: number,
  viewportHeight: number,
  cameraX = 0,
  cameraY = 0
): void {
  const rows = tiles.length
  const cols = tiles[0]?.length ?? 0

  // Nur die sichtbaren Tiles rendern (wichtig für mobile Performance)
  const startCol = Math.max(0, Math.floor(cameraX / TILE_SIZE) - 1)
  const endCol = Math.min(cols, Math.ceil((cameraX + viewportWidth) / TILE_SIZE) + 1)
  const startRow = Math.max(0, Math.floor(cameraY / TILE_SIZE) - 1)
  const endRow = Math.min(rows, Math.ceil((cameraY + viewportHeight) / TILE_SIZE) + 1)

  for (let row = startRow; row < endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
      const seed = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453
      const rand = seed - Math.floor(seed)
      drawTile(ctx, tiles[row][col], col * TILE_SIZE, row * TILE_SIZE, rand)
    }
  }
}
