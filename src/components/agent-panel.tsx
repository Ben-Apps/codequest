'use client'

import { QuestmasterPanel } from '@/components/questmaster-panel'

export function AgentPanel({ panelId }: { panelId: string }) {
  switch (panelId) {
    case 'questmaster':
      return <QuestmasterPanel />
    default:
      return (
        <div className="p-4 text-sm text-muted-foreground font-mono">
          Unbekanntes Panel: <span className="text-gray-200">{panelId}</span>
        </div>
      )
  }
}

