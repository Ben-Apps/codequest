'use client'

import { useState, useCallback } from 'react'
import type { N8nWorkflow, N8nAgentType, AgentNPC, Gender } from '@/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { generateNpcSpriteAction } from '@/app/actions/generate'

// Predefined workflows
const WORKFLOWS: N8nWorkflow[] = [
    {
        id: 'email-automation',
        name: 'Email Automation',
        description: 'Automatically process and respond to incoming emails',
        icon: '📧',
        nodes: 5,
    },
    {
        id: 'data-sync',
        name: 'Data Sync Pipeline',
        description: 'Sync data between different databases and services',
        icon: '🔄',
        nodes: 8,
    },
    {
        id: 'webhook-handler',
        name: 'Webhook Handler',
        description: 'Process incoming webhooks from external services',
        icon: '🔗',
        nodes: 4,
    },
    {
        id: 'scheduled-reports',
        name: 'Scheduled Reports',
        description: 'Generate and send reports on a schedule',
        icon: '📊',
        nodes: 6,
    },
    {
        id: 'api-integration',
        name: 'API Integration',
        description: 'Connect and orchestrate multiple APIs',
        icon: '🔌',
        nodes: 7,
    },
]

// Available agent types to summon
const AGENT_TYPES: N8nAgentType[] = [
    {
        id: 'workflow-builder',
        name: 'Workflow Builder',
        description: 'Helps you design and build automation workflows',
        emoji: '🛠️',
        systemInstruction: 'You are a workflow builder agent. Help users design automation workflows step by step.',
    },
    {
        id: 'data-transformer',
        name: 'Data Transformer',
        description: 'Specializes in data manipulation and transformation',
        emoji: '🔧',
        systemInstruction: 'You are a data transformation expert. Help users transform and process data efficiently.',
    },
    {
        id: 'api-connector',
        name: 'API Connector',
        description: 'Expert in connecting external APIs and services',
        emoji: '🔌',
        systemInstruction: 'You are an API integration specialist. Help users connect to and work with external APIs.',
    },
]

// Webhook-based agent definition
export interface WebhookAgentConfig {
    name: string
    role: string
    emoji: string
    webhookUrl: string
    greeting: string
    gender: Gender
    spriteSheetBase64?: string
}

interface N8nFactoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSummonAgent?: (agent: N8nAgentType) => void
    onCreateWebhookAgent?: (config: WebhookAgentConfig) => void
}

