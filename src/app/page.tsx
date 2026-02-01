'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Bot, BookOpen, Building2, ChevronRight, Code2, Factory, Gamepad2, GitBranch, GraduationCap, Home, Layers, Library, Lightbulb, Map, MessageSquare, Newspaper, Palette, Play, Rocket, ScrollText, Shield, Sparkles, Store, Swords, Target, TrendingUp, Trophy, Users, Workflow, Zap, FlaskConical, X, Check, User, Wand2, Github, Twitter, Mail, Heart, ExternalLink, Youtube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CHARACTER_PRESETS } from '@/lib/agents'
import { generateCharacterAndSpriteAction } from '@/app/actions/generate'
import type { CharacterPreset } from '@/types'

// Agent sprite data
const AGENT_SPRITES = {
  bernie: '/sprites/agents/news-agent.png',
  otto: '/sprites/agents/factory-npc-otto.png',
  shield: '/sprites/agents/security-npc-shield.png',
  grace: '/sprites/agents/questmaster.png',
  pixel: '/sprites/agents/creative-agent.png',
  sandy: '/sprites/agents/research-agent-sandy.png',
}

// Mob sprite data
const MOB_SPRITES = {
  bugSlime: '/sprites/mobs/bug-slime.png',
  syntaxDragon: '/sprites/mobs/syntax-dragon.png',
  loopWolf: '/sprites/mobs/loop-wolf.png',
  regexBat: '/sprites/mobs/regex-bat.png',
  arraySpider: '/sprites/mobs/array-spider.png',
  binaryGhost: '/sprites/mobs/binary-ghost.png',
}

// Single Sprite Frame Component - shows only the first frame (idle, facing front)
// Sprite sheets are 4x4 grids, Row 0 = facing camera, Col 0 = first idle frame
function SingleSpriteFrame({ src, alt, size = 64 }: { src: string; alt: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Sprite sheet is 4x4 grid
      const frameWidth = img.width / 4
      const frameHeight = img.height / 4
      
      // Create temp canvas to extract single frame
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = frameWidth
      tempCanvas.height = frameHeight
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return
      
      // Draw the first frame to temp canvas
      tempCtx.drawImage(
        img,
        0, 0, frameWidth, frameHeight,
        0, 0, frameWidth, frameHeight
      )
      
      // Remove white/light background - aggressive approach
      const imageData = tempCtx.getImageData(0, 0, frameWidth, frameHeight)
      const data = imageData.data
      
      // Remove any pixel that is very light (white, off-white, light gray)
      // This catches backgrounds that aren't pure white
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        
        // Check if pixel is "light" - all channels above 220 (very white)
        // OR all channels above 200 and similar to each other (gray/off-white)
        const isVeryLight = r > 220 && g > 220 && b > 220
        const isLightGray = r > 200 && g > 200 && b > 200 && 
          Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20
        
        if (isVeryLight || isLightGray) {
          data[i + 3] = 0 // Set alpha to 0 (transparent)
        }
      }
      tempCtx.putImageData(imageData, 0, 0)
      
      // Clear and set pixelated rendering on main canvas
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, size, size)
      
      // Draw processed frame to main canvas
      ctx.drawImage(tempCanvas, 0, 0, size, size)
      setLoaded(true)
    }
    img.src = src
  }, [src, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      style={{ imageRendering: 'pixelated' }}
      aria-label={alt}
    />
  )
}

