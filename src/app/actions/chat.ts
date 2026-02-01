'use server'

import { chatWithAgent, type AgentCapability, type ChatSource } from '@/lib/gemini-service'

interface ChatHistory {
  role: 'user' | 'model'
  text: string
}

export type AgentChatConfig = {
  id: string
  systemInstruction: string
  greeting: string
  capabilities?: AgentCapability[]
  /**
   * Optional: Webhook-URL für externe Agents.
   * Wenn gesetzt, wird die Nachricht an den Webhook gesendet.
   */
  webhookUrl?: string
}

// In-memory chat history (for demo purposes)
const chatHistories = new Map<string, ChatHistory[]>()

/**
 * Sendet eine Nachricht an einen Webhook-basierten Agent.
 * Erwartet, dass der Webhook ein JSON mit { response: string } zurückgibt.
 */
async function sendToWebhook(
  webhookUrl: string,
  agentId: string,
  message: string,
  history: ChatHistory[]
): Promise<{ text: string; sources?: ChatSource[] }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId,
        message,
        history,
        timestamp: Date.now(),
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error')
      throw new Error(`Webhook error (${res.status}): ${errorText}`)
    }

    const data = await res.json() as { response?: string; text?: string; sources?: ChatSource[] }
    
    // Support both "response" and "text" fields for flexibility
    const responseText = data.response ?? data.text ?? 'Keine Antwort vom Webhook'
    
    return {
      text: responseText,
      sources: data.sources,
    }
  } catch (error) {
    clearTimeout(timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Webhook Timeout - no response within 30 seconds')
    }
    throw error
  }
}

export async function sendMessageToAgent(
  agent: AgentChatConfig,
  message: string
): Promise<{
  success: boolean
  response?: string
  sources?: ChatSource[]
  error?: string
}> {
  try {
    if (!agent?.id || !agent?.systemInstruction) return { success: false, error: 'Invalid agent' }

    // Get or create chat history
    const history = chatHistories.get(agent.id) || []

    // If first message, add greeting
    if (history.length === 0) {
      history.push({ role: 'model', text: agent.greeting })
    }

    let result: { text: string; sources?: ChatSource[] }

    // Check if this is a webhook-based agent
    if (agent.webhookUrl) {
      result = await sendToWebhook(agent.webhookUrl, agent.id, message, history)
    } else {
      // Send message to Gemini with capabilities
      result = await chatWithAgent(
        agent.systemInstruction,
        history,
        message,
        agent.capabilities
      )
    }

    // Update history
    history.push({ role: 'user', text: message })
    history.push({ role: 'model', text: result.text })
    chatHistories.set(agent.id, history)

    return {
      success: true,
      response: result.text,
      sources: result.sources
    }
  } catch (error) {
    console.error('Chat error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chat failed',
    }
  }
}

export async function resetAgentChat(agentId: string): Promise<void> {
  chatHistories.delete(agentId)
}

