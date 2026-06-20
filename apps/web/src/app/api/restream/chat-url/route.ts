import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const token = process.env.RESTREAM_ACCESS_TOKEN

  if (!token) {
    return NextResponse.json({ error: 'RESTREAM_ACCESS_TOKEN is not configured.' }, { status: 503 })
  }

  const response = await fetch('https://api.restream.io/v2/user/webchat/url', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Restream chat URL could not be loaded.' }, { status: response.status })
  }

  const data = (await response.json()) as { url?: string }

  if (!data.url) {
    return NextResponse.json({ error: 'Restream did not return a chat URL.' }, { status: 502 })
  }

  return NextResponse.json({ url: data.url })
}
