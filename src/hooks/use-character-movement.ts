'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { PlayerState, AnimationType, Direction, WorldConfig } from '@/types'

const MOVE_SPEED = 7
const CHARACTER_SIZE = 64
const TARGET_FPS = 30
const FRAME_TIME = 1000 / TARGET_FPS

const directionToAnimation: Record<Direction, AnimationType> = {
  down: 'walk_down',
  left: 'walk_left',
  right: 'walk_right',
  up: 'walk_up',
}

interface UseCharacterMovementOptions {
  worldConfig: WorldConfig
  keysPressed: React.MutableRefObject<Set<string>>
  disabled?: boolean
}

export function useCharacterMovement({
  worldConfig,
  keysPressed,
  disabled,
}: UseCharacterMovementOptions) {
  const [player, setPlayer] = useState<PlayerState>({
    x: worldConfig.worldWidth / 2 - CHARACTER_SIZE / 2,
    y: worldConfig.worldHeight / 2 - CHARACTER_SIZE / 2,
    animation: 'walk_down',
    direction: 'down',
    currentFrame: 0,
    isMoving: false,
  })

  const lastUpdateTime = useRef(0)
  const animationFrameId = useRef<number>(0)
  const frameCounter = useRef(0)

  const gameLoop = useCallback(function loop(timestamp: number) {
      if (disabled) {
        animationFrameId.current = requestAnimationFrame(loop)
        return
      }

      const elapsed = timestamp - lastUpdateTime.current

      if (elapsed >= FRAME_TIME) {
        lastUpdateTime.current = timestamp - (elapsed % FRAME_TIME)

        setPlayer((prev) => {
          const keys = keysPressed.current
          let newX = prev.x
          let newY = prev.y
          let newDirection: Direction = prev.direction
          let isMoving = false

          // 4-directional movement
          if (keys.has('w') || keys.has('arrowup')) {
            newY -= MOVE_SPEED
            newDirection = 'up'
            isMoving = true
          }
          if (keys.has('s') || keys.has('arrowdown')) {
            newY += MOVE_SPEED
            newDirection = 'down'
            isMoving = true
          }
          if (keys.has('a') || keys.has('arrowleft')) {
            newX -= MOVE_SPEED
            newDirection = 'left'
            isMoving = true
          }
          if (keys.has('d') || keys.has('arrowright')) {
            newX += MOVE_SPEED
            newDirection = 'right'
            isMoving = true
          }

          // World boundaries
          const padding = 20
          newX = Math.max(padding, Math.min(worldConfig.worldWidth - CHARACTER_SIZE - padding, newX))
          newY = Math.max(padding, Math.min(worldConfig.worldHeight - CHARACTER_SIZE - padding, newY))

          // Animation
          const newAnimation = directionToAnimation[newDirection]

          // Frame animation (cycle through 0-3)
          let newFrame = prev.currentFrame
          if (isMoving) {
            frameCounter.current++
            if (frameCounter.current % 6 === 0) {
              newFrame = (prev.currentFrame + 1) % 4
            }
          } else {
            newFrame = 0
          }

          // Only update if something changed
          if (
            prev.x === newX &&
            prev.y === newY &&
            prev.animation === newAnimation &&
            prev.currentFrame === newFrame &&
            prev.isMoving === isMoving
          ) {
            return prev
          }

          return {
            ...prev,
            x: newX,
            y: newY,
            animation: newAnimation,
            direction: newDirection,
            currentFrame: newFrame,
            isMoving,
          }
        })
      }

      animationFrameId.current = requestAnimationFrame(loop)
    }, [worldConfig, keysPressed, disabled])

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [gameLoop])

  return { player, setPlayer }
}
