'use client'

/*
  This hook synchronizes sprite sheet state with an external resource (imageUrl)
  and intentionally updates React state from an effect.
*/

import { useState, useEffect } from 'react'
import type { SpriteSheet } from '@/types'
import { loadSpriteSheet } from '@/lib/sprite-utils'

interface UseSpriteSheetResult {
  spriteSheet: SpriteSheet | null
  isLoading: boolean
  error: string | null
}

export function useSpriteSheet(imageUrl: string | null): UseSpriteSheetResult {
  const [spriteSheet, setSpriteSheet] = useState<SpriteSheet | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!imageUrl) {
      queueMicrotask(() => setSpriteSheet(null))
      return
    }

    queueMicrotask(() => {
      setIsLoading(true)
      setError(null)
    })

    loadSpriteSheet(imageUrl)
      .then((sheet) => {
        setSpriteSheet(sheet)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load sprite sheet')
        setIsLoading(false)
      })
  }, [imageUrl])

  return { spriteSheet, isLoading, error }
}
