import type { Metadata } from 'next'
import { MarketingPage } from '@wavenation/ui-web'
import { marketingPages } from '@/lib/wavenation-marketing-pages'

export const metadata: Metadata = {
  title: marketingPages.sponsorships.title,
  description: marketingPages.sponsorships.description,
}

export default function Page() {
  return <MarketingPage config={marketingPages.sponsorships} />
}
