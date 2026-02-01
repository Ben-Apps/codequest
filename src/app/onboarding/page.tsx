import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

export default function OnboardingPage() {
  return (
    <OnboardingFlow
      backHref="/"
      backLabel="Start"
      title="Onboarding"
    />
  )
}

