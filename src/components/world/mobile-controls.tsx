'use client'

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Hand, Sword } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileControlsProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right' | null) => void
  onInteract: () => void
  onAttack?: () => void
  disabled?: boolean
  zIndexClassName?: string
}

export function MobileControls({ onMove, onInteract, onAttack, disabled, zIndexClassName }: MobileControlsProps) {
  if (disabled) return null

  const z = zIndexClassName ?? 'z-40'
  const bindDir = (direction: 'up' | 'down' | 'left' | 'right') => ({
    onPointerDown: () => onMove(direction),
    onPointerUp: () => onMove(null),
    onPointerCancel: () => onMove(null),
    onPointerLeave: () => onMove(null),
  })

  return (
    <>
      <div className={`fixed bottom-4 left-4 ${z} md:hidden`}>
        <div className="grid grid-cols-3 gap-1 rounded-3xl border border-white/10 bg-black/30 p-2 backdrop-blur-xl shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)]">
          <div />
          <Button
            variant="ghost"
            size="icon-lg"
            className="size-14 border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 active:bg-white/15"
            {...bindDir('up')}
          >
            <ArrowUp className="size-5" />
          </Button>
          <div />

          <Button
            variant="ghost"
            size="icon-lg"
            className="size-14 border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 active:bg-white/15"
            {...bindDir('left')}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            className="size-14 border border-primary/30 bg-primary/25 text-white hover:bg-primary/30 active:bg-primary/35 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
            onPointerDown={onInteract}
          >
            <Hand className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            className="size-14 border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 active:bg-white/15"
            {...bindDir('right')}
          >
            <ArrowRight className="size-5" />
          </Button>

          <div />
          <Button
            variant="ghost"
            size="icon-lg"
            className="size-14 border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 active:bg-white/15"
            {...bindDir('down')}
          >
            <ArrowDown className="size-5" />
          </Button>
          <div />
        </div>
      </div>

      {onAttack && (
        <div className={`fixed bottom-6 right-4 ${z} md:hidden`}>
          <Button
            variant="ghost"
            size="icon-lg"
            className="size-14 border border-red-500/30 bg-red-500/20 text-white hover:bg-red-500/25 active:bg-red-500/30 shadow-[0_0_0_1px_rgba(239,68,68,0.25)]"
            onPointerDown={onAttack}
            aria-label="Attack"
          >
            <Sword className="size-5" />
          </Button>
        </div>
      )}
    </>
  )
}
