import type { Metadata } from 'next'
import { MarketingPage } from '@wavenation/ui-web'
import { marketingPages } from '@/lib/wavenation-marketing-pages'

export const metadata: Metadata = {
  title: marketingPages.showSponsorships.title,
  description: marketingPages.showSponsorships.description,
}

export default function Page() {
  return <MarketingPage config={marketingPages.showSponsorships} />
}
