import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { dmcaPolicy } from '@/lib/legal-pages'

export const metadata: Metadata = {
  title: 'DMCA Copyright Policy',
  description: dmcaPolicy.description,
  alternates: { canonical: '/copyright' },
}

export default function CopyrightPage() {
  return <LegalPage page={dmcaPolicy} />
}
