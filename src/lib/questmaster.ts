export type QuestLink = {
  label: string
  href: string
}

export type DailyQuestTemplate = {
  baseId: string
  title: string
  description: string
  xp: number
  tags: string[]
  link?: QuestLink
}

export type DailyQuest = DailyQuestTemplate & {
  id: string // date-scoped id
}

export type DailyQuestSet = {
  date: string // YYYY-MM-DD (lokal)
  quests: DailyQuest[]
}

export type QuestmasterSave = {
  v: 1
  date: string
  completedBaseIds: string[]
  totalXP: number
  streak: number
  lastClaimedDate?: string
}

export const QUESTMASTER_QUESTS_PER_DAY = 3

const QUEST_TEMPLATES: DailyQuestTemplate[] = [
  {
    baseId: 'read-transformers-intro',
    title: 'Read: Transformer Basics',
    description: 'Find a short introduction and note down 3 core ideas (Attention, Embeddings, Positions).',
    xp: 30,
    tags: ['theory', 'nlp'],
  },
  {
    baseId: 'watch-lecture-ml',
    title: 'Mini Lecture (15-25 min)',
    description: 'Watch a learning video on "Overfitting/Regularization" and write 5 bullet points.',
    xp: 25,
    tags: ['theory'],
  },
  {
    baseId: 'code-linear-regression',
    title: 'Code: Linear Regression (mini)',
    description: 'Implement a simple linear regression (numpy) and plot prediction vs. data.',
    xp: 40,
    tags: ['coding', 'ml'],
  },
  {
    baseId: 'code-softmax',
    title: 'Code: Softmax + Cross-Entropy',
    description: 'Write Softmax and Cross-Entropy yourself (without framework) and test on edge cases.',
    xp: 45,
    tags: ['coding', 'math'],
  },
  {
    baseId: 'prompt-ablation',
    title: 'Prompt Ablation',
    description: 'Take a prompt and remove/change 1 part. Compare the output and note the effect.',
    xp: 30,
    tags: ['prompting', 'evaluation'],
  },
  {
    baseId: 'eval-small-set',
    title: 'Eval: Mini Test Set',
    description: 'Create 10 test cases for a task (e.g., summarization) and evaluate 3 models/prompts.',
    xp: 50,
    tags: ['evaluation'],
  },
  {
    baseId: 'read-rlhf',
    title: 'Read: RLHF in 20 Minutes',
    description: 'Read an overview of RLHF and explain to yourself: Reward Model, Policy Tuning, Trade-offs.',
    xp: 35,
    tags: ['theory', 'alignment'],
  },
  {
    baseId: 'ethics-risk-list',
    title: 'Safety Checklist',
    description: 'Write a risk list (Bias, Hallucinations, Privacy). Name 1 countermeasure each.',
    xp: 25,
    tags: ['ethics', 'safety'],
  },
  {
    baseId: 'build-tiny-agent',
    title: 'Build: Mini Agent (Tool Call)',
    description: 'Create a small agent that uses 1 tool (e.g., search files) and logs.',
    xp: 55,
    tags: ['agents', 'coding'],
  },
  {
    baseId: 'write-learning-log',
    title: 'Learning Log (5 Minutes)',
    description: 'Write: What did I learn today? What was unclear? What do I test tomorrow?',
    xp: 20,
    tags: ['meta', 'learning'],
  },
  {
    baseId: 'math-derivative',
    title: 'Math: Practice Derivatives',
    description: 'Derive a simple loss function (MSE or Cross-Entropy) with respect to the parameters.',
    xp: 35,
    tags: ['math'],
  },
  {
    baseId: 'debug-model-output',
    title: 'Debug: Check Model Response',
    description: 'Take a wrong/hallucinated answer and find 2 causes + 2 prompt fixes.',
    xp: 30,
    tags: ['debugging', 'prompting'],
  },
  {
    baseId: 'read-embeddings',
    title: 'Read: Embeddings Practical',
    description: 'Read how embeddings work and sketch 2 use cases (Search, Clustering).',
    xp: 30,
    tags: ['theory', 'embeddings'],
  },
  {
    baseId: 'build-rag-outline',
    title: 'Design: RAG Sketch',
    description: 'Sketch a RAG pipeline (Chunking, Index, Retrieval, Prompt). Note 3 failure modes.',
    xp: 45,
    tags: ['rag', 'design'],
  },
  {
    baseId: 'data-cleaning-mini',
    title: 'Data: Mini Cleaning',
    description: 'Take a small dataset (CSV) and clean missing values + outliers. Document decisions.',
    xp: 40,
    tags: ['data', 'mlops'],
  },
]

