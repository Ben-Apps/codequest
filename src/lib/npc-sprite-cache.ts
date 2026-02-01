/**
 * NPC Sprite Cache
 * 
 * Manages localStorage caching of generated NPC sprites to avoid
 * regenerating them on every page load.
 */

const CACHE_PREFIX = 'agentmind_npc_sprite_'
const CACHE_VERSION = 'v1'

function getCacheKey(agentId: string): string {
  return `${CACHE_PREFIX}${CACHE_VERSION}_${agentId}`
}

/**
 * Get a cached sprite for an NPC
 */
export function getNpcSprite(agentId: string): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(getCacheKey(agentId))
    return cached
  } catch {
    // localStorage might be unavailable or full
    return null
  }
}

/**
 * Cache a sprite for an NPC
 */
export function setNpcSprite(agentId: string, base64: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    localStorage.setItem(getCacheKey(agentId), base64)
    return true
  } catch (e) {
    // localStorage might be full - try to clear old entries
    console.warn('Failed to cache NPC sprite:', e)
    clearOldSprites()
    
    try {
      localStorage.setItem(getCacheKey(agentId), base64)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Check if a sprite is cached
 */
export function hasNpcSprite(agentId: string): boolean {
  return getNpcSprite(agentId) !== null
}

/**
 * Remove a cached sprite
 */
export function removeNpcSprite(agentId: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(getCacheKey(agentId))
  } catch {
    // Ignore errors
  }
}

/**
 * Clear all cached sprites (useful for debugging or storage management)
 */
export function clearAllNpcSprites(): void {
  if (typeof window === 'undefined') return
  
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch {
    // Ignore errors
  }
}

/**
 * Clear old version sprites (when cache version changes)
 */
function clearOldSprites(): void {
  if (typeof window === 'undefined') return
  
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      // Remove sprites from old versions
      if (key?.startsWith(CACHE_PREFIX) && !key.includes(CACHE_VERSION)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch {
    // Ignore errors
  }
}

/**
 * Get all cached sprite IDs
 */
export function getCachedSpriteIds(): string[] {
  if (typeof window === 'undefined') return []
  
  const ids: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(`${CACHE_PREFIX}${CACHE_VERSION}_`)) {
        const id = key.replace(`${CACHE_PREFIX}${CACHE_VERSION}_`, '')
        ids.push(id)
      }
    }
  } catch {
    // Ignore errors
  }
  return ids
}