// Building Canvas Component - renders pixelated building graphics
function BuildingCanvas({ type, width = 200, height = 140 }: { type: string; width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw building based on type
    const x = 10
    const y = 10
    const seed = 0.7

    switch (type) {
      case 'security_hub': {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.26)'
        ctx.beginPath()
        ctx.ellipse(x + 85, y + 115, 70, 12, 0, 0, Math.PI * 2)
        ctx.fill()

        // Base shell
        ctx.fillStyle = '#0a1628'
        ctx.fillRect(x + 14, y + 42, 145, 70)
        ctx.fillStyle = 'rgba(255,255,255,0.04)'
        ctx.fillRect(x + 16, y + 44, 141, 3)

        // Roof
        ctx.fillStyle = '#1e3a5f'
        ctx.beginPath()
        ctx.moveTo(x + 8, y + 42)
        ctx.lineTo(x + 85, y + 15)
        ctx.lineTo(x + 165, y + 42)
        ctx.closePath()
        ctx.fill()

        // Shield logo
        ctx.fillStyle = '#22d3ee'
        ctx.beginPath()
        ctx.moveTo(x + 85, y + 23)
        ctx.lineTo(x + 97, y + 29)
        ctx.lineTo(x + 95, y + 38)
        ctx.lineTo(x + 85, y + 42)
        ctx.lineTo(x + 75, y + 38)
        ctx.lineTo(x + 73, y + 29)
        ctx.closePath()
        ctx.fill()

        // Neon accent
        ctx.fillStyle = '#06b6d4'
        ctx.fillRect(x + 14, y + 62, 145, 2)
        ctx.fillStyle = 'rgba(6,182,212,0.3)'
        ctx.fillRect(x + 14, y + 64, 145, 4)

        // Door
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(x + 70, y + 80, 30, 32)
        ctx.fillStyle = '#1e293b'
        ctx.fillRect(x + 73, y + 83, 24, 26)

        // Sign
        ctx.fillStyle = 'rgba(0,0,0,0.75)'
        ctx.fillRect(x + 30, y + 48, 110, 12)
        ctx.fillStyle = '#22d3ee'
        ctx.font = 'bold 8px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('SECURITY HUB', x + 85, y + 56)
        break
      }
      case 'n8n_factory': {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.26)'
        ctx.beginPath()
        ctx.ellipse(x + 90, y + 118, 72, 12, 0, 0, Math.PI * 2)
        ctx.fill()

        // Base shell
        ctx.fillStyle = '#1a1f2e'
        ctx.fillRect(x + 15, y + 47, 150, 68)
        ctx.fillStyle = 'rgba(255,255,255,0.06)'
        ctx.fillRect(x + 17, y + 49, 146, 3)

        // Roof
        ctx.fillStyle = '#0b1220'
        ctx.fillRect(x + 10, y + 35, 160, 15)

        // Neon strip (orange)
        ctx.fillStyle = '#f97316'
        ctx.fillRect(x + 15, y + 64, 150, 2)
        ctx.fillStyle = 'rgba(249,115,22,0.25)'
        ctx.fillRect(x + 15, y + 66, 150, 2)

        // Door
        ctx.fillStyle = '#0b1220'
        ctx.fillRect(x + 78, y + 78, 24, 37)
        ctx.fillStyle = '#22c55e'
        ctx.fillRect(x + 98, y + 95, 2, 2)

        // Conveyor belt
        ctx.fillStyle = '#374151'
        ctx.fillRect(x + 22, y + 108, 50, 6)
        ctx.fillStyle = 'rgba(249,115,22,0.3)'
        ctx.fillRect(x + 22, y + 106, 50, 2)

        // Sign
        ctx.fillStyle = 'rgba(0,0,0,0.72)'
        ctx.fillRect(x + 33, y + 12, 114, 14)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 8px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('N8N FACTORY', x + 90, y + 22)
        break
      }
      case 'code_farm': {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.26)'
        ctx.beginPath()
        ctx.ellipse(x + 95, y + 118, 74, 12, 0, 0, Math.PI * 2)
        ctx.fill()

        // Field
        ctx.fillStyle = '#3b2a1a'
        ctx.fillRect(x + 10, y + 70, 78, 44)
        ctx.fillStyle = '#22c55e'
        for (let i = 0; i < 6; i++) {
          ctx.fillRect(x + 16 + i * 10, y + 96, 2, 3)
        }

        // Barn
        ctx.fillStyle = '#7c2d12'
        ctx.fillRect(x + 93, y + 47, 95, 66)
        ctx.fillStyle = '#111827'
        ctx.fillRect(x + 88, y + 35, 105, 15)

        // Door
        ctx.fillStyle = '#0b1220'
        ctx.fillRect(x + 130, y + 70, 33, 43)
        ctx.fillStyle = '#fcd34d'
        ctx.fillRect(x + 159, y + 90, 2, 2)

        // Sign
        ctx.fillStyle = 'rgba(0,0,0,0.70)'
        ctx.fillRect(x + 102, y + 14, 90, 14)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 8px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('CODE FARM', x + 147, y + 23)
        break
      }
      case 'university': {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.26)'
        ctx.beginPath()
        ctx.ellipse(x + 98, y + 115, 76, 12, 0, 0, Math.PI * 2)
        ctx.fill()

        // Main body
        ctx.fillStyle = '#e5e7eb'
        ctx.fillRect(x + 14, y + 42, 168, 69)

        // Roof band
        ctx.fillStyle = '#111827'
        ctx.fillRect(x + 7, y + 27, 180, 17)

        // Columns
        ctx.fillStyle = '#cbd5e1'
        for (let i = 0; i < 5; i++) {
          ctx.fillRect(x + 26 + i * 30, y + 49, 7, 54)
        }

        // Door
        ctx.fillStyle = '#6b4a2b'
        ctx.fillRect(x + 92, y + 78, 22, 33)
        ctx.fillStyle = '#fcd34d'
        ctx.fillRect(x + 110, y + 95, 2, 2)

        // Sign
        ctx.fillStyle = 'rgba(0,0,0,0.70)'
        ctx.fillRect(x + 44, y + 14, 108, 14)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 8px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('AI UNIVERSITY', x + 98, y + 23)
        break
      }
      case 'design_atelier': {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.24)'
        ctx.beginPath()
        ctx.ellipse(x + 81, y + 110, 64, 10, 0, 0, Math.PI * 2)
        ctx.fill()

        // Main structure (white)
        ctx.fillStyle = '#f8fafc'
        ctx.fillRect(x + 12, y + 38, 138, 68)

        // Top colored band
        ctx.fillStyle = '#ec4899'
        ctx.fillRect(x + 12, y + 35, 45, 3)
        ctx.fillStyle = '#8b5cf6'
        ctx.fillRect(x + 57, y + 35, 45, 3)
        ctx.fillStyle = '#3b82f6'
        ctx.fillRect(x + 102, y + 35, 48, 3)

        // Glass front
        ctx.fillStyle = 'rgba(148, 163, 184, 0.3)'
        ctx.fillRect(x + 18, y + 45, 75, 45)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.beginPath()
        ctx.moveTo(x + 18, y + 90)
        ctx.lineTo(x + 45, y + 45)
        ctx.lineTo(x + 60, y + 45)
        ctx.lineTo(x + 33, y + 90)
        ctx.fill()

        // Door
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)'
        ctx.fillRect(x + 105, y + 60, 27, 46)
        ctx.strokeStyle = '#94a3b8'
        ctx.lineWidth = 2
        ctx.strokeRect(x + 105, y + 60, 27, 46)

        // Sign
        ctx.fillStyle = '#1e293b'
        ctx.font = 'bold 8px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('DESIGN ATELIER', x + 81, y + 27)
        break
      }
      case 'research_lab': {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.26)'
        ctx.beginPath()
        ctx.ellipse(x + 92, y + 114, 70, 12, 0, 0, Math.PI * 2)
        ctx.fill()

        // Base shell
        ctx.fillStyle = '#0b1220'
        ctx.fillRect(x + 9, y + 38, 165, 69)
        ctx.fillStyle = 'rgba(255,255,255,0.06)'
        ctx.fillRect(x + 11, y + 40, 161, 3)

        // Neon band (green)
        ctx.fillStyle = '#10b981'
        ctx.fillRect(x + 9, y + 59, 165, 2)
        ctx.fillStyle = 'rgba(16,185,129,0.25)'
        ctx.fillRect(x + 9, y + 61, 165, 2)

        // Windows
        ctx.fillStyle = '#1f6aa8'
        for (let i = 0; i < 5; i++) {
          ctx.fillRect(x + 15 + i * 28, y + 45, 10, 8)
        }

        // Door
        ctx.fillStyle = '#111827'
        ctx.fillRect(x + 81, y + 73, 21, 34)
        ctx.fillStyle = '#22c55e'
        ctx.fillRect(x + 99, y + 89, 2, 2)

        // Sign
        ctx.fillStyle = 'rgba(0,0,0,0.70)'
        ctx.fillRect(x + 44, y + 12, 96, 14)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 8px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('AI LABOR', x + 92, y + 21)
        break
      }
    }
  }, [type, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

// Animated counter component
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          let start = 0
          const duration = 2000
          const increment = target / (duration / 16)
          const timer = setInterval(() => {
            start += increment
            if (start >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, 16)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count}{suffix}</span>
}

// City Building Animation
function CityGrowth() {
  const [level, setLevel] = useState(1)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setLevel(prev => prev >= 5 ? 1 : prev + 1)
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  const buildings = [
    { height: 'h-8', delay: '0ms', show: level >= 1 },
    { height: 'h-12', delay: '100ms', show: level >= 2 },
    { height: 'h-16', delay: '200ms', show: level >= 3 },
    { height: 'h-20', delay: '300ms', show: level >= 4 },
    { height: 'h-24', delay: '400ms', show: level >= 5 },
  ]

  return (
    <div className="flex items-end justify-center gap-1 h-28">
      {buildings.map((b, i) => (
        <div
          key={i}
          className={`w-6 rounded-t-sm bg-linear-to-t from-emerald-600 to-emerald-400 transition-all duration-500 ${b.show ? b.height : 'h-0'}`}
          style={{ transitionDelay: b.delay }}
        />
      ))}
    </div>
  )
}

// Agent Quote Component
function AgentQuote({ agent, quote, icon: Icon }: { agent: string; quote: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="relative">
      <div className="absolute -top-3 left-4 w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center z-10">
        <Icon className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="pt-4 pl-14 pr-4 pb-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="text-xs text-emerald-400 font-medium mb-1">{agent} says:</div>
        <p className="text-sm text-white/80 italic">&ldquo;{quote}&rdquo;</p>
      </div>
    </div>
  )
}

// n8n Workflow Animation
function WorkflowAnimation() {
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <div className="flex items-center gap-1">
        <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
          <Workflow className="w-4 h-4 text-orange-400" />
        </div>
        <div className="h-0.5 w-6 bg-linear-to-r from-orange-400 to-emerald-400 animate-pulse" />
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <Bot className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="h-0.5 w-6 bg-linear-to-r from-emerald-400 to-cyan-400 animate-pulse" />
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
          <Zap className="w-4 h-4 text-cyan-400" />
        </div>
      </div>
    </div>
  )
}

