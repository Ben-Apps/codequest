'use server'

import { reviewCodeChallenge } from '@/lib/gemini-service'

export async function getCodeReview(args: {
  challengeTitle: string
  challengeDescription: string
  code: string
  testSummary: string
}): Promise<{ success: boolean; feedback?: string; error?: string }> {
  try {
    const feedback = await reviewCodeChallenge(args)
    return { success: true, feedback }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI feedback failed',
    }
  }
}

