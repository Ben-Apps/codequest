'use server'

import { NextRequest, NextResponse } from 'next/server'

/**
 * Test a webhook URL to verify it's reachable and responds correctly.
 * Sends a test message and expects a JSON response.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { webhookUrl } = body as { webhookUrl?: string }

    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: 'Webhook URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    let url: URL
    try {
      url = new URL(webhookUrl)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL' },
        { status: 400 }
      )
    }

    // Only allow https in production (allow http for localhost dev)
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    if (!isLocalhost && url.protocol !== 'https:') {
      return NextResponse.json(
        { success: false, error: 'HTTPS is required (except localhost)' },
        { status: 400 }
      )
    }

    // Send test request to webhook
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    try {
      const testPayload = {
        type: 'test',
        message: 'AgentMind Webhook Test',
        timestamp: new Date().toISOString(),
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AgentMind/1.0',
        },
        body: JSON.stringify(testPayload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            error: `Webhook responded with status ${response.status}: ${response.statusText}`,
            statusCode: response.status,
          },
          { status: 200 }
        )
      }

      // Try to parse response
      let responseData: unknown = null
      const contentType = response.headers.get('content-type') ?? ''
      
      if (contentType.includes('application/json')) {
        try {
          responseData = await response.json()
        } catch {
          // JSON parse failed, but that's ok
        }
      } else {
        responseData = await response.text()
      }

      return NextResponse.json({
        success: true,
        message: 'Webhook is reachable and responding!',
        statusCode: response.status,
        responsePreview: typeof responseData === 'string' 
          ? responseData.slice(0, 200) 
          : JSON.stringify(responseData).slice(0, 200),
      })

    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Timeout: Webhook did not respond within 10 seconds' },
          { status: 200 }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: `Connection error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
        },
        { status: 200 }
      )
    }

  } catch (error) {
    console.error('Webhook test error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
