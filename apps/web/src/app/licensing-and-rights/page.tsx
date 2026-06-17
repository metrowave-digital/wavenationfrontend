import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { licensingAndRights } from '@/lib/legal-pages'

export const metadata: Metadata = {
  title: 'Licensing & Rights',
  description: licensingAndRights.description,
  alternates: { canonical: '/licensing-and-rights' },
}

export default function LicensingAndRightsPage() {
  return <LegalPage page={licensingAndRights} />
}
