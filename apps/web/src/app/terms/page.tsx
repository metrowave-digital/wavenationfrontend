import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { termsOfService } from '@/lib/legal-pages'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: termsOfService.description,
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return <LegalPage page={termsOfService} />
}
