import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { communityGuidelines } from '@/lib/legal-pages'

export const metadata: Metadata = {
  title: 'Community Guidelines',
  description: communityGuidelines.description,
  alternates: { canonical: '/community-guidelines' },
}

export default function CommunityGuidelinesPage() {
  return <LegalPage page={communityGuidelines} />
}
