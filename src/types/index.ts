// ============================================
// Character & Sprite Types
// ============================================

export interface SpriteFrame {
  x: number
  y: number
  width: number
  height: number
}

export interface SpriteAnimation {
  name: AnimationType
  frames: SpriteFrame[]
  frameRate: number
}

export type AnimationType = 'walk_down' | 'walk_left' | 'walk_right' | 'walk_up'
export type Direction = 'up' | 'down' | 'left' | 'right'
export type Gender = 'male' | 'female'

export interface SpriteSheet {
  image: HTMLImageElement
  animations: Record<AnimationType, SpriteAnimation>
  frameWidth: number
  frameHeight: number
}

export interface FrameConfig {
  offsetX: number
  offsetY: number
  frameWidth: number
  frameHeight: number
  cols: number
  rows: number
}

// ============================================
// Player & Character Types
// ============================================

export interface PlayerState {
  x: number
  y: number
  animation: AnimationType
  direction: Direction
  currentFrame: number
  isMoving: boolean
}

export interface CharacterData {
  id: string
  name: string
  description: string
  gender: Gender
  spriteSheetBase64: string
  createdAt: number
}

export interface CharacterPreset {
  id: string
  name: string
  description: string
  emoji: string
  prompt: string
  gender: Gender
}

// ============================================
// World & Game Types
// ============================================

export interface WorldConfig {
  // Gesamte (logische) Weltfläche in CSS-Pixeln
  worldWidth: number
  worldHeight: number

  // Sichtbarer Ausschnitt (Viewport/Canvas) in CSS-Pixeln
  viewportWidth: number
  viewportHeight: number

  tileSize: number
}

export type WorldArea = 'outside' | 'ai_university' | 'ai_labor' | 'design_atelier' | 'security_hub'

export type TileType =
  | 'grass'
  | 'grass_dark'
  | 'grass_flower'
  | 'path'
  | 'water'
  | 'floor'
  | 'wall'
  | 'carpet'

export interface Position {
  x: number
  y: number
}

export interface WorldMarker {
  id: string
  position: Position
  label?: string
}

// ============================================
// Learning / Lessons
// ============================================

export type LessonStep =
  | { type: 'text'; text: string }
  | {
    type: 'question'
    question: string
    options: string[]
    correctIndex: number
    explanation?: string
  }

export interface LearningStation {
  id: string
  title: string
  position: Position
  rewardXp: number
  steps: LessonStep[]
  area?: WorldArea
}

// ============================================
// NPC Agent Types
// ============================================

export type AgentUI =
  | { type: 'chat' }
  | { type: 'panel'; panelId: string }

export type AgentCapability = 'search' | 'news' | 'research'

export interface AgentNPC {
  id: string
  name: string
  role: string
  gender: Gender
  systemInstruction: string
  avatar: string
  position: Position
  greeting: string
  /**
   * If true, the agent will make an API call on dialog open to provide
   * dynamic, current information instead of a static greeting.
   */
  proactiveGreeting?: boolean
  /**
   * The prompt to send to the AI when proactiveGreeting is true.
   * This should instruct the agent to immediately share relevant info.
   */
  proactivePrompt?: string
  /**
   * Welche Tools/Fähigkeiten der Agent nutzen kann.
   * - 'search': Kann Google Search für aktuelle Informationen nutzen
   * - 'news': Spezialisiert auf Nachrichten und aktuelle Events
   * - 'research': Spezialisiert auf Recherche und Fakten
   */
  capabilities?: AgentCapability[]
  /**
   * Optional: In welchem Bereich der Welt dieser NPC spawnen soll.
   * Built-in Agents werden weiterhin über die jeweiligen Listen (`AGENTS`, `LAB_AGENTS`) geroutet.
   * Custom Agents nutzen dieses Feld für die Zuordnung.
   */
  spawnArea?: WorldArea
  ui?: AgentUI
  /**
   * Base64-kodiertes Spritesheet für den NPC.
   * Format: 4x4 Grid (walk_down, walk_left, walk_right, walk_up)
   * Wird beim ersten Laden generiert und gecached.
   */
  spriteSheetBase64?: string
  /**
   * Optional: Webhook-URL für externe Kommunikation.
   * Wenn gesetzt, werden Nachrichten an diesen Webhook gesendet
   * anstatt an die interne AI-API.
   */
  webhookUrl?: string
}


// ============================================
// Mobs & Code Challenges
// ============================================

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard'

export type ChallengeTheme =
  | 'strings'
  | 'arrays'
  | 'math'
  | 'algorithms'

export interface CodeChallengeTestCase {
  input: string
  expected: string
}

export interface CodeChallenge {
  id: string
  title: string
  description: string
  starterCode: string
  tests: CodeChallengeTestCase[]
  rewardXp?: number
  theme?: ChallengeTheme
  difficulty?: ChallengeDifficulty
}

export interface Mob {
  id: string
  name: string
  emoji: string
  position: Position
  level: number
  theme?: ChallengeTheme
  difficulty?: ChallengeDifficulty
  challenge: CodeChallenge
  /**
   * Base64-kodiertes Spritesheet für den Mob.
   * Format: 4x4 Grid (walk_down, walk_left, walk_right, walk_up)
   */
  spriteSheetBase64?: string
}

// ============================================
// n8n Factory Types
// ============================================

export interface N8nWorkflow {
  id: string
  name: string
  description: string
  icon: string
  nodes: number
}

export interface N8nAgentType {
  id: string
  name: string
  description: string
  emoji: string
  systemInstruction: string
}

export interface ChatMessage {
  role: 'user' | 'agent'
  text: string
  timestamp: number
}

// ============================================
// App State Types
// ============================================

export type AppView = 'start' | 'create' | 'generating' | 'world'

export interface GenerationState {
  isLoading: boolean
  phase: 'idle' | 'character' | 'sprite'
  progress: number
  error: string | null
}

export interface GameState {
  player: PlayerState
  nearbyNPC: AgentNPC | null
  isDialogOpen: boolean
  activeAgent: AgentNPC | null
}
