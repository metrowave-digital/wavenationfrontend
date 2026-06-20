import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

type NewsletterPayload = {
  email?: string
  firstName?: string
  consent?: boolean | string | string[]
  source?: string
  companyWebsite?: string
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isConsentAccepted(value: NewsletterPayload['consent']): boolean {
  if (value === true) return true

  if (Array.isArray(value)) {
    return value.some((item: string) => isConsentAccepted(item))
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()

    return [
      'true',
      'on',
      'yes',
      '1',
      'accepted',
      'agree',
      'agreed',
    ].includes(normalized)
  }

  return false
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function getErrorMessage(error: unknown) {
  if (!error) return ''

  if (error instanceof Error) {
    return error.message
  }

  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

function isAlreadyExistsError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase()

  return (
    message.includes('already exists') ||
    message.includes('duplicate') ||
    message.includes('conflict') ||
    message.includes('409')
  )
}

async function sendNewsletterNotification({
  resend,
  email,
  firstName,
  source,
  submittedAt,
}: {
  resend: Resend
  email: string
  firstName: string
  source: string
  submittedAt: string
}) {
  const toEmail = process.env.WAVENATION_LEADS_TO_EMAIL || 'team@wavenation.online'
  const fromEmail =
    process.env.WAVENATION_LEADS_FROM_EMAIL ||
    'WaveNation Forms <forms@wavenation.online>'

  await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    subject: 'WaveNation Newsletter Signup',
    html: `
      <div style="background:#0b0d0f;color:#ffffff;font-family:Inter,Arial,sans-serif;padding:28px;">
        <div style="max-width:680px;margin:0 auto;border:1px solid #24303a;border-radius:22px;overflow:hidden;background:#11161b;">
          <div style="padding:22px;background:linear-gradient(135deg,#00b3ff,#39ff14);color:#071014;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;">WaveNation newsletter</p>
            <h1 style="margin:0;font-size:28px;line-height:1.1;">New newsletter signup</h1>
          </div>

          <div style="padding:24px;">
            <p style="color:#d7dce3;line-height:1.6;margin-top:0;">A new subscriber joined the WaveNation newsletter list.</p>

            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #24303a;color:#a2b3c7;font-weight:700;">Name</td>
                <td style="padding:10px 12px;border-bottom:1px solid #24303a;color:#ffffff;">${escapeHtml(firstName || 'Not provided')}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #24303a;color:#a2b3c7;font-weight:700;">Email</td>
                <td style="padding:10px 12px;border-bottom:1px solid #24303a;color:#ffffff;">${escapeHtml(email)}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #24303a;color:#a2b3c7;font-weight:700;">Source</td>
                <td style="padding:10px 12px;border-bottom:1px solid #24303a;color:#ffffff;">${escapeHtml(source || 'newsletter_page')}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #24303a;color:#a2b3c7;font-weight:700;">Submitted</td>
                <td style="padding:10px 12px;border-bottom:1px solid #24303a;color:#ffffff;">${escapeHtml(submittedAt)}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    `,
  })
}

async function createOrUpdateContact({
  resend,
  email,
  firstName,
  source,
  submittedAt,
}: {
  resend: Resend
  email: string
  firstName: string
  source: string
  submittedAt: string
}) {
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID || ''

  const contactPayload = {
    email,
    firstName: firstName || undefined,
    unsubscribed: false,
    properties: {
      source,
      consent: 'true',
      consent_at: submittedAt,
      platform: 'wavenation_web',
    },
    segments: segmentId ? [{ id: segmentId }] : undefined,
  }

  const createResult = await resend.contacts.create(contactPayload)

  if (!createResult.error) {
    return createResult
  }

  if (!isAlreadyExistsError(createResult.error)) {
    return createResult
  }

  const updateResult = await resend.contacts.update({
    email,
    firstName: firstName || undefined,
    unsubscribed: false,
    properties: {
      source,
      consent: 'true',
      consent_at: submittedAt,
      platform: 'wavenation_web',
    },
  })

  if (updateResult.error) {
    return updateResult
  }

  if (segmentId) {
    await resend.contacts.segments
      .add({
        email,
        segmentId,
      })
      .catch(() => undefined)
  }

  return updateResult
}

export async function POST(request: Request) {
  let payload: NewsletterPayload

  try {
    payload = (await request.json()) as NewsletterPayload
  } catch {
    return NextResponse.json(
      { message: 'Invalid newsletter payload.' },
      { status: 400 },
    )
  }

  if (payload.companyWebsite) {
    return NextResponse.json({
      message: 'You are on the WaveNation newsletter list.',
    })
  }

  const email = String(payload.email || '').trim().toLowerCase()
  const firstName = String(payload.firstName || '').trim()
  const source = String(payload.source || 'newsletter_page').trim()
  const submittedAt = new Date().toISOString()

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { message: 'Please provide a valid email address.' },
      { status: 400 },
    )
  }

  if (!isConsentAccepted(payload.consent)) {
    return NextResponse.json(
      { message: 'Please confirm newsletter consent.' },
      { status: 400 },
    )
  }

  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { message: 'Resend is not configured. Add RESEND_API_KEY.' },
      { status: 500 },
    )
  }

  const resend = new Resend(apiKey)

  const contactResult = await createOrUpdateContact({
    resend,
    email,
    firstName,
    source,
    submittedAt,
  })

  if (contactResult.error) {
    return NextResponse.json(
      {
        message:
          getErrorMessage(contactResult.error) ||
          'Newsletter signup could not be completed.',
      },
      { status: 502 },
    )
  }

  await sendNewsletterNotification({
    resend,
    email,
    firstName,
    source,
    submittedAt,
  }).catch(() => undefined)

  return NextResponse.json({
    message: 'You are on the WaveNation newsletter list.',
  })
}