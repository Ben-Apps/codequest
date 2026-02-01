import { NextResponse } from 'next/server'

type TtsRequest = {
  text: string
  voiceId?: string
  voiceGender?: 'male' | 'female'
  modelId?: string
  outputFormat?: string
  voiceSettings?: {
    stability?: number
    similarityBoost?: number
    style?: number
    useSpeakerBoost?: boolean
    speed?: number
  }
}

export async function POST(req: Request) {
  let payload: TtsRequest
  try {
    payload = (await req.json()) as TtsRequest
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const text = typeof payload.text === 'string' ? payload.text.trim() : ''
  if (!text) {
    return NextResponse.json({ error: 'Text is missing' }, { status: 400 })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  const gender = payload.voiceGender
  const genderVoiceId =
    gender === 'female'
      ? process.env.ELEVENLABS_VOICE_ID_FEMALE
      : gender === 'male'
        ? process.env.ELEVENLABS_VOICE_ID_MALE
        : undefined
  const voiceId = payload.voiceId ?? genderVoiceId ?? process.env.ELEVENLABS_VOICE_ID
  if (!apiKey) {
    return NextResponse.json({ error: 'Server: ELEVENLABS_API_KEY missing' }, { status: 500 })
  }
  if (!voiceId) {
    return NextResponse.json({ error: 'Server: ELEVENLABS_VOICE_ID missing' }, { status: 500 })
  }

  const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`)
  if (payload.outputFormat) url.searchParams.set('output_format', payload.outputFormat)

  const elevenRes = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: payload.modelId ?? 'eleven_flash_v2_5', // Low latency model (~75ms)
      voice_settings: payload.voiceSettings,
    }),
  })

  if (!elevenRes.ok || !elevenRes.body) {
    const detail = await elevenRes.text().catch(() => '')
    return NextResponse.json(
      { error: 'ElevenLabs request failed', status: elevenRes.status, detail: detail.slice(0, 500) },
      { status: 502 }
    )
  }

  return new Response(elevenRes.body, {
    status: 200,
    headers: {
      'Content-Type': elevenRes.headers.get('content-type') ?? 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  })
}