function hashStringToSeed(str: string): number {
  // Simple, stable 32-bit hash
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function formatLocalISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseLocalISODate(date: string): Date | null {
  // date = YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!m) return null
  const y = Number(m[1])
  const mm = Number(m[2]) - 1
  const dd = Number(m[3])
  // noon to avoid DST boundary issues
  return new Date(y, mm, dd, 12, 0, 0, 0)
}

export function isYesterday(prev: string, next: string): boolean {
  const a = parseLocalISODate(prev)
  const b = parseLocalISODate(next)
  if (!a || !b) return false
  const diffDays = Math.round((b.getTime() - a.getTime()) / 86400000)
  return diffDays === 1
}

export function getDailyQuestSet(date: string): DailyQuestSet {
  const seed = hashStringToSeed(`${date}::questmaster::v1`)
  const rng = mulberry32(seed)

  const picked: DailyQuestTemplate[] = []
  const used = new Set<string>()

  // Always pick distinct baseIds
  while (picked.length < QUESTMASTER_QUESTS_PER_DAY) {
    const idx = Math.floor(rng() * QUEST_TEMPLATES.length)
    const q = QUEST_TEMPLATES[idx]
    if (used.has(q.baseId)) continue
    used.add(q.baseId)
    picked.push(q)
  }

  return {
    date,
    quests: picked.map((q) => ({
      ...q,
      id: `${date}:${q.baseId}`,
    })),
  }
}

export function normalizeQuestmasterSave(today: string, raw: unknown): QuestmasterSave {
  const base: QuestmasterSave = {
    v: 1,
    date: today,
    completedBaseIds: [],
    totalXP: 0,
    streak: 0,
    lastClaimedDate: undefined,
  }

  if (!raw || typeof raw !== 'object') return base
  const obj = raw as Partial<QuestmasterSave>
  if (obj.v !== 1) return base

  const date = typeof obj.date === 'string' ? obj.date : today
  const completedBaseIds = Array.isArray(obj.completedBaseIds)
    ? obj.completedBaseIds.filter((x): x is string => typeof x === 'string')
    : []
  const totalXP = typeof obj.totalXP === 'number' && Number.isFinite(obj.totalXP) ? Math.max(0, obj.totalXP) : 0
  const streak = typeof obj.streak === 'number' && Number.isFinite(obj.streak) ? Math.max(0, Math.floor(obj.streak)) : 0
  const lastClaimedDate = typeof obj.lastClaimedDate === 'string' ? obj.lastClaimedDate : undefined

  // If day changed, reset today's completions (streak/xp stay)
  if (date !== today) {
    return { ...base, totalXP, streak, lastClaimedDate }
  }

  return { v: 1, date, completedBaseIds, totalXP, streak, lastClaimedDate }
}

export function toggleQuestCompletion(save: QuestmasterSave, baseId: string): QuestmasterSave {
  const set = new Set(save.completedBaseIds)
  if (set.has(baseId)) set.delete(baseId)
  else set.add(baseId)
  return { ...save, completedBaseIds: Array.from(set) }
}

export function canClaimDailyReward(save: QuestmasterSave, daily: DailyQuestSet): boolean {
  const done = new Set(save.completedBaseIds)
  const allDone = daily.quests.every((q) => done.has(q.baseId))
  const alreadyClaimed = save.lastClaimedDate === daily.date
  return allDone && !alreadyClaimed
}

export function claimDailyReward(save: QuestmasterSave, daily: DailyQuestSet): QuestmasterSave {
  if (!canClaimDailyReward(save, daily)) return save

  const gained = daily.quests.reduce((sum, q) => sum + q.xp, 0)
  const nextStreak =
    save.lastClaimedDate && isYesterday(save.lastClaimedDate, daily.date) ? save.streak + 1 : 1

  return {
    ...save,
    totalXP: save.totalXP + gained,
    streak: nextStreak,
    lastClaimedDate: daily.date,
  }
}

