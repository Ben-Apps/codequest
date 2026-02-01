import type { AgentNPC, AgentUI } from '@/types'

export function getAgentUI(agent: AgentNPC): AgentUI {
  return agent.ui ?? { type: 'chat' }
}

export function isPanelAgent(agent: AgentNPC): agent is AgentNPC & { ui: { type: 'panel'; panelId: string } } {
  return agent.ui?.type === 'panel'
}

