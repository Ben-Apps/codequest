import type { SpriteFrame, SpriteAnimation, AnimationType, SpriteSheet, FrameConfig } from '@/types'

/**
 * SPRITE SHEET CONVENTION:
 * ========================
 * The sprite sheet is organized as a 4x4 grid (4 columns, 4 rows).
 * 
 * Row Layout (4 directions of movement):
 * - Row 0: Walk DOWN  (4 frames) - character walking towards camera
 * - Row 1: Walk LEFT  (4 frames) - character walking left
 * - Row 2: Walk RIGHT (4 frames) - character walking right
 * - Row 3: Walk UP    (4 frames) - character walking away from camera
 * 
 * Each frame is equally sized: (imageWidth / 4) x (imageHeight / 4)
 */

const DEFAULT_ROWS = 4
const DEFAULT_COLS = 4

const animationRows: Record<AnimationType, number> = {
  walk_down: 0,
  walk_left: 1,
  walk_right: 2,
  walk_up: 3,
}

const frameRates: Record<AnimationType, number> = {
  walk_down: 6,
  walk_left: 6,
  walk_right: 6,
  walk_up: 6,
}

function createFramesForRow(
  row: number,
  frameWidth: number,
  frameHeight: number,
  cols: number,
  offsetX: number = 0,
  offsetY: number = 0
): SpriteFrame[] {
  const frames: SpriteFrame[] = []
  // Use floor to ensure clean pixel boundaries and prevent sprite bleed
  const fw = Math.floor(frameWidth)
  const fh = Math.floor(frameHeight)
  const ox = Math.floor(offsetX)
  const oy = Math.floor(offsetY)

  for (let col = 0; col < cols; col++) {
    frames.push({
      x: ox + col * fw,
      y: oy + row * fh,
      width: fw,
      height: fh,
    })
  }
  return frames
}

function createAnimations(config: FrameConfig): Record<AnimationType, SpriteAnimation> {
  const animations: Record<AnimationType, SpriteAnimation> = {} as Record<AnimationType, SpriteAnimation>

  for (const [animType, row] of Object.entries(animationRows)) {
    const type = animType as AnimationType
    animations[type] = {
      name: type,
      frames: createFramesForRow(
        row,
        config.frameWidth,
        config.frameHeight,
        config.cols,
        config.offsetX,
        config.offsetY
      ),
      frameRate: frameRates[type],
    }
  }

  return animations
}

/**
 * Removes white/light background from an image aggressively.
 * Makes all very light pixels (white, off-white, light gray) transparent.
 */
function removeBackground(img: HTMLImageElement): HTMLImageElement {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height

  const ctx = canvas.getContext('2d')
  if (!ctx) return img

  ctx.drawImage(img, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Aggressive approach: Remove any pixel that is very light
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Check if pixel is "very light" - all channels above 220 (white/near-white)
    const isVeryLight = r > 220 && g > 220 && b > 220
    
    // Also check for light gray (all channels above 200 and similar to each other)
    const isLightGray = r > 200 && g > 200 && b > 200 && 
      Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20

    if (isVeryLight || isLightGray) {
      data[i + 3] = 0 // Set alpha to 0 (transparent)
    }
  }

  ctx.putImageData(imageData, 0, 0)

  const newImg = new Image()
  newImg.src = canvas.toDataURL('image/png')

  return newImg
}

export function getDefaultFrameConfig(imageWidth: number, imageHeight: number): FrameConfig {
  return {
    offsetX: 0,
    offsetY: 0,
    frameWidth: Math.floor(imageWidth / DEFAULT_COLS),
    frameHeight: Math.floor(imageHeight / DEFAULT_ROWS),
    cols: DEFAULT_COLS,
    rows: DEFAULT_ROWS,
  }
}

export async function loadSpriteSheet(
  imageUrl: string,
  customConfig?: Partial<FrameConfig>
): Promise<SpriteSheet> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'

    image.onload = () => {
      const defaultConfig = getDefaultFrameConfig(image.width, image.height)
      const config: FrameConfig = { ...defaultConfig, ...customConfig }

      const processedImage = removeBackground(image)

      const finalize = (img: HTMLImageElement) => {
        resolve({
          image: img,
          animations: createAnimations(config),
          frameWidth: config.frameWidth,
          frameHeight: config.frameHeight,
        })
      }

      if (processedImage.complete && processedImage.src) {
        finalize(processedImage)
      } else {
        processedImage.onload = () => finalize(processedImage)
      }
    }

    image.onerror = () => {
      reject(new Error('Failed to load sprite sheet image'))
    }

    image.src = imageUrl
  })
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  spriteSheet: SpriteSheet,
  frame: SpriteFrame,
  x: number,
  y: number,
  scale: number = 1
): void {
  ctx.save()

  // Disable image smoothing to prevent sprite bleed from adjacent frames
  ctx.imageSmoothingEnabled = false

  // Round all coordinates to prevent sub-pixel rendering artifacts
  const srcX = Math.floor(frame.x)
  const srcY = Math.floor(frame.y)
  const srcW = Math.floor(frame.width)
  const srcH = Math.floor(frame.height)
  const dstX = Math.floor(x)
  const dstY = Math.floor(y)
  const dstW = Math.floor(frame.width * scale)
  const dstH = Math.floor(frame.height * scale)

  ctx.drawImage(
    spriteSheet.image,
    srcX,
    srcY,
    srcW,
    srcH,
    dstX,
    dstY,
    dstW,
    dstH
  )

  ctx.restore()
}
