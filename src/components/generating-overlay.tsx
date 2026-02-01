'use client'

import { Palette, Sparkles } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface GeneratingOverlayProps {
  isOpen: boolean
  phase: 'character' | 'sprite'
  progress: number
}

export function GeneratingOverlay({ isOpen, phase, progress }: GeneratingOverlayProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="rounded-3xl p-8 max-w-sm mx-4 text-center app-glass-strong app-surface-shadow">
        {/* Animated Icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin border-t-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            {phase === 'character' ? (
              <Palette className="size-7 text-white/90" />
            ) : (
              <Sparkles className="size-7 text-white/90" />
            )}
          </div>
        </div>

        {/* Phase Text */}
        <h3 className="text-xl font-semibold text-white/95 mb-2">
          {phase === 'character' ? 'Forging Character...' : 'Pixeling Sprite Sheet...'}
        </h3>
        
        <p className="text-sm text-white/70 mb-6">
          {phase === 'character' 
            ? 'The AI is rummaging through the hero wardrobe.' 
            : 'The AI is counting 16 frames.'}
        </p>

        {/* Progress Bar */}
        <Progress value={progress} className="h-2" />
        
        <p className="text-xs text-white/60 mt-4">
          May take a moment — magic is never instant.
        </p>
      </div>
    </div>
  )
}
