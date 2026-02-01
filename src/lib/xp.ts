export type CharacterStatsV1 = {
  version: 1
  level: number
  /**
   * XP innerhalb des aktuellen Levels (0..xpRequiredForLevel(level)-1)
   */
  xp: number
}

export const DEFAULT_CHARACTER_STATS_V1: CharacterStatsV1 = {
  version: 1,
  level: 1,
  xp: 0,
}

export function xpRequiredForLevel(level: number): number {
  const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1
  return 100 * safeLevel
}

export function normalizeCharacterStatsV1(input: unknown): CharacterStatsV1 {
  const maybe = (input ?? null) as Partial<CharacterStatsV1> | null
  let level = typeof maybe?.level === 'number' && Number.isFinite(maybe.level) ? Math.max(1, Math.floor(maybe.level)) : 1
  let xp = typeof maybe?.xp === 'number' && Number.isFinite(maybe.xp) ? Math.max(0, Math.floor(maybe.xp)) : 0

  // Migrate/normalize: if xp was stored as "total XP" (legacy), roll it forward into levels.
  for (let guard = 0; guard < 500; guard += 1) {
    const required = xpRequiredForLevel(level)
    if (xp < required) break
    xp -= required
    level += 1
  }

  return { version: 1, level, xp }
}

export function parseCharacterStatsV1(raw: string | null | undefined): CharacterStatsV1 {
  if (!raw) return { ...DEFAULT_CHARACTER_STATS_V1 }
  try {
    const parsed = JSON.parse(raw) as unknown
    return normalizeCharacterStatsV1(parsed)
  } catch {
    return { ...DEFAULT_CHARACTER_STATS_V1 }
  }
}

export function applyXpReward(stats: CharacterStatsV1, rewardXp: number): CharacterStatsV1 {
  if (!Number.isFinite(rewardXp) || rewardXp <= 0) return stats

  let level = stats.level
  let xp = stats.xp + Math.floor(rewardXp)

  // Level-up loop (supports large rewards)
  for (let guard = 0; guard < 200; guard += 1) {
    const required = xpRequiredForLevel(level)
    if (xp < required) break
    xp -= required
    level += 1
  }

  return normalizeCharacterStatsV1({ version: 1, level, xp })
}
