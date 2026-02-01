'use client'

import { useState, useCallback, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface CustomFormProps {
  onSubmit: (description: string, imageRef?: string) => void
  disabled?: boolean
}

export function CustomForm({ onSubmit, disabled }: CustomFormProps) {
  const [description, setDescription] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (description.trim() || uploadedImage) {
      onSubmit(description, uploadedImage || undefined)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 text-center transition-all',
          isDragging ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-white/20 bg-black/20 hover:border-white/35',
          disabled && 'opacity-50 pointer-events-none'
        )}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
      >
        {uploadedImage ? (
          <div className="relative">
            <img
              src={uploadedImage}
              alt="Uploaded reference"
              className="max-h-40 mx-auto rounded-lg"
              style={{ imageRendering: 'pixelated' }}
            />
            <button
              type="button"
              onClick={() => setUploadedImage(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-sm hover:bg-destructive/80"
            >
              ×
            </button>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-2">🖼️</div>
            <p className="text-sm text-white/60">
              Upload reference image (optional)
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-emerald-300 hover:text-emerald-200 text-sm underline"
            >
              Select File
            </button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 border-t border-white/15" />
        <span className="text-sm text-white/55">and/or</span>
        <div className="flex-1 border-t border-white/15" />
      </div>

      {/* Text Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/90">
          Describe your character
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. A friendly robot with blue eyes and antennas..."
          rows={4}
          disabled={disabled}
          className="resize-none bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:border-emerald-400/60 focus-visible:ring-emerald-400/20"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        disabled={disabled || (!description.trim() && !uploadedImage)}
        className="w-full"
      >
        <Sparkles className="size-5" />
        Generate Character
      </Button>
    </form>
  )
}
