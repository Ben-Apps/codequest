'use client'

import { useState, useCallback } from 'react'
import type { Gender } from '@/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generateNpcSpriteAction } from '@/app/actions/generate'
import { setNpcSprite } from '@/lib/npc-sprite-cache'

export type ProgrammingAgentType = {
  id: string
  name: string
  role: string
  emoji: string
  gender: Gender
  systemInstruction: string
  greeting: string
  spriteSheetBase64?: string
  githubUrl?: string
}

// Parsed GitHub repository info
interface GitHubRepoInfo {
  owner: string
  repo: string
  fullName: string
  url: string
}

// Parse a GitHub URL to extract owner and repo
function parseGitHubUrl(url: string): GitHubRepoInfo | null {
  // Remove trailing slashes and .git suffix
  const cleanUrl = url.trim().replace(/\/+$/, '').replace(/\.git$/, '')
  
  // Match patterns like:
  // https://github.com/owner/repo
  // github.com/owner/repo
  // git@github.com:owner/repo
  const httpsMatch = cleanUrl.match(/(?:https?:\/\/)?github\.com\/([^\/]+)\/([^\/]+)/)
  const sshMatch = cleanUrl.match(/git@github\.com:([^\/]+)\/([^\/]+)/)
  
  const match = httpsMatch || sshMatch
  if (!match) return null
  
  const [, owner, repo] = match
  return {
    owner,
    repo,
    fullName: `${owner}/${repo}`,
    url: `https://github.com/${owner}/${repo}`
  }
}

// Generate agent details from GitHub repo info (simulated)
function generateAgentFromRepo(repoInfo: GitHubRepoInfo): ProgrammingAgentType {
  // Simulate detecting repo type based on common patterns
  const repoLower = repoInfo.repo.toLowerCase()
  
  let role = 'Repository Expert'
  let emoji = '📦'
  let specialization = 'this codebase'
  
  // Detect repo type from name
  if (repoLower.includes('react') || repoLower.includes('next') || repoLower.includes('vue')) {
    role = 'Frontend Expert'
    emoji = '⚛️'
    specialization = 'frontend architecture and components'
  } else if (repoLower.includes('api') || repoLower.includes('server') || repoLower.includes('backend')) {
    role = 'Backend Expert'
    emoji = '🗄️'
    specialization = 'APIs and backend logic'
  } else if (repoLower.includes('ml') || repoLower.includes('ai') || repoLower.includes('model')) {
    role = 'AI/ML Expert'
    emoji = '🧠'
    specialization = 'machine learning and AI components'
  } else if (repoLower.includes('cli') || repoLower.includes('tool')) {
    role = 'CLI Expert'
    emoji = '⌨️'
    specialization = 'command-line tools and utilities'
  } else if (repoLower.includes('lib') || repoLower.includes('sdk')) {
    role = 'Library Expert'
    emoji = '📚'
    specialization = 'library APIs and integrations'
  }
  
  // Generate a name from the repo
  const name = repoInfo.repo
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
    .substring(0, 12)
  
  return {
    id: `github-${repoInfo.owner}-${repoInfo.repo}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    name: name || 'RepoBot',
    role,
    emoji,
    gender: Math.random() > 0.5 ? 'male' : 'female',
    systemInstruction: `You are ${name}, a specialized coding assistant for the GitHub repository "${repoInfo.fullName}".

YOUR EXPERTISE:
- Deep knowledge of ${specialization}
- Familiar with the codebase structure and patterns used in ${repoInfo.repo}
- Can help with debugging, refactoring, and extending the code

RESPONSE STYLE:
- Answer in English, concise and actionable
- Reference specific files/functions when possible
- Suggest code improvements based on best practices
- Help understand complex parts of the codebase

REPOSITORY: ${repoInfo.url}`,
    greeting: `Hi! I'm ${name}, your expert for the repository "${repoInfo.fullName}". How can I help you with the code?`,
    githubUrl: repoInfo.url
  }
}

