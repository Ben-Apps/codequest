import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

export default function CreatePage() {
  return (
    <OnboardingFlow
      backHref="/"
      backLabel="Start"
      title="Create Character"
    />
  )
}
