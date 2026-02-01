'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { PresetGrid } from './preset-grid'
import { CustomForm } from './custom-form'
import type { CharacterPreset } from '@/types'

interface CharacterCreationProps {
  onGenerate: (prompt: string, agentName: string, imageRef?: string) => void
  isLoading?: boolean
}

export function CharacterCreation({ onGenerate, isLoading }: CharacterCreationProps) {
  const [selectedPreset, setSelectedPreset] = useState<CharacterPreset | null>(null)
  const [agentName, setAgentName] = useState('')

  const trimmedAgentName = agentName.trim()
  const canProceed = trimmedAgentName.length > 0

  const handlePresetSelect = (preset: CharacterPreset) => {
    setSelectedPreset(preset)
    onGenerate(preset.prompt, trimmedAgentName)
  }

  const handleCustomSubmit = (description: string, imageRef?: string) => {
    onGenerate(description, trimmedAgentName, imageRef)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6 bg-card/30 backdrop-blur rounded-xl p-6 border border-border/50">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Agent Name
          </label>
          <Input
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="e.g. Nova, Atlas, Pixel..."
            disabled={isLoading}
            maxLength={30}
            className="bg-input/50"
          />
          <p className="text-xs text-muted-foreground">
            This name will be shown in the game.
          </p>
        </div>
      </div>

      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="presets" disabled={isLoading}>
            <span className="mr-2">🎭</span>
            Presets
          </TabsTrigger>
          <TabsTrigger value="custom" disabled={isLoading}>
            <span className="mr-2">✏️</span>
            Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="mt-0">
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Choose a character type as a template
            </p>
            <PresetGrid
              onSelect={handlePresetSelect}
              selectedId={selectedPreset?.id}
              disabled={isLoading || !canProceed}
            />
            {!canProceed && (
              <p className="text-center text-xs text-muted-foreground">
                Enter an agent name first to proceed.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="mt-0">
          <div className="bg-card/30 backdrop-blur rounded-xl p-6 border border-border/50">
            <CustomForm onSubmit={handleCustomSubmit} disabled={isLoading || !canProceed} />
          </div>
          {!canProceed && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              Enter an agent name first to proceed.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { PresetGrid } from './preset-grid'
export { CustomForm } from './custom-form'