const CODING_AGENTS: ProgrammingAgentType[] = [
  {
    id: 'frontend-engineer',
    name: 'Nova',
    role: 'Frontend Engineer',
    emoji: '🧩',
    gender: 'female',
    systemInstruction:
      'You are Nova, a frontend engineer in a pixel art RPG world. Help with React, UI, and CSS. Answer in English, concise and actionable.',
    greeting: "Hi! I'm Nova, your Frontend Engineer. What should we build next?",
  },
  {
    id: 'backend-engineer',
    name: 'Rune',
    role: 'Backend Engineer',
    emoji: '🗄️',
    gender: 'male',
    systemInstruction:
      'You are Rune, a backend engineer in a pixel art RPG world. Help with APIs, databases, and architecture. Answer in English, concise and actionable.',
    greeting: "Hey! I'm Rune, your Backend Engineer. What should I help with?",
  },
  {
    id: 'debugger',
    name: 'Trace',
    role: 'Debugging Specialist',
    emoji: '🧪',
    gender: 'male',
    systemInstruction:
      'You are Trace, a debugging specialist in a pixel art RPG world. Find bugs and suggest fixes. Answer in English, concise and actionable.',
    greeting: "Debug mode on! I'm Trace. Show me the bug.",
  },
  {
    id: 'code-reviewer',
    name: 'Lumi',
    role: 'Code Reviewer',
    emoji: '🔍',
    gender: 'female',
    systemInstruction:
      'You are Lumi, a code reviewer in a pixel art RPG world. Review code for bugs, risks, and improvements. Answer in English, concise and actionable.',
    greeting: "I'm Lumi. Send me your code, I'll review it.",
  },
]

type TabType = 'agents' | 'github'

interface ProgrammingHubDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSummonAgent?: (agent: ProgrammingAgentType) => void
}

