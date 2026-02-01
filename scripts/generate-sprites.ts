/**
 * Sprite Generation Script
 * 
 * Generates sprite sheets for all built-in agents and mobs
 * and saves them to public/sprites/
 * 
 * Usage: npx tsx scripts/generate-sprites.ts
 */

import { GoogleGenAI } from '@google/genai'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
import * as dotenv from 'dotenv'
dotenv.config()

const API_KEY = process.env.GEMINI_API_KEY
if (!API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in .env')
  process.exit(1)
}

const ai = new GoogleGenAI({ apiKey: API_KEY })
const IMAGE_MODEL = 'gemini-2.5-flash-image'

// Agent definitions (matching agents.ts)
const AGENTS = [
  { id: 'news-agent', name: 'Bernie', role: 'News Agent', emoji: '📰', gender: 'male' },
  { id: 'questmaster', name: 'Grace', role: 'Quest Agent', emoji: '📜', gender: 'female' },
  { id: 'creative-agent', name: 'Pixel', role: 'UI/UX Designer', emoji: '🎨', gender: 'female' },
  { id: 'moltbot-crab', name: 'moltbot', role: 'Krabben-Bote', emoji: '🦀', gender: 'male' },
  { id: 'factory-npc-otto', name: 'Otto', role: 'Factory Foreman', emoji: '🤖', gender: 'male' },
  { id: 'security-npc-shield', name: 'Shield', role: 'Security Expert', emoji: '🛡️', gender: 'male' },
  { id: 'research-agent-sandy', name: 'Sandy', role: 'Research Agent', emoji: '🔬', gender: 'female' },
  { id: 'helper-agent', name: 'Gerald', role: 'Guide Agent', emoji: '🧙', gender: 'male' },
]

// Mob definitions (matching mobs.ts)
const MOBS = [
  { id: 'bug-slime', name: 'Bug Slime', emoji: '🟢', level: 2 },
  { id: 'regex-bat', name: 'Regex Bat', emoji: '🦇', level: 4 },
  { id: 'array-spider', name: 'Array Spider', emoji: '🕷️', level: 3 },
  { id: 'loop-wolf', name: 'Loop Wolf', emoji: '🐺', level: 5 },
  { id: 'math-golem', name: 'Math Golem', emoji: '🗿', level: 6 },
  { id: 'binary-ghost', name: 'Binary Ghost', emoji: '👻', level: 7 },
  { id: 'syntax-dragon', name: 'Syntax Dragon', emoji: '🐉', level: 9 },
  { id: 'recursion-phoenix', name: 'Recursion Phoenix', emoji: '🔥', level: 10 },
]

async function generateSpriteSheet(prompt: string): Promise<Buffer | null> {
  const basePrompt = `Generate a 2D pixel art game sprite sheet for a top-down RPG style game.

ABSOLUTE REQUIREMENTS:

1. NO TEXT OR LABELS: Do NOT add ANY text, letters, numbers, labels, or annotations anywhere in the image.

2. NO BORDERS: Do NOT add any borders, frames, grid lines, or separators. The sprites must seamlessly tile with NO visible divisions.

3. FORMAT: Single square image divided into a perfect 4x4 invisible grid (16 equal areas)
   - Each area contains ONE frame of the same character
   - Background: Pure white (#FFFFFF) only
   - Absolutely NO visible grid, NO borders, NO text, NO labels

4. STYLE: Clean pixel art, 16-32 bit style, black outlines, vibrant colors
   - Same character design in ALL 16 frames
   - Consistent size and proportions in every frame

LAYOUT (4 rows, 4 columns - for 4-directional movement):

Row 1: Walking DOWN (towards viewer) - 4 animation frames
Row 2: Walking LEFT - 4 animation frames  
Row 3: Walking RIGHT - 4 animation frames
Row 4: Walking UP (away from viewer) - 4 animation frames

ANIMATION NOTES:
- Each row shows the same walking animation cycle from a different direction
- Frame 1: left foot forward, Frame 2: neutral, Frame 3: right foot forward, Frame 4: neutral
- Character should look natural walking in each direction

CHARACTER TO CREATE: ${prompt}

CRITICAL: Generate ONLY the sprites on white background. NO text, NO grid lines, NO borders, NO labels!`

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [{ text: basePrompt }],
      },
      config: {
        responseModalities: ['Text', 'Image'],
        imageConfig: {
          aspectRatio: '1:1',
        },
      },
    })

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return Buffer.from(part.inlineData.data, 'base64')
        }
      }
    }
  } catch (error) {
    console.error('Error generating sprite:', error)
  }

  return null
}

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

async function main() {
  const publicDir = path.join(process.cwd(), 'public')
  const spritesDir = path.join(publicDir, 'sprites')
  const agentsDir = path.join(spritesDir, 'agents')
  const mobsDir = path.join(spritesDir, 'mobs')

  await ensureDir(agentsDir)
  await ensureDir(mobsDir)

  console.log('🎨 Sprite Generation Script')
  console.log('===========================\n')

  // Generate Agent Sprites
  console.log('📌 Generating Agent Sprites...\n')
  
  for (const agent of AGENTS) {
    const filePath = path.join(agentsDir, `${agent.id}.png`)
    
    // Skip if already exists
    if (fs.existsSync(filePath)) {
      console.log(`  ⏭️  ${agent.name} - Already exists, skipping`)
      continue
    }

    console.log(`  🔄 ${agent.name} (${agent.role})...`)
    
    const prompt = `A ${agent.gender} NPC character named "${agent.name}" who is a ${agent.role}. 
The character should match the personality of this emoji: ${agent.emoji}.
Style: Cute pixel art character for a top-down RPG game.
The character should look friendly and approachable.`

    const buffer = await generateSpriteSheet(prompt)
    
    if (buffer) {
      fs.writeFileSync(filePath, buffer)
      console.log(`  ✅ ${agent.name} - Saved to ${path.relative(process.cwd(), filePath)}`)
    } else {
      console.log(`  ❌ ${agent.name} - Failed to generate`)
    }

    // Rate limiting - wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // Generate Mob Sprites
  console.log('\n📌 Generating Mob Sprites...\n')
  
  for (const mob of MOBS) {
    const filePath = path.join(mobsDir, `${mob.id}.png`)
    
    // Skip if already exists
    if (fs.existsSync(filePath)) {
      console.log(`  ⏭️  ${mob.name} - Already exists, skipping`)
      continue
    }

    console.log(`  🔄 ${mob.name} (Level ${mob.level})...`)
    
    const prompt = `A monster/enemy character called "${mob.name}" for a pixel art RPG game.
The creature should match this emoji: ${mob.emoji}.
Level ${mob.level} enemy - ${mob.level <= 3 ? 'cute and small' : mob.level <= 6 ? 'medium sized' : 'large and intimidating'}.
Style: Pixel art monster sprite, game-ready.`

    const buffer = await generateSpriteSheet(prompt)
    
    if (buffer) {
      fs.writeFileSync(filePath, buffer)
      console.log(`  ✅ ${mob.name} - Saved to ${path.relative(process.cwd(), filePath)}`)
    } else {
      console.log(`  ❌ ${mob.name} - Failed to generate`)
    }

    // Rate limiting - wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('\n===========================')
  console.log('🎉 Sprite generation complete!')
  console.log(`\nSprites saved to: ${path.relative(process.cwd(), spritesDir)}`)
}

main().catch(console.error)
