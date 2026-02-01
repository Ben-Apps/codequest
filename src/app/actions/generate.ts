'use server'

import { generateCharacter, generateSpriteSheet } from '@/lib/gemini-service'

export async function generateCharacterAction(prompt: string): Promise<{
  success: boolean
  data?: string
  error?: string
}> {
  try {
    const imageUrl = await generateCharacter(prompt)
    return { success: true, data: imageUrl }
  } catch (error) {
    console.error('Character generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    }
  }
}

export async function generateSpriteSheetAction(
  prompt: string,
  referenceImage?: string
): Promise<{
  success: boolean
  data?: string
  error?: string
}> {
  try {
    const imageUrl = await generateSpriteSheet(prompt, referenceImage)
    return { success: true, data: imageUrl }
  } catch (error) {
    console.error('Sprite sheet generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    }
  }
}

// Combined action to avoid sending large base64 data back and forth
export async function generateCharacterAndSpriteAction(prompt: string): Promise<{
  success: boolean
  spriteSheet?: string
  error?: string
}> {
  try {
    // Phase 1: Generate Character (kept on server)
    const characterImage = await generateCharacter(prompt)
    
    // Phase 2: Generate Sprite Sheet using character as reference (stays on server)
    const spriteSheet = await generateSpriteSheet(prompt, characterImage)
    
    // Only return the sprite sheet to client
    return { success: true, spriteSheet }
  } catch (error) {
    console.error('Generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    }
  }
}

// ============================================
// NPC Sprite Generation
// ============================================

export async function generateNpcSpriteAction(
  name: string,
  role: string,
  avatar: string,
  gender: 'male' | 'female' = 'male'
): Promise<{
  success: boolean
  data?: string
  error?: string
}> {
  try {
    const prompt = `A ${gender} NPC character named "${name}" who is a ${role}. 
The character should match the personality of this emoji: ${avatar}.
Style: Cute pixel art character for a top-down RPG game.
The character should look friendly and approachable.`

    const spriteSheet = await generateSpriteSheet(prompt)
    return { success: true, data: spriteSheet }
  } catch (error) {
    console.error('NPC Sprite generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sprite generation failed',
    }
  }
}

// Generate sprite for a mob/enemy
export async function generateMobSpriteAction(
  name: string,
  emoji: string,
  level: number
): Promise<{
  success: boolean
  data?: string
  error?: string
}> {
  try {
    const prompt = `A monster/enemy character called "${name}" for a pixel art RPG game.
The creature should match this emoji: ${emoji}.
Level ${level} enemy - ${level <= 3 ? 'cute and small' : level <= 6 ? 'medium sized' : 'large and intimidating'}.
Style: Pixel art monster sprite, game-ready.`

    const spriteSheet = await generateSpriteSheet(prompt)
    return { success: true, data: spriteSheet }
  } catch (error) {
    console.error('Mob Sprite generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sprite generation failed',
    }
  }
}
