export type MarketingAccent = 'blue' | 'magenta' | 'green' | 'teal'

export type MarketingAction = {
  label: string
  href: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

export type MarketingStat = {
  label: string
  value: string
  detail?: string
}

export type MarketingSectionItem = {
  title: string
  description: string
  meta?: string
}

export type MarketingSection = {
  eyebrow?: string
  title: string
  description?: string
  items?: MarketingSectionItem[]
}

export type MarketingResource = {
  title: string
  description: string
  href?: string
  label?: string
  disclosure?: string
  isExternal?: boolean
  isComingSoon?: boolean
}

export type MarketingFaq = {
  question: string
  answer: string
}

export type MarketingFormFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'checkboxGroup'

export type MarketingFormOption = {
  label: string
  value: string
}

export type MarketingFormField = {
  name: string
  label: string
  type: MarketingFormFieldType
  placeholder?: string
  required?: boolean
  helperText?: string
  options?: MarketingFormOption[]
}

export type MarketingFormConfig = {
  intent: string
  title: string
  description?: string
  endpoint: string
  submitLabel?: string
  successMessage?: string
  fields: MarketingFormField[]
}

export type MarketingPageConfig = {
  eyebrow: string
  title: string
  description: string
  seoTitle?: string
  seoDescription?: string
  accent?: MarketingAccent
  heroBadges?: string[]
  primaryAction?: MarketingAction
  secondaryAction?: MarketingAction
  stats?: MarketingStat[]
  sections?: MarketingSection[]
  form?: MarketingFormConfig
  resources?: MarketingResource[]
  faqs?: MarketingFaq[]
  footerCta?: {
    eyebrow?: string
    title: string
    description?: string
    actions?: MarketingAction[]
  }
}