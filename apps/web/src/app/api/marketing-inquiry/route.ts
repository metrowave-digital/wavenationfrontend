import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

type IncomingValue = string | boolean | string[] | null | undefined

type IncomingPayload = Record<string, IncomingValue>

const ignoredKeys = new Set(['companyWebsite'])

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function humanizeKey(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (char) => char.toUpperCase())
}

function formatValue(value: IncomingValue) {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value || '').trim()
}

function buildRows(payload: IncomingPayload) {
  return Object.entries(payload)
    .filter(([key]) => !ignoredKeys.has(key))
    .map(([key, value]) => {
      const formattedValue = formatValue(value)
      if (!formattedValue) return ''

      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #24303a;color:#a2b3c7;font-weight:700;vertical-align:top;">${escapeHtml(humanizeKey(key))}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #24303a;color:#ffffff;vertical-align:top;">${escapeHtml(formattedValue).replaceAll('\n', '<br />')}</td>
        </tr>
      `
    })
    .join('')
}

function normalizeEmail(value: IncomingValue) {
  const email = formatValue(value).toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ''
}

function normalizeSubject(intent: string, pageTitle: string) {
  const cleanIntent = intent.replace(/[_-]+/g, ' ').replace(/^./, (char) => char.toUpperCase())
  const cleanTitle = pageTitle || 'WaveNation website'
  return `WaveNation ${cleanIntent}: ${cleanTitle}`.slice(0, 140)
}

export async function POST(request: Request) {
  let payload: IncomingPayload

  try {
    payload = (await request.json()) as IncomingPayload
  } catch {
    return NextResponse.json({ message: 'Invalid form payload.' }, { status: 400 })
  }

  if (formatValue(payload.companyWebsite)) {
    return NextResponse.json({ message: 'Thanks. Your request has been received.' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.WAVENATION_LEADS_TO_EMAIL || 'team@wavenation.online'
  const fromEmail = process.env.WAVENATION_LEADS_FROM_EMAIL || 'WaveNation Forms <forms@wavenation.online>'
  const intent = formatValue(payload.intent) || 'website_form'
  const pageTitle = formatValue(payload.pageTitle)
  const senderEmail = normalizeEmail(payload.email)

  if (!apiKey) {
    return NextResponse.json({ message: 'Resend is not configured. Add RESEND_API_KEY.' }, { status: 500 })
  }

  if (!senderEmail) {
    return NextResponse.json({ message: 'Please provide a valid email address.' }, { status: 400 })
  }

  const resend = new Resend(apiKey)
  const submittedAt = new Date().toISOString()
  const rows = buildRows({ ...payload, submittedAt })

  const html = `
    <div style="background:#0b0d0f;color:#ffffff;font-family:Inter,Arial,sans-serif;padding:28px;">
      <div style="max-width:720px;margin:0 auto;border:1px solid #24303a;border-radius:22px;overflow:hidden;background:#11161b;">
        <div style="padding:24px;background:linear-gradient(135deg,#00b3ff,#e92c63);color:#071014;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;">WaveNation lead capture</p>
          <h1 style="margin:0;font-size:28px;line-height:1.1;">${escapeHtml(normalizeSubject(intent, pageTitle))}</h1>
        </div>
        <div style="padding:24px;">
          <p style="color:#d7dce3;line-height:1.6;margin-top:0;">A new request was submitted through the WaveNation website.</p>
          <table style="width:100%;border-collapse:collapse;">${rows}</table>
        </div>
      </div>
    </div>
  `

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    subject: normalizeSubject(intent, pageTitle),
    html,
  })

  if (error) {
    return NextResponse.json({ message: error.message || 'Email could not be sent.' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Thanks. Your request has been received.' })
}
