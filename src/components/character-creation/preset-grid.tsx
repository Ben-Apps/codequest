'use client'

import { Card, CardContent } from '@/components/ui/card'
import { CHARACTER_PRESETS } from '@/lib/agents'
import type { CharacterPreset } from '@/types'
import { cn } from '@/lib/utils'

interface PresetGridProps {
  onSelect: (preset: CharacterPreset) => void
  selectedId?: string
  disabled?: boolean
}

export function PresetGrid({ onSelect, selectedId, disabled }: PresetGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {CHARACTER_PRESETS.map((preset) => (
        <Card
          key={preset.id}
          className={cn(
            'cursor-pointer transition-all hover:scale-105 hover:border-primary/50',
            'bg-white/5 backdrop-blur border-white/15',
            selectedId === preset.id && 'border-primary ring-2 ring-primary/20',
            disabled && 'opacity-50 cursor-not-allowed hover:scale-100'
          )}
          onClick={() => !disabled && onSelect(preset)}
        >
          <CardContent className="p-4 text-center space-y-2">
            <div className="text-4xl">{preset.emoji}</div>
            <h3 className="font-semibold text-white/90">{preset.name}</h3>
            <p className="text-xs text-white/60 line-clamp-2">
              {preset.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
