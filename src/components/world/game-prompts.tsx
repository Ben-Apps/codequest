import { InteractionPrompt } from './interaction-prompt'
import { BuildingPrompt } from './building-prompt'
import { CombatPrompt } from './combat-prompt'
import type { AgentNPC, Mob, LearningStation } from '@/types'

interface GamePromptsProps {
  nearbyNPC: AgentNPC | null
  nearbyMob: (Mob & { defeated?: boolean }) | null
  nearbyPortal: { type: string } | null
  nearbyCodeFarm: { type: 'code_farm' } | null
  nearbyN8nFactory: { type: 'n8n_factory' } | null
  nearbySecurityHub: { type: 'security_hub' } | null
  nearbyProgrammingHub: { type: 'programming_hub' } | null
  nearbyDesignAtelier: { type: 'ui_ux_atelier' } | null
  nearbyAtelierStation: { id: string; name: string } | null
  nearbyLearningStation: LearningStation | null
  isDialogOpen: boolean
  isChallengeOpen: boolean
  isLessonOpen: boolean
  isFarmOpen: boolean
  isProgrammingHubOpen: boolean
  isDesignAtelierOpen: boolean
}

export function GamePrompts({
  nearbyNPC,
  nearbyMob,
  nearbyPortal,
  nearbyCodeFarm,
  nearbyN8nFactory,
  nearbySecurityHub,
  nearbyProgrammingHub,
  nearbyDesignAtelier,
  nearbyAtelierStation,
  nearbyLearningStation,
  isDialogOpen,
  isChallengeOpen,
  isLessonOpen,
  isFarmOpen,
  isProgrammingHubOpen,
  isDesignAtelierOpen,
}: GamePromptsProps) {
  const anyOpen =
    isDialogOpen || isChallengeOpen || isLessonOpen || isFarmOpen || isProgrammingHubOpen || isDesignAtelierOpen

  // Helper to determine if a prompt should be visible
  // Note: Original logic was exclusive (if NPC visible, don't show Portal prompt etc.)
  // We replicate that priority here.

  // Priority 1: InteractionPrompt (NPC)
  const showNPC = !!nearbyNPC && !nearbyMob && !nearbyPortal && !nearbyCodeFarm && !nearbyN8nFactory && !anyOpen

  // Priority 2: Portal
  const showPortal = !!nearbyPortal && !anyOpen

  // Priority 3: Code Farm
  const showCodeFarm = !!nearbyCodeFarm && !nearbyNPC && !nearbyMob && !nearbyPortal && !nearbyLearningStation && !anyOpen

  // Priority 4: n8n Factory
  const showN8nFactory =
    !!nearbyN8nFactory &&
    !nearbyNPC &&
    !nearbyMob &&
    !nearbyPortal &&
    !nearbyLearningStation &&
    !nearbyCodeFarm &&
    !anyOpen

  // Priority 5: Security Hub
  const showSecurityHub =
    !!nearbySecurityHub &&
    !nearbyNPC &&
    !nearbyMob &&
    !nearbyPortal &&
    !nearbyLearningStation &&
    !nearbyCodeFarm &&
    !nearbyN8nFactory &&
    !anyOpen

  // Priority 6: Programming Hub
  const showProgrammingHub =
    !!nearbyProgrammingHub &&
    !nearbyNPC &&
    !nearbyMob &&
    !nearbyPortal &&
    !nearbyLearningStation &&
    !nearbyCodeFarm &&
    !nearbyN8nFactory &&
    !nearbySecurityHub &&
    !anyOpen

  // Priority 7: Design Atelier
  const showDesignAtelier =
    !!nearbyDesignAtelier &&
    !nearbyNPC &&
    !nearbyMob &&
    !nearbyPortal &&
    !nearbyLearningStation &&
    !nearbyCodeFarm &&
    !nearbyN8nFactory &&
    !nearbySecurityHub &&
    !nearbyProgrammingHub &&
    !anyOpen

  const showAtelierStation =
    !!nearbyAtelierStation &&
    !nearbyNPC &&
    !nearbyMob &&
    !nearbyPortal &&
    !nearbyLearningStation &&
    !nearbyCodeFarm &&
    !nearbyN8nFactory &&
    !nearbySecurityHub &&
    !nearbyProgrammingHub &&
    !nearbyDesignAtelier &&
    !anyOpen

  // Priority 8: Learning Station
  const showLearningStation = !!nearbyLearningStation && !nearbyNPC && !nearbyMob && !nearbyPortal && !anyOpen

  // Priority 9: Combat
  const showCombat = !!nearbyMob && !anyOpen

  return (
    <>
      <InteractionPrompt visible={showNPC} npcName={nearbyNPC?.name} />

      <BuildingPrompt
        visible={showPortal}
        label={
          nearbyPortal?.type === 'exit_ai_university'
            ? 'Leave AI University'
            : nearbyPortal?.type === 'enter_ai_university'
              ? 'Enter AI University'
              : nearbyPortal?.type === 'exit_ai_labor'
                ? 'Leave AI Lab'
                : nearbyPortal?.type === 'exit_design_atelier'
                  ? 'Leave Design Atelier'
                  : nearbyPortal?.type === 'exit_security_hub'
                    ? 'Leave Security Hub'
                    : 'Enter AI Lab'
        }
        keyHint="E"
        accent="primary"
      />

      <BuildingPrompt
        visible={showCodeFarm}
        label="Open Code Farm (Spawn Monsters)"
        keyHint="E"
        accent="neutral"
      />

      <BuildingPrompt visible={showN8nFactory} label="Enter n8n Factory" keyHint="E" accent="primary" />

      <BuildingPrompt visible={showSecurityHub} label="Enter Security Hub" keyHint="E" accent="primary" />

      <BuildingPrompt visible={showProgrammingHub} label="Enter Programming Hub" keyHint="E" accent="primary" />

      <BuildingPrompt visible={showDesignAtelier} label="Enter Design Atelier" keyHint="E" accent="primary" />

      <BuildingPrompt
        visible={showAtelierStation}
        label={`Object: ${nearbyAtelierStation?.name ?? ''}`}
        keyHint="E"
        accent="primary"
      />

      <BuildingPrompt
        visible={showLearningStation}
        label={`Start Lesson: ${nearbyLearningStation?.title ?? ''}`}
        keyHint="E"
        accent="primary"
      />

      <CombatPrompt visible={showCombat} mobName={nearbyMob?.name} />
    </>
  )
}