// Character Stats Type
type CharacterStatsV1 = {
  version: 1
  level: number
  xp: number
}

const createInitialStats = (): CharacterStatsV1 => ({
  version: 1,
  level: 1,
  xp: 0,
})

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Character Creation States
  const [agentName, setAgentName] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<CharacterPreset | null>(null)
  const [customDescription, setCustomDescription] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [phase, setPhase] = useState<'character' | 'sprite'>('character')
  const [progress, setProgress] = useState(0)
  const [creationError, setCreationError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const trimmedAgentName = agentName.trim()

  const storeAndEnterWorld = useCallback((characterName: string, agent: string, spriteSheet?: string) => {
    if (spriteSheet) {
      sessionStorage.setItem('agentmind_sprite', spriteSheet)
    } else {
      sessionStorage.removeItem('agentmind_sprite')
    }
    sessionStorage.setItem('agentmind_character_name', characterName.slice(0, 30))
    sessionStorage.setItem('agentmind_agent_name', agent.trim().slice(0, 30))
    sessionStorage.setItem('agentmind_character_stats_v1', JSON.stringify(createInitialStats()))
    router.push('/world')
  }, [router])

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true)
    setCreationError(null)
    setPhase('character')
    setProgress(10)

    let progressInterval: number | null = null
    try {
      progressInterval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev < 40) return prev + 5
          if (prev < 80) {
            setPhase('sprite')
            return prev + 3
          }
          return prev
        })
      }, 1500)

      const result = await generateCharacterAndSpriteAction(prompt)

      if (!result.success || !result.spriteSheet) {
        throw new Error(result.error || 'Generation failed')
      }

      setProgress(100)
      storeAndEnterWorld(prompt, trimmedAgentName || 'Character', result.spriteSheet)
    } catch (err) {
      console.error('Generation error:', err)
      setCreationError(err instanceof Error ? err.message : 'Generation failed')
      setIsGenerating(false)
    } finally {
      if (progressInterval) window.clearInterval(progressInterval)
    }
  }

  const handleQuickStart = () => {
    const agent = trimmedAgentName || 'Character'
    const character = selectedPreset?.name || agent
    storeAndEnterWorld(character, agent)
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0a0f0d]">
      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-up-slow {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .text-glow {
          text-shadow: 0 0 30px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.3);
        }
        .card-glow {
          box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2), 0 25px 50px -12px rgba(0,0,0,0.8);
        }
        .grid-bg {
          background-image:
            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .retro-font {
          font-family: 'Space Grotesk', system-ui, sans-serif;
          letter-spacing: -0.02em;
        }
        .mono-font {
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>

      {/* Background Grid */}
      <div className="fixed inset-0 grid-bg" />
      
      {/* Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Floating Sprite Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[8%] left-[3%] animate-[float_6s_ease-in-out_infinite] opacity-40 drop-shadow-lg">
          <SingleSpriteFrame src={AGENT_SPRITES.grace} alt="Grace" size={48} />
        </div>
        <div className="absolute top-[12%] right-[5%] animate-[float_7s_ease-in-out_infinite_0.5s] opacity-40 drop-shadow-lg">
          <SingleSpriteFrame src={AGENT_SPRITES.bernie} alt="Bernie" size={48} />
        </div>
        <div className="absolute top-[55%] left-[2%] animate-[float_8s_ease-in-out_infinite_1s] opacity-30 drop-shadow-lg">
          <SingleSpriteFrame src={MOB_SPRITES.bugSlime} alt="Bug Slime" size={40} />
        </div>
        <div className="absolute bottom-[25%] right-[3%] animate-[float_5s_ease-in-out_infinite_0.3s] opacity-40 drop-shadow-lg">
          <SingleSpriteFrame src={AGENT_SPRITES.otto} alt="Otto" size={48} />
        </div>
        <div className="absolute top-[40%] right-[8%] animate-[float_9s_ease-in-out_infinite_1.5s] opacity-25 drop-shadow-lg">
          <SingleSpriteFrame src={MOB_SPRITES.syntaxDragon} alt="Syntax Dragon" size={40} />
        </div>
        <div className="absolute bottom-[40%] left-[6%] animate-[float_7s_ease-in-out_infinite_2s] opacity-35 drop-shadow-lg">
          <SingleSpriteFrame src={AGENT_SPRITES.shield} alt="Shield" size={44} />
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6">

        {/* Header */}
        <header
          className="flex items-center justify-between"
          style={{
            animation: mounted ? 'fade-up 0.6s ease-out forwards' : 'none',
            opacity: 0,
          }}
        >
          <Link href="/" className="group flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="codequest.city Logo" 
              width={64} 
              height={64} 
              className="rounded-xl shadow-lg shadow-emerald-500/30"
            />
            <div className="retro-font">
              <span className="text-xl font-bold text-white tracking-tight">
                codequest<span className="text-emerald-400">.city</span>
              </span>
              <div className="text-[10px] text-emerald-400/70 uppercase tracking-[0.2em]">Coding Education City</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-white/70 hover:text-white hover:bg-white/10 retro-font"
            >
              <Link href="/world">
                <Play className="size-4" />
                Demo
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-white/70 hover:text-white hover:bg-white/10 retro-font"
            >
              <a href="#blog">
                <Newspaper className="size-4" />
                Blog
              </a>
            </Button>
            <Button
              asChild
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 border-0 shadow-lg shadow-emerald-500/30 retro-font font-semibold animate-[pulse-glow_3s_ease-in-out_infinite]"
            >
              <a href="#create-character">
                Create Hero
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative mt-16 md:mt-20 lg:mt-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Hero Logo */}
              <div
                className="mb-8 flex justify-center lg:justify-start"
                style={{
                  animation: mounted ? 'fade-up 0.6s ease-out forwards' : 'none',
                  opacity: 0,
                }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/30 rounded-3xl blur-2xl animate-pulse" />
                  <Image 
                    src="/logo.png" 
                    alt="codequest.city Logo" 
                    width={200} 
                    height={200} 
                    className="relative rounded-3xl shadow-2xl shadow-emerald-500/40"
                    priority
                  />
                </div>
              </div>

              {/* Main Headline */}
              <h1
                className="retro-font text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold text-white leading-[1.05] tracking-tight"
                style={{
                  animation: mounted ? 'fade-up 0.7s ease-out 0.2s forwards' : 'none',
                  opacity: 0,
                }}
              >
                Learn
                <span
                  className="bg-linear-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent bg-size-[200%_auto] text-glow"
                  style={{ animation: 'gradient-shift 4s ease infinite' }}
                >
                  {' '}Agentic AI{' '}
                </span>
                <br />
                by Playing
              </h1>

              {/* Tagline */}
              <p
                className="mt-6 text-lg sm:text-xl text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed retro-font"
                style={{
                  animation: mounted ? 'fade-up 0.7s ease-out 0.3s forwards' : 'none',
                  opacity: 0,
                }}
              >
                Build fundamentals. Control your agents. Grow with the city.
              </p>

              {/* Sub-description */}
              <p
                className="mt-4 text-base text-white/50 max-w-xl mx-auto lg:mx-0 leading-relaxed retro-font"
                style={{
                  animation: mounted ? 'fade-up 0.7s ease-out 0.35s forwards' : 'none',
                  opacity: 0,
                }}
              >
                An education-first RPG city where you learn core programming and AI fundamentals 
                by interacting with AI agents, solving challenges, and controlling your own agents.
              </p>

              {/* CTA Buttons */}
              <div
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                style={{
                  animation: mounted ? 'fade-up 0.7s ease-out 0.4s forwards' : 'none',
                  opacity: 0,
                }}
              >
                <Button
                  asChild
                  size="lg"
                  className="group relative rounded-2xl text-lg px-10 py-7 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-2xl shadow-emerald-500/30 border-0 font-bold overflow-hidden retro-font"
                >
                  <a href="#create-character">
                    <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <User className="size-5" />
                    Create Character
                    <ChevronRight className="size-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-2xl text-lg px-8 py-7 border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold backdrop-blur-sm retro-font"
                >
                  <Link href="/world">
                    <Gamepad2 className="size-5 text-emerald-400" />
                    Explore Demo
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Side - City Growth */}
            <div
              className="relative"
              style={{
                animation: mounted ? 'fade-up-slow 0.8s ease-out 0.4s forwards' : 'none',
                opacity: 0,
              }}
            >
              <div className="absolute -inset-8 rounded-[40px] bg-linear-to-br from-emerald-500/20 to-cyan-500/10 blur-3xl" />
              <div className="relative rounded-3xl border border-emerald-500/20 bg-black/60 backdrop-blur-xl overflow-hidden card-glow">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/40">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-emerald-400" />
                    <span className="text-sm text-white/80 retro-font">Your City Grows</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="size-3 text-emerald-400" />
                    <span className="text-xs text-emerald-400 mono-font">Level 5</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="rounded-xl bg-black/40 border border-white/10 p-6 mb-4">
                    <CityGrowth />
                    <div className="text-center mt-4">
                      <p className="text-xs text-white/50 retro-font">Every Quest = New Building</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Quests', value: '12', icon: Target },
                      { label: 'Agents', value: '6', icon: Bot },
                      { label: 'XP', value: '2.4k', icon: Sparkles },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                        <stat.icon className="size-4 text-emerald-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white retro-font">{stat.value}</div>
                        <div className="text-[10px] text-white/50">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <AgentQuote 
                    agent="Grace"
                    quote="Welcome back! Your next quest is waiting in the Security Hub."
                    icon={ScrollText}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="mt-32 md:mt-40">
          <div
            className="text-center mb-12"
            style={{
              animation: mounted ? 'fade-up 0.7s ease-out 0.5s forwards' : 'none',
              opacity: 0,
            }}
          >
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-red-500/30 bg-red-500/10 backdrop-blur-sm mb-4">
              <X className="size-4 text-red-400" />
              <span className="text-sm font-medium text-red-300 retro-font">The Problem</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white retro-font mb-4">
              AI Evolves Faster<br />Than We Learn
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto retro-font text-lg">
              Information is everywhere, but learning is passive.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: BookOpen,
                title: 'Passive Learning',
                desc: 'Vibe Coders build AI-powered software without the fundamentals to create secure, stable, and reliable systems.',
              },
              {
                icon: Code2,
                title: 'Faking Skills',
                desc: 'Many programmers rely on AI tools without understanding why things work or break.',
              },
              {
                icon: Rocket,
                title: 'Rapid Change',
                desc: 'What\'s new today is outdated tomorrow. Continuous education is essential.',
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="group relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-6 hover:border-red-500/30 transition-all duration-300"
                style={{
                  animation: mounted ? `scale-in 0.6s ease-out ${0.6 + i * 0.1}s forwards` : 'none',
                  opacity: 0,
                }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                  <item.icon className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 retro-font">{item.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed retro-font">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The Solution Section */}
        <section className="mt-32 md:mt-40">
          <div
            className="text-center mb-12"
            style={{
              animation: mounted ? 'fade-up 0.7s ease-out 0.7s forwards' : 'none',
              opacity: 0,
            }}
          >
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm mb-4">
              <Check className="size-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300 retro-font">The Solution</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white retro-font mb-4">
              Active Learning<br />Through Quests
            </h2>
            <p className="text-white/50 max-w-3xl mx-auto retro-font text-lg">
              codequest.city is an education-first RPG city that turns passive AI learning into active quests.
              The city grows with you and keeps you on track in a fast-changing AI world.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Swords,
                title: 'Learn by Doing',
                desc: 'Hands-on quests instead of passive video courses. Write real code to solve challenges.',
              },
              {
                icon: Bot,
                title: 'Control Your Agents',
                desc: 'Talk to, manage, and control AI agents directly. Learn by interacting with them.',
              },
              {
                icon: Building2,
                title: 'City Grows With You',
                desc: 'Visual, gamified city that expands as you progress. See your learning come to life.',
              },
              {
                icon: Shield,
                title: 'Real Fundamentals',
                desc: 'Learn the core skills needed to build secure, stable, and reliable AI systems.',
              },
              {
                icon: Workflow,
                title: 'Workflow Automation',
                desc: 'Master n8n and agent orchestration. Build real-world automation pipelines.',
              },
              {
                icon: TrendingUp,
                title: 'Stay Current',
                desc: 'AI agents bring you the latest news and updates. Never fall behind.',
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="group relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-6 hover:border-emerald-500/30 transition-all duration-300"
                style={{
                  animation: mounted ? `scale-in 0.6s ease-out ${0.8 + i * 0.08}s forwards` : 'none',
                  opacity: 0,
                }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 retro-font">{item.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed retro-font">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* City Districts Section */}
        <section className="mt-32 md:mt-40">
          <div
            className="text-center mb-12"
            style={{
              animation: mounted ? 'fade-up 0.7s ease-out 0.9s forwards' : 'none',
              opacity: 0,
            }}
          >
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm mb-4">
              <Map className="size-4 text-cyan-300" />
              <span className="text-sm font-medium text-cyan-300 retro-font">City Districts</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white retro-font mb-4">
              Explore the City
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto retro-font text-lg">
              Each district specializes in different skills. Visit buildings, meet agents, and complete quests.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                name: 'Security Hub', 
                buildingType: 'security_hub',
                agent: AGENT_SPRITES.shield,
                agentName: 'Shield',
                desc: 'Learn secure coding practices, authentication patterns, and vulnerability prevention.',
                skills: ['Input Validation', 'Auth Patterns', 'API Security'],
              },
              { 
                name: 'Automation Factory', 
                buildingType: 'n8n_factory',
                agent: AGENT_SPRITES.otto,
                agentName: 'Otto',
                desc: 'Master n8n workflows, agent orchestration, and automation pipelines.',
                skills: ['n8n Workflows', 'Agent Orchestration', 'Data Pipelines'],
              },
              { 
                name: 'Code Farm', 
                buildingType: 'code_farm',
                agent: AGENT_SPRITES.grace,
                agentName: 'Grace',
                desc: 'Practice clean code, testing, and error handling. Grow your skills.',
                skills: ['Clean Code', 'Testing', 'Error Handling'],
              },
              { 
                name: 'AI University', 
                buildingType: 'university',
                agent: AGENT_SPRITES.bernie,
                agentName: 'Bernie',
                desc: 'Stay updated on the latest AI developments and industry trends.',
                skills: ['AI News', 'Tool Updates', 'Tech Trends'],
              },
              { 
                name: 'Design Atelier', 
                buildingType: 'design_atelier',
                agent: AGENT_SPRITES.pixel,
                agentName: 'Pixel',
                desc: 'Learn UI/UX principles, design systems, and accessibility.',
                skills: ['UI/UX', 'Design Systems', 'Accessibility'],
              },
              { 
                name: 'Research Lab', 
                buildingType: 'research_lab',
                agent: AGENT_SPRITES.sandy,
                agentName: 'Sandy',
                desc: 'Understand AI research papers and cutting-edge technology.',
                skills: ['AI Research', 'Model Architectures', 'Tech Papers'],
              },
            ].map((district, i) => (
              <div
                key={district.name}
                className="group rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden hover:border-emerald-500/30 hover:bg-black/50 transition-all"
                style={{
                  animation: mounted ? `fade-up 0.5s ease-out ${1 + i * 0.08}s forwards` : 'none',
                  opacity: 0,
                }}
              >
                {/* Building Canvas */}
                <div className="relative h-32 bg-black/60 border-b border-white/10 overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent z-10" />
                  <BuildingCanvas type={district.buildingType} width={200} height={140} />
                  {/* Agent sprite overlay */}
                  <div className="absolute bottom-2 right-2 z-20">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-md" />
                      <div className="relative drop-shadow-lg">
                        <SingleSpriteFrame src={district.agent} alt={district.agentName} size={40} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-white retro-font text-lg">{district.name}</div>
                    <span className="text-xs text-emerald-400 retro-font">{district.agentName}</span>
                  </div>
                  
                  <p className="text-sm text-white/60 mb-4 retro-font leading-relaxed">{district.desc}</p>

                  <div className="flex flex-wrap gap-2">
                    {district.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 retro-font"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Meet Your Agents Section */}
        <section className="mt-32 md:mt-40">
          <div
            className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 md:p-12 overflow-hidden relative"
            style={{
              animation: mounted ? 'fade-up-slow 0.8s ease-out 1.1s forwards' : 'none',
              opacity: 0,
            }}
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-[100px]" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <Bot className="size-6 text-emerald-400" />
                <h2 className="text-2xl font-bold text-white retro-font">Your AI Agents</h2>
              </div>
              <p className="text-white/50 mb-8 max-w-xl retro-font">
                Control, talk to, and manage AI agents directly. Each agent has unique expertise.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Bernie', role: 'News Agent', sprite: AGENT_SPRITES.bernie, desc: 'Latest AI and tech news' },
                  { name: 'Otto', role: 'Automation Master', sprite: AGENT_SPRITES.otto, desc: 'n8n and workflow automation' },
                  { name: 'Shield', role: 'Security Expert', sprite: AGENT_SPRITES.shield, desc: 'Secure coding practices' },
                  { name: 'Grace', role: 'Quest Master', sprite: AGENT_SPRITES.grace, desc: 'Daily quests and guidance' },
                  { name: 'Pixel', role: 'Design Guide', sprite: AGENT_SPRITES.pixel, desc: 'UI/UX and design systems' },
                  { name: 'Sandy', role: 'Research Agent', sprite: AGENT_SPRITES.sandy, desc: 'AI research explained' },
                ].map((agent) => (
                  <div
                    key={agent.name}
                    className="group flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-white/10 transition-all"
                  >
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-500/30 transition-colors" />
                      <div className="relative drop-shadow-lg">
                        <SingleSpriteFrame src={agent.sprite} alt={agent.name} size={80} />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-white retro-font text-lg">{agent.name}</div>
                      <div className="text-sm text-emerald-400 retro-font">{agent.role}</div>
                      <div className="text-xs text-white/50 mt-1 retro-font">{agent.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Meet the Mobs Section */}
        <section className="mt-32 md:mt-40">
          <div
            className="text-center mb-12"
            style={{
              animation: mounted ? 'fade-up 0.7s ease-out 1.15s forwards' : 'none',
              opacity: 0,
            }}
          >
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-red-500/30 bg-red-500/10 backdrop-blur-sm mb-4">
              <Swords className="size-4 text-red-400" />
              <span className="text-sm font-medium text-red-300 retro-font">Battle Challenges</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white retro-font mb-4">
              Defeat Code Mobs
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto retro-font text-lg">
              Fight programming challenges as monsters. Solve coding puzzles to defeat them and earn XP.
            </p>
          </div>

          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
            style={{
              animation: mounted ? 'fade-up 0.7s ease-out 1.2s forwards' : 'none',
              opacity: 0,
            }}
          >
            {[
              { name: 'Bug Slime', sprite: MOB_SPRITES.bugSlime, challenge: 'Debugging' },
              { name: 'Syntax Dragon', sprite: MOB_SPRITES.syntaxDragon, challenge: 'Syntax Errors' },
              { name: 'Loop Wolf', sprite: MOB_SPRITES.loopWolf, challenge: 'Loop Logic' },
              { name: 'Regex Bat', sprite: MOB_SPRITES.regexBat, challenge: 'Regex Patterns' },
              { name: 'Array Spider', sprite: MOB_SPRITES.arraySpider, challenge: 'Array Methods' },
              { name: 'Binary Ghost', sprite: MOB_SPRITES.binaryGhost, challenge: 'Binary Operations' },
            ].map((mob) => (
              <div
                key={mob.name}
                className="group flex flex-col items-center p-4 rounded-xl bg-black/40 border border-white/10 hover:border-red-500/30 hover:bg-black/60 transition-all"
              >
                <div className="relative mb-3">
                  <div className="absolute inset-0 bg-red-500/10 rounded-full blur-lg group-hover:bg-red-500/20 transition-colors" />
                  <div className="relative drop-shadow-lg">
                    <SingleSpriteFrame src={mob.sprite} alt={mob.name} size={56} />
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-white retro-font text-sm">{mob.name}</div>
                  <div className="text-[10px] text-red-400 retro-font">{mob.challenge}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* n8n Integration Section */}
        <section className="mt-32 md:mt-40">
          <div
            className="rounded-3xl border border-orange-500/20 bg-black/40 backdrop-blur-xl p-8 md:p-12 overflow-hidden relative"
            style={{
              animation: mounted ? 'fade-up-slow 0.8s ease-out 1.2s forwards' : 'none',
              opacity: 0,
            }}
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px]" />
            
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm mb-4">
                  <Workflow className="size-4 text-orange-300" />
                  <span className="text-sm font-medium text-orange-300 retro-font">n8n Integration</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white retro-font mb-4">
                  Connect Your<br />Workflows
                </h2>
                <p className="text-white/60 mb-6 retro-font">
                  Learn to build powerful automations with <span className="text-orange-400">n8n</span>. 
                  Otto shows you how to connect AI agents with workflows and automate complex tasks.
                </p>
                
                <div className="space-y-3">
                  {[
                    'AI Agent Orchestration',
                    'API Integrations',
                    'Automated Data Pipelines',
                    'Custom Workflow Triggers',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-orange-400" />
                      </div>
                      <span className="text-white/80 retro-font">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
                <div className="text-xs text-white/50 mb-4 mono-font">workflow.json</div>
                <div className="space-y-4">
                  <WorkflowAnimation />
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <pre className="text-xs text-orange-400 mono-font overflow-x-auto">
{`{
  "nodes": [
    { "type": "n8n-nodes.webhook" },
    { "type": "n8n-nodes.agent" },
    { "type": "n8n-nodes.action" }
  ],
  "connections": { ... }
}`}
                    </pre>
                  </div>
                  <AgentQuote 
                    agent="Otto"
                    quote="This workflow connects your agent to the API. Want me to show you how?"
                    icon={Workflow}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Your Journey Section */}
        <section className="mt-32 md:mt-40">
          <div
            className="rounded-3xl border border-emerald-500/20 bg-black/40 backdrop-blur-xl p-8 md:p-12 overflow-hidden relative"
            style={{
              animation: mounted ? 'fade-up-slow 0.8s ease-out 1.3s forwards' : 'none',
              opacity: 0,
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
            
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white retro-font mb-4">
                Your Journey Starts Here
              </h2>
              <p className="text-white/50 retro-font">The city grows with you. Every step builds your skills.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: '01', title: 'Enter the City', desc: 'Create your character and enter the world' },
                { step: '02', title: 'Meet Your Agents', desc: 'Get to know your AI mentors' },
                { step: '03', title: 'Complete Quests', desc: 'Write code, defeat mobs, learn fundamentals' },
                { step: '04', title: 'Grow Your City', desc: 'Watch your city expand with your progress' },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white retro-font">
                    {item.step}
                  </div>
                  <div className="pt-6 pl-6 pr-4 pb-4 rounded-2xl bg-white/5 border border-white/10 h-full">
                    <h3 className="font-bold text-white mb-2 retro-font">{item.title}</h3>
                    <p className="text-sm text-white/55 retro-font">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Character Creation Section */}
        <section className="mt-32 md:mt-40" id="create-character">
          <div
            className="rounded-3xl border border-cyan-500/20 bg-black/40 backdrop-blur-xl p-8 md:p-12 overflow-hidden relative"
            style={{
              animation: mounted ? 'fade-up-slow 0.8s ease-out 1.35s forwards' : 'none',
              opacity: 0,
            }}
          >
            <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-[100px]" />

            <div className="relative">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm mb-4">
                  <User className="size-4 text-cyan-300" />
                  <span className="text-sm font-medium text-cyan-300 retro-font">Your Hero</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white retro-font mb-4">
                  Create Your Character
                </h2>
                <p className="text-white/50 max-w-2xl mx-auto retro-font text-lg">
                  Choose a template or describe your own hero. The AI creates a unique pixel avatar for you.
                </p>
              </div>

              {/* Name Input */}
              <div className="max-w-md mx-auto mb-8">
                <label className="text-sm font-semibold text-white/90 block mb-2 retro-font">What's your hero's name?</label>
                <Input
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Max, Luna, Alex..."
                  maxLength={30}
                  disabled={isGenerating}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/20 text-center"
                />
              </div>

              {/* Toggle Presets / Custom */}
              <div className="flex justify-center gap-4 mb-8">
                <Button
                  variant={!showCustom ? 'default' : 'outline'}
                  onClick={() => setShowCustom(false)}
                  disabled={isGenerating}
                  className={!showCustom ? 'bg-emerald-500 hover:bg-emerald-400' : 'app-glass text-white/90 hover:bg-white/10'}
                >
                  <span className="mr-2">🎭</span> Templates
                </Button>
                <Button
                  variant={showCustom ? 'default' : 'outline'}
                  onClick={() => setShowCustom(true)}
                  disabled={isGenerating}
                  className={showCustom ? 'bg-emerald-500 hover:bg-emerald-400' : 'app-glass text-white/90 hover:bg-white/10'}
                >
                  <span className="mr-2">✏️</span> Custom Description
                </Button>
              </div>

              {/* Presets Grid */}
              {!showCustom && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                  {CHARACTER_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => !isGenerating && setSelectedPreset(preset)}
                      className={`
                        cursor-pointer transition-all rounded-xl p-4 text-center
                        ${selectedPreset?.id === preset.id 
                          ? 'bg-emerald-500/20 border-2 border-emerald-400 scale-105' 
                          : 'bg-white/5 border border-white/10 hover:border-white/30 hover:scale-105'
                        }
                        ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <div className="text-4xl mb-2">{preset.emoji}</div>
                      <h3 className="font-semibold text-white/90 text-sm retro-font">{preset.name}</h3>
                      <p className="text-[10px] text-white/50 mt-1 line-clamp-2 retro-font">{preset.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Description */}
              {showCustom && (
                <div className="max-w-2xl mx-auto mb-8">
                  <label className="text-sm font-semibold text-white/90 block mb-2 retro-font">
                    Describe your hero
                  </label>
                  <Textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="e.g. A brave knight with a blue cape and a glowing sword..."
                    rows={4}
                    disabled={isGenerating}
                    className="resize-none bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/20"
                  />
                </div>
              )}

              {/* Error Message */}
              {creationError && (
                <div className="max-w-2xl mx-auto mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-white/85">
                  <div className="font-semibold text-red-400">Error</div>
                  <div className="mt-1 text-white/75">{creationError}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 app-glass text-white/90 hover:bg-white/10"
                    onClick={() => setCreationError(null)}
                  >
                    Try again
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => {
                    if (showCustom && customDescription.trim()) {
                      handleGenerate(customDescription)
                    } else if (selectedPreset) {
                      handleGenerate(selectedPreset.prompt)
                    }
                  }}
                  disabled={isGenerating || (!showCustom && !selectedPreset) || (showCustom && !customDescription.trim())}
                  className="rounded-2xl bg-linear-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 font-bold retro-font shadow-lg shadow-cyan-500/20"
                >
                  <Wand2 className="size-5" />
                  {isGenerating ? 'Creating Avatar...' : 'Create Avatar & Start'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleQuickStart}
                  disabled={isGenerating}
                  className="rounded-2xl app-glass text-white/90 hover:bg-white/10 retro-font"
                >
                  <ArrowRight className="size-5" />
                  Quick Start
                </Button>
              </div>

              {/* Info Text */}
              <p className="text-center text-xs text-white/40 mt-6 retro-font">
                Avatar creation takes a moment. You can also start without a custom character.
              </p>
            </div>
          </div>
        </section>

        {/* Generating Overlay */}
        {isGenerating && (
          <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            <div className="rounded-3xl p-8 max-w-sm mx-4 text-center bg-gradient-to-b from-gray-900/80 to-black/80 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-cyan-500 rounded-full animate-spin border-t-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {phase === 'character' ? (
                    <Palette className="size-7 text-white/90" />
                  ) : (
                    <Sparkles className="size-7 text-white/90" />
                  )}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white/95 mb-2 retro-font">
                {phase === 'character' ? 'Creating Character...' : 'Creating Pixel Avatar...'}
              </h3>
              <p className="text-sm text-white/70 mb-6 retro-font">
                {phase === 'character' 
                  ? 'The AI is browsing the hero wardrobe.' 
                  : 'Your unique character is being pixelated.'}
              </p>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-white/60 mt-4 retro-font">
                Please wait a moment...
              </p>
            </div>
          </div>
        )}

        {/* Blog Section */}
        <section className="mt-32 md:mt-40" id="blog">
          <div
            className="text-center mb-12"
            style={{
              animation: mounted ? 'fade-up 0.7s ease-out 1.4s forwards' : 'none',
              opacity: 0,
            }}
          >
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm mb-4">
              <Newspaper className="size-4 text-emerald-300" />
              <span className="text-sm font-medium text-emerald-300 retro-font">Blog</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white retro-font mb-4">
              News & Tutorials
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto retro-font text-lg">
              Stay up to date with the latest updates, tutorials, and insights into the world of AI and coding.
            </p>
          </div>

          <div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            style={{
              animation: mounted ? 'fade-up 0.7s ease-out 1.45s forwards' : 'none',
              opacity: 0,
            }}
          >
            {[
              {
                slug: 'how-ai-agents-are-changing-the-future-of-coding',
                title: 'How AI Agents Are Changing the Future of Coding',
                excerpt: 'A deep dive into the world of autonomous AI agents and how they make developers more productive.',
                category: 'AI Agents',
                date: 'Jan 28, 2026',
                readTime: '5 min',
                icon: Bot,
                gradient: 'from-emerald-500/20 to-emerald-600/20',
                featured: true,
              },
              {
                slug: 'n8n-workflow-automation-for-beginners',
                title: 'n8n Workflow Automation for Beginners',
                excerpt: 'Your first step into the world of workflow automation with n8n. Simply explained.',
                category: 'Tutorial',
                date: 'Jan 25, 2026',
                readTime: '8 min',
                icon: Workflow,
                gradient: 'from-emerald-600/20 to-teal-500/20',
                featured: false,
              },
              {
                slug: 'secure-api-development-best-practices',
                title: 'Secure API Development: Best Practices',
                excerpt: 'Learn the essential security practices for modern APIs and protect your applications.',
                category: 'Security',
                date: 'Jan 22, 2026',
                readTime: '6 min',
                icon: Shield,
                gradient: 'from-teal-500/20 to-emerald-500/20',
                featured: false,
              },
              {
                slug: 'prompt-engineering-masterclass',
                title: 'Prompt Engineering Masterclass',
                excerpt: 'Master the art of prompt engineering and get the most out of LLMs.',
                category: 'AI Basics',
                date: 'Jan 19, 2026',
                readTime: '10 min',
                icon: MessageSquare,
                gradient: 'from-emerald-400/20 to-emerald-600/20',
                featured: false,
              },
              {
                slug: 'clean-code-principles-for-ai-assisted-coding',
                title: 'Clean Code Principles for AI-Assisted Coding',
                excerpt: 'Why clean code is more important than ever when AI tools help with development.',
                category: 'Best Practices',
                date: 'Jan 16, 2026',
                readTime: '7 min',
                icon: Code2,
                gradient: 'from-green-500/20 to-emerald-500/20',
                featured: false,
              },
              {
                slug: 'the-future-of-codequest-city',
                title: 'The Future of codequest.city',
                excerpt: 'A look at upcoming features: new districts, agents, and community events.',
                category: 'Updates',
                date: 'Jan 12, 2026',
                readTime: '4 min',
                icon: Rocket,
                gradient: 'from-emerald-500/20 to-cyan-500/20',
                featured: false,
              },
            ].map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article
                  className={`relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden hover:border-emerald-500/40 hover:bg-black/50 transition-all duration-300 cursor-pointer h-full ${post.featured ? 'ring-1 ring-emerald-500/20' : ''}`}
                >
                  {/* Featured Badge */}
                  {post.featured && (
                    <div className="absolute top-3 right-3 z-20">
                      <span className="px-2 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-300 retro-font flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Featured
                      </span>
                    </div>
                  )}

                  {/* Article Header with Gradient */}
                  <div className={`relative h-28 bg-linear-to-br ${post.gradient} border-b border-white/10 overflow-hidden`}>
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)] group-hover:scale-150 transition-transform duration-700" />
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 group-hover:border-emerald-500/40 transition-all duration-300 shadow-lg">
                        <post.icon className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                      </div>
                    </div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm border border-white/10 text-[10px] text-white/80 retro-font group-hover:border-emerald-500/30 transition-colors">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-white retro-font text-lg mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-white/55 retro-font leading-relaxed mb-4 line-clamp-2 group-hover:text-white/70 transition-colors">
                      {post.excerpt}
                    </p>
                    
                    {/* Meta Info & Read More */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-white/40 retro-font">
                        <span>{post.date}</span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                      
                      {/* Read More Arrow */}
                      <div className="flex items-center gap-1 text-xs text-emerald-400 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 retro-font">
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Glow Effect on Hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </article>
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <div
            className="mt-10 text-center"
            style={{
              animation: mounted ? 'fade-up 0.7s ease-out 1.5s forwards' : 'none',
              opacity: 0,
            }}
          >
            <Button
              asChild
              variant="outline"
              size="lg"
              className="group rounded-2xl border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-400/50 text-white font-semibold backdrop-blur-sm retro-font transition-all duration-300"
            >
              <Link href="/blog">
                <Newspaper className="size-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                View All Articles
                <ChevronRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Final CTA */}
        <section
          className="mt-32 md:mt-40 mb-16"
          style={{
            animation: mounted ? 'fade-up-slow 0.8s ease-out 1.55s forwards' : 'none',
            opacity: 0,
          }}
        >
          <div className="relative rounded-3xl border border-emerald-500/30 bg-linear-to-br from-emerald-950/60 to-black/60 backdrop-blur-xl p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[100px] animate-pulse" />
            </div>

            <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-emerald-400/50" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-emerald-400/50" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-emerald-400/50" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-emerald-400/50" />

            <div className="relative">
              <div className="mb-6">
                <AgentQuote 
                  agent="Grace"
                  quote="Your city is waiting, Vibe Coder. Ready to start your quest?"
                  icon={ScrollText}
                />
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 retro-font">
                Enter codequest.city
              </h2>
              <p className="text-white/60 mb-10 max-w-lg mx-auto text-lg retro-font">
                No account needed. No payment required. Just start playing and learning.
              </p>
              <Button
                asChild
                size="lg"
                className="group rounded-2xl text-lg px-12 py-8 bg-white text-emerald-900 hover:bg-emerald-50 shadow-2xl shadow-white/20 font-bold retro-font"
              >
                <a href="#create-character">
                  <User className="size-6" />
                  Create Your Hero
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 pt-16 pb-8 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <Image 
                  src="/logo.png" 
                  alt="codequest.city Logo" 
                  width={48} 
                  height={48} 
                  className="rounded-xl shadow-lg shadow-emerald-500/20"
                />
                <div className="retro-font">
                  <span className="text-lg font-bold text-white tracking-tight">
                    codequest<span className="text-emerald-400">.city</span>
                  </span>
                </div>
              </Link>
              <p className="text-sm text-white/50 mb-6 max-w-xs retro-font leading-relaxed">
                Eine Coding-Education-City für Vibe Coders. Lerne Agentic AI durch interaktive Quests und baue deine eigene Stadt.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3">
                {[
                  { icon: Github, href: 'https://github.com', label: 'GitHub' },
                  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation Columns */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 retro-font">Produkt</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Features', href: '#' },
                  { label: 'City Districts', href: '#' },
                  { label: 'AI Agents', href: '#' },
                  { label: 'Roadmap', href: '#' },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-white/50 hover:text-emerald-400 transition-colors retro-font">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4 retro-font">Ressourcen</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Blog', href: '#blog' },
                  { label: 'Tutorials', href: '#' },
                  { label: 'Dokumentation', href: '#' },
                  { label: 'API', href: '#' },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-white/50 hover:text-emerald-400 transition-colors retro-font">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4 retro-font">Legal</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Impressum', href: '#' },
                  { label: 'Datenschutz', href: '#' },
                  { label: 'AGB', href: '#' },
                  { label: 'Kontakt', href: '#' },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-white/50 hover:text-emerald-400 transition-colors retro-font">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-1 retro-font flex items-center gap-2">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  Newsletter
                </h4>
                <p className="text-sm text-white/50 retro-font">
                  Erhalte Updates zu neuen Features, Tutorials und Community-Events.
                </p>
              </div>
              <div className="flex gap-3 flex-1 max-w-md">
                <Input
                  type="email"
                  placeholder="deine@email.de"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:border-emerald-400/60 focus-visible:ring-emerald-400/20"
                />
                <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-400 font-semibold retro-font shrink-0">
                  Abonnieren
                </Button>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 border-t border-white/10">
            <div className="flex items-center gap-3 text-xs text-white/30 flex-wrap justify-center">
              <span className="retro-font">Powered by</span>
              {[
                { name: 'Google Gemini', color: 'text-blue-400' },
                { name: 'n8n', color: 'text-orange-400' },
                { name: 'Next.js', color: 'text-white/60' },
                { name: 'Vercel', color: 'text-white/60' },
              ].map((tech, i) => (
                <span key={tech.name} className="flex items-center gap-2">
                  {i > 0 && <span className="text-white/20">•</span>}
                  <span className={`px-2 py-1 rounded bg-white/5 border border-white/10 ${tech.color} mono-font`}>
                    {tech.name}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
            <p className="text-xs text-white/40 retro-font">
              © 2026 codequest.city. Alle Rechte vorbehalten.
            </p>
            <p className="text-xs text-white/40 retro-font flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> für Vibe Coders
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}
