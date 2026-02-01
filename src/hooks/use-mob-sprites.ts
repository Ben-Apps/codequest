'use client'

import { useState, useEffect, useRef } from 'react'
import type { SpriteSheet, Mob } from '@/types'
import { loadSpriteSheet } from '@/lib/sprite-utils'

interface UseMobSpritesResult {
  sprites: Map<string, SpriteSheet>
  isLoading: boolean
}

/**
 * Check if a pre-generated sprite exists in public/sprites/mobs/
 */
async function checkPublicSprite(mobId: string): Promise<string | null> {
  const url = `/sprites/mobs/${mobId}.png`
  try {
    const response = await fetch(url, { method: 'HEAD' })
    if (response.ok) {
      return url
    }
  } catch {
    // File doesn't exist
  }
  return null
}

/**
 * Hook to manage Mob sprite sheets
 * 
 * - Loads sprites from public/sprites/mobs/ (pre-generated)
 * - Provides access to loaded SpriteSheet objects
 */
export function useMobSprites(mobs: Mob[]): UseMobSpritesResult {
  const [sprites, setSprites] = useState<Map<string, SpriteSheet>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  
  // Track which mobs we've already processed
  const processedRef = useRef<Set<string>>(new Set())
  const loadingRef = useRef<Set<string>>(new Set())

  // Load sprites from public folder on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadSprites = async () => {
      setIsLoading(true)
      const newSprites = new Map<string, SpriteSheet>()

      // Get unique mob IDs (mobs can be duplicated)
      const uniqueMobs = new Map<string, Mob>()
      for (const mob of mobs) {
        // Extract base mob type from ID (e.g., "bug-slime" from "bug-slime" or "farm-lv2-xxx-0")
        const baseMobId = getMobTypeId(mob)
        if (!uniqueMobs.has(baseMobId)) {
          uniqueMobs.set(baseMobId, mob)
        }
      }

      const loadPromises = Array.from(uniqueMobs.entries()).map(async ([baseMobId, mob]) => {
        // Skip if already processed or loading
        if (processedRef.current.has(baseMobId) || loadingRef.current.has(baseMobId)) {
          return
        }

        loadingRef.current.add(baseMobId)

        try {
          // 1. Check if mob has embedded sprite
          if (mob.spriteSheetBase64) {
            const sheet = await loadSpriteSheet(mob.spriteSheetBase64)
            newSprites.set(baseMobId, sheet)
            processedRef.current.add(baseMobId)
            return
          }

          // 2. Check for pre-generated sprite in public/sprites/mobs/
          const publicUrl = await checkPublicSprite(baseMobId)
          if (publicUrl) {
            const sheet = await loadSpriteSheet(publicUrl)
            newSprites.set(baseMobId, sheet)
            processedRef.current.add(baseMobId)
            return
          }

          // 3. No sprite found - will use emoji fallback
        } catch (e) {
          console.warn(`Failed to load sprite for mob ${baseMobId}:`, e)
        } finally {
          loadingRef.current.delete(baseMobId)
        }
      })

      await Promise.all(loadPromises)

      if (newSprites.size > 0) {
        setSprites(prev => {
          const merged = new Map(prev)
          newSprites.forEach((sheet, id) => merged.set(id, sheet))
          return merged
        })
      }

      setIsLoading(false)
    }

    loadSprites()
  }, [mobs])

  return { sprites, isLoading }
}

/**
 * Get the base mob type ID from a mob
 * Handles both static mobs (e.g., "bug-slime") and spawned mobs (e.g., "farm-lv2-xxx-0")
 */
function getMobTypeId(mob: Mob): string {
  // If it's a spawned mob, extract type from name
  if (mob.id.startsWith('farm-')) {
    // Convert name to kebab-case (e.g., "Bug Slime Lv.2" -> "bug-slime")
    return mob.name
      .replace(/ Lv\.\d+$/, '') // Remove level suffix
      .toLowerCase()
      .replace(/\s+/g, '-')
  }
  
  // Otherwise use the ID directly
  return mob.id
}

/**
 * Get sprite for a specific mob
 */
export function getMobSpriteKey(mob: Mob): string {
  return getMobTypeId(mob)
}
