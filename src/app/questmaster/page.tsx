'use client'

import Link from 'next/link'
import { ArrowRight, ScrollText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuestmasterPanel } from '@/components/questmaster-panel'
import { AppBackground } from '@/components/ui/app-background'

export default function QuestmasterPage() {
  return (
    <main className="min-h-screen p-4">
      <AppBackground />

      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 rounded-2xl px-3 py-2 app-glass app-surface-shadow">
            <ScrollText className="size-4 text-white/80" />
            <div className="font-mono text-sm text-white/90">Questmaster</div>
          </div>
          <Button asChild variant="outline" size="sm" className="app-glass text-white/90 hover:bg-white/10">
            <Link href="/world">
              Zur Welt
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="rounded-2xl overflow-hidden app-glass app-surface-shadow">
          <QuestmasterPanel />
        </div>
      </div>
    </main>
  )
}

