import { NextResponse } from 'next/server'

/**
 * Returns a signed WebSocket URL for ElevenLabs TTS.
 * The client can use this URL to connect directly to ElevenLabs WebSocket API.
 */
export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID

  if (!apiKey) {
    return NextResponse.json({ error: 'ELEVENLABS_API_KEY nicht konfiguriert' }, { status: 500 })
  }
  if (!voiceId) {
    return NextResponse.json({ error: 'ELEVENLABS_VOICE_ID nicht konfiguriert' }, { status: 500 })
  }

  // Build WebSocket URL with auth and optimized settings
  // Note: Browser WebSockets can't send custom headers, so we use 'authorization' query param
  const params = new URLSearchParams({
    'authorization': apiKey, // API key as authorization query param for WebSocket
    'model_id': 'eleven_flash_v2_5', // Ultra-low latency model (~75ms)
    'output_format': 'mp3_44100_64', // Smaller chunks for faster streaming
    'inactivity_timeout': '30',
  })

  const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?${params.toString()}`

  return NextResponse.json({ wsUrl, voiceId })
}
