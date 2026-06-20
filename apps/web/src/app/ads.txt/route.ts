const GOOGLE_CERTIFICATION_AUTHORITY_ID = 'f08c47fec0942fa0'

function normalizePublisherId(value?: string) {
  if (!value) return ''

  return value
    .trim()
    .replace(/^ca-/, '')
    .replace(/^pub-/, 'pub-')
}

export const revalidate = 3600

export function GET() {
  const publisherId = normalizePublisherId(
    process.env.GOOGLE_ADSENSE_PUBLISHER_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID
  )

  const body = publisherId
    ? `google.com, ${publisherId}, DIRECT, ${GOOGLE_CERTIFICATION_AUTHORITY_ID}\n`
    : '# Missing GOOGLE_ADSENSE_PUBLISHER_ID=pub-xxxxxxxxxxxxxxxx\n'

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}