export function ProgrammingHubDialog({ open, onOpenChange, onSummonAgent }: ProgrammingHubDialogProps) {
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('agents')
  const [githubUrl, setGithubUrl] = useState('')
  const [githubError, setGithubError] = useState<string | null>(null)
  const [createdGithubAgents, setCreatedGithubAgents] = useState<ProgrammingAgentType[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleSummon = useCallback(async (agent: ProgrammingAgentType) => {
    if (generatingId) return // Already generating

    setGeneratingId(agent.id)

    try {
      // Generate sprite for this agent
      const result = await generateNpcSpriteAction(
        agent.name,
        agent.role,
        agent.emoji,
        agent.gender
      )

      if (result.success && result.data) {
        // Cache the sprite
        setNpcSprite(agent.id, result.data)

        // Summon agent with sprite
        onSummonAgent?.({
          ...agent,
          spriteSheetBase64: result.data,
        })
      } else {
        // Summon without sprite (fallback to emoji)
        console.warn('Failed to generate sprite:', result.error)
        onSummonAgent?.(agent)
      }
    } catch (e) {
      console.error('Error generating sprite:', e)
      // Summon without sprite (fallback to emoji)
      onSummonAgent?.(agent)
    } finally {
      setGeneratingId(null)
    }
  }, [generatingId, onSummonAgent])

  const handleGitHubSubmit = useCallback(async () => {
    setGithubError(null)
    
    if (!githubUrl.trim()) {
      setGithubError('Please enter a GitHub link.')
      return
    }

    const repoInfo = parseGitHubUrl(githubUrl)
    if (!repoInfo) {
      setGithubError('Invalid GitHub link. Format: https://github.com/owner/repo')
      return
    }

    // Check if agent already exists
    const existingAgent = createdGithubAgents.find(a => a.githubUrl === repoInfo.url)
    if (existingAgent) {
      setGithubError('This agent has already been created.')
      return
    }

    setIsAnalyzing(true)

    // Simulate analyzing the repository (in a real implementation, this would fetch repo data)
    await new Promise(resolve => setTimeout(resolve, 1500))

    const newAgent = generateAgentFromRepo(repoInfo)
    setCreatedGithubAgents(prev => [...prev, newAgent])
    setGithubUrl('')
    setIsAnalyzing(false)
  }, [githubUrl, createdGithubAgents])

  const handleRemoveGithubAgent = useCallback((agentId: string) => {
    setCreatedGithubAgents(prev => prev.filter(a => a.id !== agentId))
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)]! max-w-none! bg-black/85 text-white border-emerald-500/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span aria-hidden="true">🧠</span>
            <span>Programming Hub</span>
            <span className="text-white/50">•</span>
            <span className="text-emerald-400">Coding Agents</span>
          </DialogTitle>
          <DialogDescription className="text-white/65">
            Set up coding agents and let them appear directly in the world.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === 'agents'
                ? 'bg-emerald-600/20 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            🤖 Standard Agents
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === 'github'
                ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-400'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub Agents
            </span>
          </button>
        </div>

        {/* Standard Agents Tab */}
        {activeTab === 'agents' && (
          <div className="grid gap-3">
            <div className="text-sm font-semibold text-white/90">Select Agents</div>
            <div className="grid gap-3 sm:grid-cols-4">
              {CODING_AGENTS.map((agent) => {
                const isGenerating = generatingId === agent.id
                return (
                  <div
                    key={agent.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="text-3xl text-center mb-2">{agent.emoji}</div>
                    <div className="font-medium text-white/90 text-center mb-1">{agent.name}</div>
                    <div className="text-xs text-white/50 text-center mb-3">{agent.role}</div>
                    <Button
                      size="sm"
                      className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                      onClick={() => handleSummon(agent)}
                      disabled={!!generatingId}
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span>
                          Generating...
                        </span>
                      ) : (
                        'Place'
                      )}
                    </Button>
                  </div>
                )
              })}
            </div>
            <div className="text-xs text-white/40 text-center mt-2">
              {generatingId 
                ? 'Generating sprite... This may take a few seconds.'
                : 'Placed agents spawn at the programming hub and can be interacted with.'
              }
            </div>
          </div>
        )}

        {/* GitHub Agents Tab */}
        {activeTab === 'github' && (
          <div className="grid gap-4">
            <div className="text-sm font-semibold text-white/90 flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Create Agent from GitHub Repository
            </div>

            {/* GitHub URL Input */}
            <div className="flex gap-2">
              <Input
                placeholder="https://github.com/owner/repository"
                value={githubUrl}
                onChange={(e) => {
                  setGithubUrl(e.target.value)
                  setGithubError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAnalyzing) {
                    handleGitHubSubmit()
                  }
                }}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                disabled={isAnalyzing}
              />
              <Button
                onClick={handleGitHubSubmit}
                disabled={isAnalyzing || !githubUrl.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>+</span>
                    Add
                  </span>
                )}
              </Button>
            </div>

            {githubError && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {githubError}
              </div>
            )}

            {/* Created GitHub Agents */}
            {createdGithubAgents.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {createdGithubAgents.map((agent) => {
                  const isGenerating = generatingId === agent.id
                  return (
                    <div
                      key={agent.id}
                      className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 hover:bg-purple-500/10 transition-colors relative group"
                    >
                      <button
                        onClick={() => handleRemoveGithubAgent(agent.id)}
                        className="absolute top-2 right-2 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove agent"
                      >
                        ✕
                      </button>
                      <div className="text-3xl text-center mb-2">{agent.emoji}</div>
                      <div className="font-medium text-white/90 text-center mb-1">{agent.name}</div>
                      <div className="text-xs text-purple-400 text-center mb-1">{agent.role}</div>
                      <a
                        href={agent.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-white/40 hover:text-white/60 text-center block mb-3 truncate"
                      >
                        {agent.githubUrl?.replace('https://github.com/', '')}
                      </a>
                      <Button
                        size="sm"
                        className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                        onClick={() => handleSummon(agent)}
                        disabled={!!generatingId}
                      >
                        {isGenerating ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span>
                            Generating...
                          </span>
                        ) : (
                          'Place'
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-white/40 border border-dashed border-white/10 rounded-2xl">
                <div className="text-4xl mb-3">📦</div>
                <div className="text-sm">
                  No GitHub agents created yet.
                </div>
                <div className="text-xs mt-1">
                  Enter a GitHub link to create a specialized agent.
                </div>
              </div>
            )}

            <div className="text-xs text-white/40 text-center mt-2 space-y-1">
              <div>
                The agent will be configured based on the repository name and type.
              </div>
              <div className="text-purple-400/60">
                Supported formats: https://github.com/owner/repo, github.com/owner/repo
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => onOpenChange(false)}
            disabled={!!generatingId || isAnalyzing}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
