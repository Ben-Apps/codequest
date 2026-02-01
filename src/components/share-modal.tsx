'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Copy, Plus, Share2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ShareModalProps {
  open: boolean
  onClose: () => void
  characterName: string
}

export function ShareModal({ open, onClose, characterName }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const shareId = useId()

  // Generate a simple share code (in production, this would be more sophisticated)
  const shareCode = `AGENT-${shareId.replace(/[:]/g, '').toUpperCase()}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = shareCode
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="size-5 text-primary" />
            <span>Share Character</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Share your character <strong>{characterName}</strong> with this code:
          </p>

          <div className="flex gap-2">
            <Input
              value={shareCode}
              readOnly
              className="font-mono text-center"
            />
            <Button onClick={handleCopy} variant={copied ? 'default' : 'secondary'}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/create">
                <Plus className="size-4" />
                Create New Character
              </Link>
            </Button>
            <Button variant="ghost" className="w-full" onClick={onClose}>
              <ArrowLeft className="size-4" />
              Back to Game
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