export function N8nFactoryDialog({ open, onOpenChange, onSummonAgent, onCreateWebhookAgent }: N8nFactoryDialogProps) {
    const [selectedWorkflow, setSelectedWorkflow] = useState<N8nWorkflow | null>(null)
    const [activeTab, setActiveTab] = useState<'workflows' | 'agents' | 'create'>('workflows')

    // Create Agent Form State
    const [agentName, setAgentName] = useState('')
    const [agentRole, setAgentRole] = useState('')
    const [webhookUrl, setWebhookUrl] = useState('')
    const [agentGreeting, setAgentGreeting] = useState('')
    const [agentGender, setAgentGender] = useState<Gender>('male')
    const [isCreating, setIsCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)
    
    // Webhook test state
    const [isTestingWebhook, setIsTestingWebhook] = useState(false)
    const [webhookTestResult, setWebhookTestResult] = useState<{ success: boolean; message: string } | null>(null)
    
    // Sprite generation state
    const [isGeneratingSprite, setIsGeneratingSprite] = useState(false)
    const [generatedSprite, setGeneratedSprite] = useState<string | null>(null)

    const resetForm = useCallback(() => {
        setAgentName('')
        setAgentRole('')
        setWebhookUrl('')
        setAgentGreeting('')
        setAgentGender('male')
        setCreateError(null)
        setWebhookTestResult(null)
        setGeneratedSprite(null)
    }, [])

    const handleTestWebhook = useCallback(async () => {
        if (!webhookUrl.trim()) {
            setWebhookTestResult({ success: false, message: 'Please enter a webhook URL first' })
            return
        }

        // Basic URL validation
        try {
            new URL(webhookUrl)
        } catch {
            setWebhookTestResult({ success: false, message: 'Please enter a valid URL' })
            return
        }

        setIsTestingWebhook(true)
        setWebhookTestResult(null)

        try {
            const response = await fetch('/api/webhook-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ webhookUrl: webhookUrl.trim() }),
            })

            const result = await response.json() as { success: boolean; message?: string; error?: string; responsePreview?: string }

            if (result.success) {
                setWebhookTestResult({
                    success: true,
                    message: result.message ?? 'Webhook tested successfully!',
                })
            } else {
                setWebhookTestResult({
                    success: false,
                    message: result.error ?? 'Webhook test failed',
                })
            }
        } catch (err) {
            setWebhookTestResult({
                success: false,
                message: err instanceof Error ? err.message : 'Network error during testing',
            })
        } finally {
            setIsTestingWebhook(false)
        }
    }, [webhookUrl])

    const handleGenerateSprite = useCallback(async () => {
        if (!agentName.trim()) {
            setCreateError('Please enter a name first')
            return
        }

        setIsGeneratingSprite(true)
        setCreateError(null)

        try {
            const result = await generateNpcSpriteAction(
                agentName.trim(),
                agentRole.trim() || 'Webhook Agent',
                '', // No emoji - sprite only
                agentGender
            )

            if (result.success && result.data) {
                setGeneratedSprite(result.data)
            } else {
                setCreateError(result.error ?? 'Sprite generation failed')
            }
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : 'Sprite generation error')
        } finally {
            setIsGeneratingSprite(false)
        }
    }, [agentName, agentRole, agentGender])

    const handleCreateAgent = useCallback(async () => {
        // Validation
        if (!agentName.trim()) {
            setCreateError('Please enter a name')
            return
        }
        if (!webhookUrl.trim()) {
            setCreateError('Please enter a webhook URL')
            return
        }
        // Basic URL validation
        try {
            new URL(webhookUrl)
        } catch {
            setCreateError('Please enter a valid URL')
            return
        }

        setIsCreating(true)
        setCreateError(null)

        try {
            let spriteData = generatedSprite

            // Generate sprite if not already generated
            if (!spriteData) {
                setIsGeneratingSprite(true)
                const spriteResult = await generateNpcSpriteAction(
                    agentName.trim(),
                    agentRole.trim() || 'Webhook Agent',
                    '', // No emoji - sprite only
                    agentGender
                )
                setIsGeneratingSprite(false)

                if (spriteResult.success && spriteResult.data) {
                    spriteData = spriteResult.data
                    setGeneratedSprite(spriteData)
                }
                // If sprite generation fails, show error - sprite is required
                if (!spriteData) {
                    setCreateError('Sprite generation failed. Please try again.')
                    return
                }
            }

            const config: WebhookAgentConfig = {
                name: agentName.trim(),
                role: agentRole.trim() || 'Webhook Agent',
                emoji: '', // No emoji - sprite only
                webhookUrl: webhookUrl.trim(),
                greeting: agentGreeting.trim() || `Hello! I'm ${agentName.trim()}.`,
                gender: agentGender,
                spriteSheetBase64: spriteData,
            }

            onCreateWebhookAgent?.(config)
            resetForm()
            onOpenChange(false)
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : 'Error creating agent')
        } finally {
            setIsCreating(false)
            setIsGeneratingSprite(false)
        }
    }, [agentName, agentRole, webhookUrl, agentGreeting, agentGender, generatedSprite, onCreateWebhookAgent, resetForm, onOpenChange])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[calc(100vw-2rem)] !max-w-none bg-black/85 text-white border-white/10 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span aria-hidden="true">🏭</span>
                        <span>n8n Factory</span>
                        <span className="text-white/50">•</span>
                        <span className="text-white/80">Automation Hub</span>
                    </DialogTitle>
                    <DialogDescription className="text-white/65">
                        Explore workflows and summon automation agents to help with your tasks.
                    </DialogDescription>
                </DialogHeader>

                {/* Tab Navigation */}
                <div className="flex gap-2 border-b border-white/10 pb-2">
                    <button
                        onClick={() => setActiveTab('workflows')}
                        className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === 'workflows'
                                ? 'bg-orange-500/20 text-orange-400 border-b-2 border-orange-500'
                                : 'text-white/60 hover:text-white/80'
                            }`}
                    >
                        Workflows
                    </button>
                    <button
                        onClick={() => setActiveTab('agents')}
                        className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === 'agents'
                                ? 'bg-orange-500/20 text-orange-400 border-b-2 border-orange-500'
                                : 'text-white/60 hover:text-white/80'
                            }`}
                    >
                        Agents
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === 'create'
                                ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500'
                                : 'text-white/60 hover:text-white/80'
                            }`}
                    >
                        + Create Agent
                    </button>
                </div>

                {/* Workflows Tab */}
                {activeTab === 'workflows' && (
                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="text-sm font-semibold text-white/90 mb-3">Available Workflows</div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {WORKFLOWS.map((workflow) => (
                                    <button
                                        key={workflow.id}
                                        onClick={() => setSelectedWorkflow(workflow)}
                                        className={`w-full text-left p-3 rounded-xl border transition-all ${selectedWorkflow?.id === workflow.id
                                                ? 'border-orange-500/50 bg-orange-500/10'
                                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{workflow.icon}</span>
                                            <div>
                                                <div className="font-medium text-white/90">{workflow.name}</div>
                                                <div className="text-xs text-white/50">{workflow.nodes} nodes</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="text-sm font-semibold text-white/90 mb-3">Workflow Details</div>
                            {selectedWorkflow ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{selectedWorkflow.icon}</span>
                                        <div>
                                            <div className="font-semibold text-white">{selectedWorkflow.name}</div>
                                            <div className="text-xs text-orange-400">{selectedWorkflow.nodes} automation nodes</div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-white/70">{selectedWorkflow.description}</p>

                                    {/* Workflow visualization */}
                                    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                                        <div className="text-xs font-medium text-white/50 mb-2">Workflow Preview</div>
                                        <div className="flex items-center justify-center gap-2">
                                            {Array.from({ length: Math.min(selectedWorkflow.nodes, 5) }).map((_, i) => (
                                                <div key={i} className="flex items-center">
                                                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                                                        <span className="text-orange-400 text-xs">{i + 1}</span>
                                                    </div>
                                                    {i < Math.min(selectedWorkflow.nodes, 5) - 1 && (
                                                        <div className="w-4 h-0.5 bg-orange-500/40" />
                                                    )}
                                                </div>
                                            ))}
                                            {selectedWorkflow.nodes > 5 && (
                                                <span className="text-white/40 text-xs ml-1">+{selectedWorkflow.nodes - 5}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-white/40 py-8">
                                    <span className="text-4xl mb-2 block">📋</span>
                                    Select a workflow to view details
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Agents Tab */}
                {activeTab === 'agents' && (
                    <div className="grid gap-3">
                        <div className="text-sm font-semibold text-white/90">Summon an Automation Agent</div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {AGENT_TYPES.map((agent) => (
                                <div
                                    key={agent.id}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                                >
                                    <div className="text-3xl text-center mb-2">{agent.emoji}</div>
                                    <div className="font-medium text-white/90 text-center mb-1">{agent.name}</div>
                                    <div className="text-xs text-white/50 text-center mb-3">{agent.description}</div>
                                    <Button
                                        size="sm"
                                        className="w-full rounded-xl bg-orange-500 hover:bg-orange-600"
                                        onClick={() => onSummonAgent?.(agent)}
                                    >
                                        Summon
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-white/40 text-center mt-2">
                            Summoned agents will appear in the world and can help you with automation tasks.
                        </div>
                    </div>
                )}

                {/* Create Agent Tab */}
                {activeTab === 'create' && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                            <div className="text-sm font-semibold text-white/90">Create New Webhook Agent</div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="agent-name" className="text-white/80">Name *</Label>
                                <Input
                                    id="agent-name"
                                    value={agentName}
                                    onChange={(e) => setAgentName(e.target.value)}
                                    placeholder="e.g. Support Bot"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="agent-role" className="text-white/80">Role</Label>
                                <Input
                                    id="agent-role"
                                    value={agentRole}
                                    onChange={(e) => setAgentRole(e.target.value)}
                                    placeholder="e.g. Customer Service Agent"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="agent-gender" className="text-white/80">Gender (Sprite)</Label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setAgentGender('male')}
                                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                            agentGender === 'male'
                                                ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        Male
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAgentGender('female')}
                                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                            agentGender === 'female'
                                                ? 'bg-pink-500/30 text-pink-300 border border-pink-500/50'
                                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        Female
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                            <div className="text-sm font-semibold text-white/90">Webhook Configuration</div>

                            <div className="space-y-2">
                                <Label htmlFor="webhook-url" className="text-white/80">Webhook URL *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="webhook-url"
                                        value={webhookUrl}
                                        onChange={(e) => {
                                            setWebhookUrl(e.target.value)
                                            setWebhookTestResult(null)
                                        }}
                                        placeholder="https://your-n8n.example.com/webhook/..."
                                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleTestWebhook}
                                        disabled={isTestingWebhook || !webhookUrl.trim()}
                                        className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white whitespace-nowrap"
                                    >
                                        {isTestingWebhook ? (
                                            <>
                                                <span className="animate-spin mr-1">⏳</span>
                                                Testing...
                                            </>
                                        ) : (
                                            '🧪 Test'
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-white/40">
                                    The webhook will be called when you talk to the agent.
                                </p>
                                {webhookTestResult && (
                                    <div className={`rounded-lg p-2 text-sm ${
                                        webhookTestResult.success 
                                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                            : 'bg-red-500/20 border border-red-500/40 text-red-300'
                                    }`}>
                                        {webhookTestResult.success ? '✓ ' : '✗ '}
                                        {webhookTestResult.message}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="agent-greeting" className="text-white/80">Greeting</Label>
                                <Textarea
                                    id="agent-greeting"
                                    value={agentGreeting}
                                    onChange={(e) => setAgentGreeting(e.target.value)}
                                    placeholder="Hello! How can I help you?"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 min-h-[80px]"
                                />
                            </div>

                            {/* Sprite Generation Section */}
                            <div className="space-y-2 pt-2 border-t border-white/10">
                                <Label className="text-white/80">Character Sprite</Label>
                                <p className="text-xs text-white/40">
                                    A custom sprite will be generated for your agent. Sprites are required for all agents.
                                </p>
                                
                                {!generatedSprite && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGenerateSprite}
                                        disabled={isGeneratingSprite || !agentName.trim()}
                                        className="w-full border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                                    >
                                        {isGeneratingSprite ? (
                                            <>
                                                <span className="animate-spin mr-2">🎨</span>
                                                Generating Sprite...
                                            </>
                                        ) : (
                                            '🎨 Pre-generate Sprite'
                                        )}
                                    </Button>
                                )}
                                
                                {generatedSprite && (
                                    <div className="flex items-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 p-2 text-sm text-emerald-300">
                                        <span className="text-lg">✓</span>
                                        <span>Sprite generated!</span>
                                        <button
                                            type="button"
                                            onClick={() => setGeneratedSprite(null)}
                                            className="ml-auto text-xs text-white/50 hover:text-white/80"
                                        >
                                            Regenerate
                                        </button>
                                    </div>
                                )}
                            </div>

                            {createError && (
                                <div className="rounded-lg bg-red-500/20 border border-red-500/40 p-3 text-sm text-red-300">
                                    {createError}
                                </div>
                            )}

                            <Button
                                onClick={handleCreateAgent}
                                disabled={isCreating || isGeneratingSprite}
                                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
                            >
                                {isCreating || isGeneratingSprite ? (
                                    <>
                                        <span className="animate-spin mr-2">⏳</span>
                                        {isGeneratingSprite ? 'Generating Sprite...' : 'Creating Agent...'}
                                    </>
                                ) : (
                                    '🚀 Create & Place Agent'
                                )}
                            </Button>

                            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                                <div className="text-xs font-medium text-white/50 mb-2">Preview</div>
                                <div className="flex items-center gap-3">
                                    {generatedSprite ? (
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/30 border border-white/10">
                                            <img 
                                                src={generatedSprite} 
                                                alt="Generated sprite" 
                                                className="w-full h-full object-cover"
                                                style={{ imageRendering: 'pixelated' }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/40 text-xs">
                                            ?
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-medium text-white/90">{agentName || 'Agent Name'}</div>
                                        <div className="text-xs text-orange-400">{agentRole || 'Webhook Agent'}</div>
                                        {generatedSprite ? (
                                            <div className="text-xs text-emerald-400 mt-0.5">Sprite ready</div>
                                        ) : (
                                            <div className="text-xs text-white/40 mt-0.5">Generate sprite first</div>
                                        )}
                                    </div>
                                </div>
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
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
