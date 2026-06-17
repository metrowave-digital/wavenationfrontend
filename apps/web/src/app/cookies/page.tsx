import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { cookiePolicy } from '@/lib/legal-pages'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: cookiePolicy.description,
  alternates: { canonical: '/cookies' },
}

export default function CookiePolicyPage() {
  return <LegalPage page={cookiePolicy} />
}
