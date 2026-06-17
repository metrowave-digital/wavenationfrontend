import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { privacyPolicy } from '@/lib/legal-pages'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: privacyPolicy.description,
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return <LegalPage page={privacyPolicy} />
}
