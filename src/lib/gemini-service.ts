import { GoogleGenAI } from '@google/genai'

// Wird serverseitig verwendet - API Key aus Environment
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  return new GoogleGenAI({ apiKey })
}

const IMAGE_MODEL = 'gemini-2.5-flash-image'

// ============================================
// Character Generation
// ============================================

export async function generateCharacter(prompt: string): Promise<string> {
  const ai = getAI()

  const characterPrompt = `Create a 2D game character design in pixel art style.

REQUIREMENTS:
- Single character, front-facing or 3/4 view
- Full body visible (head to feet)
- Clean, centered composition
- Pure white background (#FFFFFF)
- Pixel art style, 16-32 bit retro game aesthetic
- Clean pixels, limited color palette
- Black outlines for clarity
- Professional game-ready quality

CHARACTER: ${prompt}

Make the character suitable for a top-down RPG game. The design should be clear and recognizable at small sizes.`

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: {
      parts: [{ text: characterPrompt }],
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
        const mimeType = part.inlineData.mimeType || 'image/png'
        return `data:${mimeType};base64,${part.inlineData.data}`
      }
    }
  }

  throw new Error('No image data in response')
}

// ============================================
// Sprite Sheet Generation
// ============================================

export async function generateSpriteSheet(
  prompt: string,
  referenceImageBase64?: string
): Promise<string> {
  const ai = getAI()

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

  let contents: Parameters<typeof ai.models.generateContent>[0]['contents']

  if (referenceImageBase64) {
    const parts = referenceImageBase64.split(',')
    if (parts.length !== 2) {
      throw new Error('Invalid image data format')
    }

    const header = parts[0]
    const base64Data = parts[1]
    const mimeMatch = header.match(/:(image\/[a-zA-Z+]+);/)
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png'

    contents = {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: `Convert this character into a sprite sheet. ${basePrompt}`,
        },
      ],
    }
  } else {
    contents = {
      parts: [{ text: basePrompt }],
    }
  }

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents,
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
        const mimeType = part.inlineData.mimeType || 'image/png'
        return `data:${mimeType};base64,${part.inlineData.data}`
      }
    }
  }

  throw new Error('No image data in response')
}

// ============================================
// Chat with Agent (with optional Google Search Grounding)
// ============================================

const CHAT_MODEL = 'gemini-2.0-flash'

export type AgentCapability = 'search' | 'news' | 'research'

export interface ChatSource {
  title: string
  url: string
}

export interface ChatResponse {
  text: string
  sources?: ChatSource[]
}

export async function chatWithAgent(
  systemInstruction: string,
  history: Array<{ role: 'user' | 'model'; text: string }>,
  message: string,
  capabilities?: AgentCapability[]
): Promise<ChatResponse> {
  const ai = getAI()

  const formattedHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }))

  // Determine if we should use Google Search
  const useSearch = capabilities?.some(c =>
    c === 'search' || c === 'news' || c === 'research'
  )

  // Enhanced system instruction for search-enabled agents
  let enhancedInstruction = systemInstruction
  if (useSearch) {
    enhancedInstruction += `\n\nCRITICAL INSTRUCTIONS:
1. You MUST use Google Search for EVERY response to find current, specific information
2. NEVER give generic or outdated information - always search first
3. Include specific names, dates, numbers, and sources in your response
4. If search results are available, base your entire response on them
5. Cite sources when you have specific URLs from search results`
  }

  // Build config with optional tools
  const config: Parameters<typeof ai.models.generateContent>[0]['config'] = {
    systemInstruction: enhancedInstruction,
    temperature: useSearch ? 0.3 : 0.8, // Very low temperature for factual search responses
    maxOutputTokens: useSearch ? 1024 : 256, // Much more space for detailed sourced answers
  }

  // Add Google Search tool if capabilities include search
  if (useSearch) {
    (config as Record<string, unknown>).tools = [{ googleSearch: {} }]
  }

  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: [
      ...formattedHistory,
      { role: 'user', parts: [{ text: message }] },
    ],
    config,
  })

  // Extract sources from grounding metadata if available
  const sources: ChatSource[] = []
  const candidate = response.candidates?.[0]
  if (candidate?.groundingMetadata?.groundingChunks) {
    for (const chunk of candidate.groundingMetadata.groundingChunks) {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({
          title: chunk.web.title,
          url: chunk.web.uri,
        })
      }
    }
  }

  return {
    text: response.text || "Hmm, I'm not sure what to say right now...",
    sources: sources.length > 0 ? sources : undefined,
  }
}

// ============================================
// Code Challenge Review (optional)
// ============================================

const CODE_REVIEW_MODEL = 'gemini-2.0-flash'

export async function reviewCodeChallenge(args: {
  challengeTitle: string
  challengeDescription: string
  code: string
  testSummary: string
}): Promise<string> {
  const ai = getAI()

  const systemInstruction =
    'You are a strict but helpful reviewer for JavaScript solutions to coding challenges. ' +
    'Answer briefly in English. Give concrete hints (correctness, edge cases, readability).'

  const message =
    `Challenge: ${args.challengeTitle}\n\n` +
    `${args.challengeDescription}\n\n` +
    `Test-Status:\n${args.testSummary}\n\n` +
    `User-Code:\n\`\`\`js\n${args.code}\n\`\`\`\n\n` +
    'Give feedback in 4-8 sentences.'

  const response = await ai.models.generateContent({
    model: CODE_REVIEW_MODEL,
    contents: [{ role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction,
      temperature: 0.4,
      maxOutputTokens: 220,
    },
  })

  return response.text || 'Kein Feedback erhalten.'
}
