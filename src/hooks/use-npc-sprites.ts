'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { SpriteSheet, AgentNPC } from '@/types'
import { loadSpriteSheet } from '@/lib/sprite-utils'
import { getNpcSprite, setNpcSprite, hasNpcSprite } from '@/lib/npc-sprite-cache'
import { generateNpcSpriteAction } from '@/app/actions/generate'

interface UseNpcSpritesResult {
  sprites: Map<string, SpriteSheet>
  isLoading: boolean
  isGenerating: boolean
  generatingIds: Set<string>
  generateSprite: (agent: AgentNPC) => Promise<string | null>
  getSprite: (agentId: string) => SpriteSheet | undefined
}

/**
 * Check if a pre-generated sprite exists in public/sprites/
 */
async function checkPublicSprite(agentId: string, type: 'agents' | 'mobs' = 'agents'): Promise<string | null> {
  const url = `/sprites/${type}/${agentId}.png`
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
 * Hook to manage NPC sprite sheets
 * 
 * - Loads sprites from public/sprites/ (pre-generated)
 * - Falls back to cached sprites from localStorage
 * - Generates missing sprites on-demand
 * - Provides access to loaded SpriteSheet objects
 */
export function useNpcSprites(agents: AgentNPC[]): UseNpcSpritesResult {
  const [sprites, setSprites] = useState<Map<string, SpriteSheet>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set())
  
  // Track which agents we've already processed
  const processedRef = useRef<Set<string>>(new Set())
  const loadingRef = useRef<Set<string>>(new Set())

  // Load sprites from public folder or cache on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadSprites = async () => {
      setIsLoading(true)
      const newSprites = new Map<string, SpriteSheet>()

      const loadPromises = agents.map(async (agent) => {
        // Skip if already processed or loading
        if (processedRef.current.has(agent.id) || loadingRef.current.has(agent.id)) {
          return
        }

        loadingRef.current.add(agent.id)

        try {
          // 1. Check if agent has embedded sprite
          if (agent.spriteSheetBase64) {
            const sheet = await loadSpriteSheet(agent.spriteSheetBase64)
            newSprites.set(agent.id, sheet)
            processedRef.current.add(agent.id)
            return
          }

          // 2. Check for pre-generated sprite in public/sprites/agents/
          const publicUrl = await checkPublicSprite(agent.id, 'agents')
          if (publicUrl) {
            const sheet = await loadSpriteSheet(publicUrl)
            newSprites.set(agent.id, sheet)
            processedRef.current.add(agent.id)
            return
          }

          // 3. Check localStorage cache
          const cached = getNpcSprite(agent.id)
          if (cached) {
            const sheet = await loadSpriteSheet(cached)
            newSprites.set(agent.id, sheet)
            processedRef.current.add(agent.id)
            return
          }

          // 4. No sprite found - will use emoji fallback
        } catch (e) {
          console.warn(`Failed to load sprite for ${agent.id}:`, e)
        } finally {
          loadingRef.current.delete(agent.id)
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
  }, [agents])

  // Generate a sprite for an agent
  const generateSprite = useCallback(async (agent: AgentNPC): Promise<string | null> => {
    // Already have it?
    if (sprites.has(agent.id) || hasNpcSprite(agent.id)) {
      return getNpcSprite(agent.id)
    }

    // Already generating?
    if (generatingIds.has(agent.id)) {
      return null
    }

    setGeneratingIds(prev => new Set(prev).add(agent.id))
    setIsGenerating(true)

    try {
      const result = await generateNpcSpriteAction(
        agent.name,
        agent.role,
        agent.avatar,
        agent.gender
      )

      if (result.success && result.data) {
        // Cache it
        setNpcSprite(agent.id, result.data)

        // Load and store the sprite sheet
        try {
          const sheet = await loadSpriteSheet(result.data)
          setSprites(prev => {
            const newMap = new Map(prev)
            newMap.set(agent.id, sheet)
            return newMap
          })
          processedRef.current.add(agent.id)
        } catch (e) {
          console.warn(`Failed to load generated sprite for ${agent.id}:`, e)
        }

        return result.data
      } else {
        console.error(`Failed to generate sprite for ${agent.id}:`, result.error)
        return null
      }
    } catch (e) {
      console.error(`Error generating sprite for ${agent.id}:`, e)
      return null
    } finally {
      setGeneratingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(agent.id)
        return newSet
      })
      setIsGenerating(prev => generatingIds.size > 1 ? prev : false)
    }
  }, [sprites, generatingIds])

  // Get a sprite by ID
  const getSprite = useCallback((agentId: string): SpriteSheet | undefined => {
    return sprites.get(agentId)
  }, [sprites])

  return {
    sprites,
    isLoading,
    isGenerating,
    generatingIds,
    generateSprite,
    getSprite,
  }
}

/**
 * Hook for a single NPC sprite (simpler API)
 */
export function useNpcSprite(agent: AgentNPC | null): {
  spriteSheet: SpriteSheet | null
  isLoading: boolean
  isGenerating: boolean
  generate: () => Promise<void>
} {
  const [spriteSheet, setSpriteSheet] = useState<SpriteSheet | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Load from cache or embedded
  useEffect(() => {
    if (!agent) {
      setSpriteSheet(null)
      return
    }

    const load = async () => {
      setIsLoading(true)

      // Try embedded first
      if (agent.spriteSheetBase64) {
        try {
          const sheet = await loadSpriteSheet(agent.spriteSheetBase64)
          setSpriteSheet(sheet)
          setIsLoading(false)
          return
        } catch (e) {
          console.warn('Failed to load embedded sprite:', e)
        }
      }

      // Try cache
      const cached = getNpcSprite(agent.id)
      if (cached) {
        try {
          const sheet = await loadSpriteSheet(cached)
          setSpriteSheet(sheet)
        } catch (e) {
          console.warn('Failed to load cached sprite:', e)
        }
      }

      setIsLoading(false)
    }

    load()
  }, [agent])

  const generate = useCallback(async () => {
    if (!agent || isGenerating) return

    setIsGenerating(true)

    try {
      const result = await generateNpcSpriteAction(
        agent.name,
        agent.role,
        agent.avatar,
        agent.gender
      )

      if (result.success && result.data) {
        setNpcSprite(agent.id, result.data)
        const sheet = await loadSpriteSheet(result.data)
        setSpriteSheet(sheet)
      }
    } catch (e) {
      console.error('Failed to generate sprite:', e)
    } finally {
      setIsGenerating(false)
    }
  }, [agent, isGenerating])

  return {
    spriteSheet,
    isLoading,
    isGenerating,
    generate,
  }
}
