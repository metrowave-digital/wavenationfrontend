import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { accessibilityStatement } from '@/lib/legal-pages'

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: accessibilityStatement.description,
  alternates: { canonical: '/accessibility' },
}

export default function AccessibilityPage() {
  return <LegalPage page={accessibilityStatement} />
}
