'use client'

/*
  This component intentionally uses effects to drive a typewriter animation
  and to initialize state when the active agent changes.
*/

import { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AgentPanel } from '@/components/agent-panel'
import type { AgentNPC } from '@/types'
import { getAgentUI, isPanelAgent } from '@/lib/agent-ui'
import { sendMessageToAgent } from '@/app/actions/chat'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'

interface RPGDialogProps {
  agent: AgentNPC | null
  open: boolean
  onClose: () => void
}

type DialogPhase = 'speaking' | 'awaiting' | 'typing' | 'loading'

export function RPGDialog({ agent, open, onClose }: RPGDialogProps) {
  type ChatMessage = {
    id: string
    role: 'user' | 'model'
    text: string
    sources?: Array<{ title: string; url: string }>
  }

  const makeMessageId = () => {
    const maybeCrypto = globalThis.crypto as (Crypto & { randomUUID?: () => string }) | undefined
    return maybeCrypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingTargetId, setTypingTargetId] = useState<string | null>(null)
  const [displayedText, setDisplayedText] = useState('')
  const [fullText, setFullText] = useState('')
  const [phase, setPhase] = useState<DialogPhase>('speaking')
  const [userInput, setUserInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastAgentIdRef = useRef<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const audioUnlockedRef = useRef(false)
  const ttsAbortRef = useRef<AbortController | null>(null)
  const lastSpokenTextRef = useRef<string | null>(null)
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const ui = agent ? getAgentUI(agent) : { type: 'chat' as const }
  const panelId = agent && isPanelAgent(agent) ? agent.ui.panelId : null
  const [ttsEnabled, setTtsEnabled] = useState(false)

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: isSpeechSupported,
    resetTranscript
  } = useSpeechRecognition()

  // Sync speech transcript with user input
  useEffect(() => {
    if (transcript) {
      setUserInput(transcript)
    }
  }, [transcript])

  // Stop listening if it's no longer the user's turn
  useEffect(() => {
    if (phase !== 'typing' && isListening) {
      stopListening()
    }
  }, [phase, isListening, stopListening])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' })
  }, [])

  const stopTts = useCallback(() => {
    ttsAbortRef.current?.abort()
    ttsAbortRef.current = null

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
      } catch {
        // ignore
      }
    }
    speechUtteranceRef.current = null

    const audio = audioRef.current
    if (audio) {
      try {
        audio.pause()
      } catch {
        // ignore
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = null
      }
      audio.src = ''
    }
  }, [])

  // Autoplay-Policies: Audio muss oft einmal durch eine User-Interaktion "freigeschaltet" werden.
  // Wir spielen dafür ein sehr kurzes, stummes WAV ab.
  const unlockAudio = useCallback(async () => {
    if (audioUnlockedRef.current) return true

    const audio = audioRef.current ?? new Audio()
    audioRef.current = audio
    audio.preload = 'auto'
    // iOS/Safari: "inline" playback hint (property exists on video, so we use an attribute here)
    audio.setAttribute('playsinline', 'true')

    const sampleRate = 44100
    const durationSeconds = 0.05
    const numSamples = Math.max(1, Math.floor(sampleRate * durationSeconds))
    const bytesPerSample = 2
    const dataSize = numSamples * bytesPerSample
    const buffer = new ArrayBuffer(44 + dataSize)
    const view = new DataView(buffer)

    const writeString = (offset: number, s: string) => {
      for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i))
    }

    // RIFF header
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + dataSize, true)
    writeString(8, 'WAVE')
    // fmt chunk
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true) // PCM chunk size
    view.setUint16(20, 1, true) // PCM format
    view.setUint16(22, 1, true) // channels
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * bytesPerSample, true) // byteRate
    view.setUint16(32, bytesPerSample, true) // blockAlign
    view.setUint16(34, 16, true) // bitsPerSample
    // data chunk
    writeString(36, 'data')
    view.setUint32(40, dataSize, true)
    // Samples sind per default 0 => Stille

    const blob = new Blob([buffer], { type: 'audio/wav' })
    const url = URL.createObjectURL(blob)

    const prevSrc = audio.src
    const prevVolume = audio.volume
    try {
      audio.src = url
      audio.volume = 0
      await audio.play()
      audio.pause()
      try {
        audio.currentTime = 0
      } catch {
        // ignore
      }
      audioUnlockedRef.current = true
      return true
    } catch {
      return false
    } finally {
      URL.revokeObjectURL(url)
      audio.volume = prevVolume
      // Stelle sicher, dass wir nicht dauerhaft auf dem Silent-Clip hängen bleiben.
      if (audio.src === url) audio.src = prevSrc
    }
  }, [])

  const speakTts = useCallback(
    async (text: string, voiceGender?: 'male' | 'female') => {
      const trimmed = text.trim()
      if (!trimmed) return

      stopTts()

      const speakWithBrowser = async () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
        const synth = window.speechSynthesis
        const utterance = new SpeechSynthesisUtterance(trimmed)
        utterance.lang = navigator.language || 'en-US'

        const voices = synth.getVoices()
        const preferredLang = utterance.lang?.toLowerCase() ?? ''
        const matching = voices.filter((v) => v.lang.toLowerCase().startsWith(preferredLang))
        if (matching.length > 0) {
          utterance.voice = matching[0]
        } else if (voices.length > 0) {
          utterance.voice = voices[0]
        }

        speechUtteranceRef.current = utterance
        synth.cancel()
        synth.speak(utterance)
      }

      const controller = new AbortController()
      ttsAbortRef.current = controller

      // Use HTTP streaming with the fast Flash model
      let res: Response
      try {
        res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: trimmed,
            outputFormat: 'mp3_44100_64', // Smaller for faster streaming
            voiceGender,
          }),
          signal: controller.signal,
        })
      } catch {
        await speakWithBrowser()
        return
      }

      if (!res.ok) {
        try {
          const err = (await res.json()) as { error?: string; detail?: string }
          // eslint-disable-next-line no-console
          console.error('TTS Error:', res.status, err.error, err.detail)
        } catch {
          // eslint-disable-next-line no-console
          console.error('TTS Error:', res.status)
        }
        await speakWithBrowser()
        return
      }

      // Simple approach: download full audio then play (most compatible)
      try {
        const buf = await res.arrayBuffer()
        if (controller.signal.aborted) return

        const blob = new Blob([buf], { type: 'audio/mpeg' })
        const objectUrl = URL.createObjectURL(blob)

        const audio = audioRef.current ?? new Audio()
        audioRef.current = audio
        audio.preload = 'auto'
        audio.setAttribute('playsinline', 'true')

        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current)
        }
        audioUrlRef.current = objectUrl
        audio.src = objectUrl

        await audio.play().catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Audio play error:', err)
          void speakWithBrowser()
        })
      } catch {
        await speakWithBrowser()
      }
    },
    [stopTts]
  )

  const handleClose = useCallback(() => {
    stopTts()
    stopListening() // Ensure STT also stops
    onClose()
  }, [onClose, stopTts, stopListening])

  // TTS default-on pro Agent (lokal in SessionStorage)
  // Unlock audio on dialog open (user interaction context)
  useEffect(() => {
    if (!open || !agent) return

    // Unlock audio immediately - must happen synchronously in user interaction context
    // The dialog open is triggered by user click, so this should work
    void unlockAudio()

    // Also create/resume AudioContext immediately (helps with autoplay)
    try {
      const audio = audioRef.current ?? new Audio()
      audioRef.current = audio
      audio.volume = 1
      audio.muted = false
    } catch {
      // ignore
    }

    try {
      const key = `agentmind_tts_${agent.id}`
      const raw = sessionStorage.getItem(key)
      if (raw === null) {
        sessionStorage.setItem(key, '1')
        setTtsEnabled(true)
      } else {
        setTtsEnabled(raw === '1')
      }
    } catch {
      setTtsEnabled(true)
    }
  }, [open, agent, unlockAudio])

  // Stoppe Audio beim Agent-Wechsel / Dialog schließen
  useEffect(() => {
    stopTts()
    lastSpokenTextRef.current = null
  }, [agent?.id, stopTts])

  // Initialize (or switch) with greeting - for proactive agents, make an API call
  useEffect(() => {
    if (!agent) return

    const isNewAgent = lastAgentIdRef.current !== agent.id
    const needsInit = messages.length === 0
    if (!isNewAgent && !needsInit) return

    lastAgentIdRef.current = agent.id

    stopTts()
    lastSpokenTextRef.current = null

    const greetingId = makeMessageId()
    setMessages([{ id: greetingId, role: 'model', text: '' }])
    setTypingTargetId(greetingId)
    setUserInput('')
    scrollToBottom('auto')

    // Check if agent has proactive greeting enabled
    if (agent.proactiveGreeting && agent.proactivePrompt) {
      // Show loading state first with static greeting
      setFullText(agent.greeting)
      setDisplayedText('')
      setPhase('loading')

      // Make API call to get proactive content
      const fetchProactiveGreeting = async () => {
        try {
          const result = await sendMessageToAgent(
            {
              id: agent.id,
              systemInstruction: agent.systemInstruction,
              greeting: agent.greeting,
              capabilities: agent.capabilities,
              webhookUrl: agent.webhookUrl,
            },
            agent.proactivePrompt!
          )

          if (result.success && result.response) {
            setFullText(result.response)
            setDisplayedText('')
            setPhase('speaking')
          } else {
            // Fallback to static greeting
            setFullText(agent.greeting)
            setDisplayedText('')
            setPhase('speaking')
          }
        } catch (error) {
          console.error('Proactive greeting failed:', error)
          // Fallback to static greeting
          setFullText(agent.greeting)
          setDisplayedText('')
          setPhase('speaking')
        }
      }

      void fetchProactiveGreeting()
    } else {
      // Standard static greeting
      setFullText(agent.greeting)
      setDisplayedText('')
      setPhase('speaking')
    }
  }, [agent, messages.length, scrollToBottom, stopTts])

  // Typewriter effect
  useEffect(() => {
    if (phase !== 'speaking') return
    if (!typingTargetId) return
    if (displayedText.length >= fullText.length) {
      setMessages((prev) =>
        prev.map((m) => (m.id === typingTargetId ? { ...m, text: fullText } : m))
      )
      setTypingTargetId(null)
      setPhase('typing')
      return
    }

    const timeout = setTimeout(() => {
      setDisplayedText(fullText.slice(0, displayedText.length + 1))
    }, 25)

    return () => clearTimeout(timeout)
  }, [displayedText, fullText, phase, typingTargetId])

  // Keep the chat anchored to the bottom as it grows
  useEffect(() => {
    if (!open) return
    scrollToBottom('auto')
  }, [open, messages.length, scrollToBottom])

  useEffect(() => {
    if (!open) return
    if (phase === 'speaking') scrollToBottom('auto')
  }, [open, phase, displayedText, scrollToBottom])

  useEffect(() => {
    if (!open) return
    if (phase !== 'typing') return
    if (ui.type === 'panel') return
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [open, phase, ui.type])

  // Handle keyboard
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
      if (e.key === ' ' && phase === 'speaking') {
        e.preventDefault()
        // Skip typewriter: commit full text into the active message
        if (typingTargetId) {
          setMessages((prev) =>
            prev.map((m) => (m.id === typingTargetId ? { ...m, text: fullText } : m))
          )
        }
        setDisplayedText(fullText)
        setTypingTargetId(null)
        setPhase('typing')
        stopTts()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, phase, fullText, handleClose, stopTts, typingTargetId])

  // TTS trigger: spricht jedes neue Model-Statement
  // Uses a small delay to ensure ttsEnabled state has propagated
  useEffect(() => {
    if (!open) return
    if (phase !== 'speaking') return
    if (!fullText.trim()) return
    if (lastSpokenTextRef.current === fullText) return

    // Small delay to ensure ttsEnabled state is set (first render race condition)
    const timer = setTimeout(() => {
      // Re-check ttsEnabled after delay (read from sessionStorage as source of truth)
      let shouldSpeak = ttsEnabled
      try {
        const key = agent ? `agentmind_tts_${agent.id}` : ''
        const stored = key ? sessionStorage.getItem(key) : null
        shouldSpeak = stored === null || stored === '1'
      } catch {
        shouldSpeak = true
      }

      if (!shouldSpeak) return
      if (lastSpokenTextRef.current === fullText) return

      lastSpokenTextRef.current = fullText

      // Unlock audio and speak
      void unlockAudio().then(() => speakTts(fullText, agent?.gender))
    }, 150)

    return () => clearTimeout(timer)
  }, [agent, fullText, open, phase, speakTts, ttsEnabled, unlockAudio])

  const handleSendMessage = async () => {
    if (!userInput.trim() || !agent) return
    if (ui.type === 'panel') return

    const message = userInput.trim()
    stopTts()
    stopListening()
    setUserInput('')
    setMessages((prev) => [...prev, { id: makeMessageId(), role: 'user', text: message }])
    setPhase('loading')
    scrollToBottom('auto')

    try {
      const result = await sendMessageToAgent(
        {
          id: agent.id,
          systemInstruction: agent.systemInstruction,
          greeting: agent.greeting,
          capabilities: agent.capabilities,
          webhookUrl: agent.webhookUrl,
        },
        message
      )

      if (result.success && result.response) {
        const replyId = makeMessageId()
        setMessages((prev) => [...prev, {
          id: replyId,
          role: 'model',
          text: '',
          sources: result.sources
        }])
        setTypingTargetId(replyId)
        setFullText(result.response)
        setDisplayedText('')
        setPhase('speaking')
      } else {
        const replyId = makeMessageId()
        setMessages((prev) => [...prev, { id: replyId, role: 'model', text: '' }])
        setTypingTargetId(replyId)
        setFullText(result.error || 'Hmm, something went wrong...')
        setDisplayedText('')
        setPhase('speaking')
      }
    } catch {
      const replyId = makeMessageId()
      setMessages((prev) => [...prev, { id: replyId, role: 'model', text: '' }])
      setTypingTargetId(replyId)
      setFullText('Sorry, I couldn\'t respond.')
      setDisplayedText('')
      setPhase('speaking')
    }
  }

  if (!open || !agent) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Dialog Box */}
        <div className="bg-gray-900/95 border-4 border-gray-700 rounded-lg shadow-2xl backdrop-blur overflow-hidden">
          {/* Header with Avatar */}
          <div className="flex gap-4 p-4 border-b-2 border-gray-700">
            {/* NPC Avatar */}
            <div className="w-16 h-16 bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center text-3xl shrink-0">
              {agent.avatar}
            </div>

            {/* Name + Hint */}
            <div className="flex-1 min-h-[64px]">
              <div className="text-primary font-bold text-sm mb-1 font-mono tracking-wide uppercase">
                {agent.name}
              </div>
              <div className="text-gray-200 font-mono text-xs leading-relaxed">
                {phase === 'speaking' && 'Speaking... ([SPACE] to skip)'}
                {phase === 'typing' && (ui.type === 'panel' ? 'Interactive view opened.' : 'Your turn. ([ENTER] to send)')}
                {phase === 'loading' && 'Thinking... *quietly humming*'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  const next = !ttsEnabled
                  setTtsEnabled(next)
                  try {
                    if (agent) {
                      sessionStorage.setItem(`agentmind_tts_${agent.id}`, next ? '1' : '0')
                    }
                  } catch {
                    // ignore
                  }
                  if (!next) {
                    stopTts()
                    return
                  }

                  // Try to unlock audio via user gesture.
                  await unlockAudio()
                }}
                className="rounded-md border border-gray-700 bg-gray-800/70 p-2 text-gray-200 hover:bg-gray-800 hover:text-white transition-colors"
                aria-label={ttsEnabled ? 'Sprachausgabe deaktivieren' : 'Sprachausgabe aktivieren'}
                title={ttsEnabled ? 'Stimme: an' : 'Stimme: aus'}
              >
                {ttsEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
              </button>

              {/* Continue indicator */}
              {phase === 'typing' && (
                <div className="self-end text-primary text-xl">
                  ◆
                </div>
              )}
            </div>
          </div>

          {/* Chat History (wächst nach oben) */}
          <div className="px-4 py-3 border-b border-gray-800 max-h-[45vh] overflow-y-auto">
            <div className="min-h-full flex flex-col justify-end gap-3">
              {messages.map((m) => {
                const isUser = m.role === 'user'
                const isTypingTarget = m.id === typingTargetId
                const text = isTypingTarget ? displayedText : m.text

                return (
                  <div key={m.id} className={isUser ? 'flex justify-end' : 'flex justify-start'}>
                    <div
                      className={[
                        'max-w-[85%] rounded-lg border px-3 py-2 text-sm leading-relaxed',
                        isUser
                          ? 'bg-primary/20 border-primary/40 text-white font-mono'
                          : 'bg-gray-800/70 border-gray-600 text-white',
                      ].join(' ')}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{text}</p>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          components={{
                            p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
                            a: ({ children, href }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary underline underline-offset-2 hover:opacity-90"
                              >
                                {children}
                              </a>
                            ),
                            ul: ({ children }) => <ul className="list-disc ml-5">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal ml-5">{children}</ol>,
                            li: ({ children }) => <li className="my-1">{children}</li>,
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-gray-600 pl-3 text-gray-200">
                                {children}
                              </blockquote>
                            ),
                            code: ({ children, className }) => {
                              const raw =
                                typeof children === 'string'
                                  ? children
                                  : Array.isArray(children)
                                    ? children.join('')
                                    : ''
                              const isInline = !raw.includes('\n')

                              return isInline ? (
                                <code className="px-1 py-0.5 rounded bg-gray-900/60 text-gray-100">
                                  {children}
                                </code>
                              ) : (
                                <code
                                  className={['block whitespace-pre text-gray-100', className]
                                    .filter(Boolean)
                                    .join(' ')}
                                >
                                  {children}
                                </code>
                              )
                            },
                            pre: ({ children }) => (
                              <pre className="my-2 p-3 rounded bg-black/40 overflow-x-auto">
                                {children}
                              </pre>
                            ),
                            h1: ({ children }) => <div className="font-bold text-base my-2">{children}</div>,
                            h2: ({ children }) => <div className="font-bold text-sm my-2">{children}</div>,
                            h3: ({ children }) => <div className="font-bold text-sm my-2">{children}</div>,
                          }}
                        >
                          {text}
                        </ReactMarkdown>
                      )}
                      {isTypingTarget && phase === 'speaking' && (
                        <span className="animate-pulse ml-1">_</span>
                      )}
                      {/* Sources from search */}
                      {!isUser && m.sources && m.sources.length > 0 && !isTypingTarget && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <div className="text-[10px] text-gray-400 mb-1">Sources:</div>
                          <div className="flex flex-wrap gap-1">
                            {m.sources.slice(0, 3).map((src, i) => (
                              <a
                                key={i}
                                href={src.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-primary/80 hover:text-primary bg-primary/10 px-1.5 py-0.5 rounded truncate max-w-[150px]"
                                title={src.title}
                              >
                                {src.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Agent Panel */}
          {panelId && (
            <div className="border-b border-gray-800">
              <AgentPanel panelId={panelId} />
            </div>
          )}

          {/* Input Area */}
          {ui.type !== 'panel' && (
            <div className="p-4 border-t-2 border-gray-700">
              <div className="flex gap-2">
                {isSpeechSupported && (
                  <Button
                    type="button"
                    variant={isListening ? "destructive" : "secondary"}
                    size="icon"
                    className={`shrink-0 ${isListening ? 'animate-pulse' : ''}`}
                    disabled={phase !== 'typing'}
                    onClick={() => {
                      if (isListening) {
                        stopListening()
                      } else {
                        startListening()
                        resetTranscript()
                        setUserInput('')
                      }
                    }}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                  </Button>
                )}
                <Input
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => {
                    setUserInput(e.target.value)
                    // If user types manually, maybe stop listening? 
                    // Optional: stopListening()
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && phase === 'typing' && handleSendMessage()}
                  placeholder={isListening ? "Listening..." : "Your answer..."}
                  className="bg-gray-800 border-gray-600 font-mono"
                  disabled={phase !== 'typing'}
                />
                <Button onClick={handleSendMessage} disabled={phase !== 'typing' || !userInput.trim()}>
                  Senden
                </Button>
              </div>
            </div>
          )}

          {/* Loading */}
          {phase === 'loading' && (
            <div className="p-4 text-center text-muted-foreground font-mono">
              <span className="animate-pulse">. . .</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center px-4 py-2 border-t border-gray-800 text-xs text-gray-500">
            <span>
              {phase === 'speaking' && '[SPACE] Skip'}
              {phase === 'typing' && (ui.type === 'panel' ? 'Tip: Check off tasks & save progress' : '[ENTER] Send')}
            </span>
            <button
              onClick={handleClose}
              className="hover:text-white transition-colors"
            >
              [ESC] Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
