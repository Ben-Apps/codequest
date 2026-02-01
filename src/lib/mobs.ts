import type { Mob, ChallengeTheme } from '@/types'
import { generateMob } from './challenge-generator'

// ============================================
// Dynamic Mob Generation
// ============================================

/**
 * Convert a mob name to a kebab-case ID that matches sprite filenames
 * e.g. "Bug Slime" -> "bug-slime"
 */
function nameToId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

// Mob definitionen mit Level und Theme
const MOB_DEFINITIONS: Array<{
  baseName: string
  emoji: string
  position: { x: number; y: number }
  level: number
  theme: ChallengeTheme
}> = [
    // Code Farm Mobs (Outside World)
    { baseName: 'Bug Slime', emoji: '🟢', position: { x: 420, y: 340 }, level: 2, theme: 'strings' },
    { baseName: 'Regex Bat', emoji: '🦇', position: { x: 980, y: 520 }, level: 4, theme: 'strings' },
    { baseName: 'Array Spider', emoji: '🕷️', position: { x: 750, y: 380 }, level: 3, theme: 'arrays' },
    { baseName: 'Loop Wolf', emoji: '🐺', position: { x: 520, y: 480 }, level: 5, theme: 'algorithms' },
    { baseName: 'Math Golem', emoji: '🗿', position: { x: 880, y: 420 }, level: 6, theme: 'math' },
    { baseName: 'Binary Ghost', emoji: '👻', position: { x: 650, y: 550 }, level: 7, theme: 'algorithms' },
    { baseName: 'Syntax Dragon', emoji: '🐉', position: { x: 800, y: 600 }, level: 9, theme: 'strings' },
  ]

// Generiert die Mobs mit aktuellen Challenges
export function generateMobs(): Mob[] {
  return MOB_DEFINITIONS.map((def) =>
    generateMob(
      nameToId(def.baseName),
      def.baseName,
      def.emoji,
      def.position,
      def.level,
      def.theme
    )
  )
}

// Für Kompatibilität: statisches Array (wird bei Import einmal generiert)
export const MOBS: Mob[] = generateMobs()

// Funktion um neue Mobs bei Bedarf zu generieren (z.B. nach Respawn)
export function respawnMob(original: Mob): Mob {
  const def = MOB_DEFINITIONS.find(d =>
    original.id.includes(d.theme) && original.name.includes(d.baseName.split(' ')[0])
  )

  if (def) {
    return generateMob(
      original.id,
      def.baseName,
      def.emoji,
      def.position,
      def.level,
      def.theme
    )
  }

  // Fallback: regeneriere mit gleichen Eigenschaften
  return generateMob(
    original.id,
    original.name.replace(/ Lv\.\d+$/, ''),
    original.emoji,
    original.position,
    original.level,
    original.theme ?? 'strings'
  )
}
