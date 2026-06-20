import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type MusicSubmissionPayload = {
  artistName?: string
  legalName?: string
  email?: string
  phone?: string
  cityState?: string
  songTitle?: string
  genre?: string
  cleanOrExplicit?: string
  streamingLinks?: string
  downloadLink?: string
  bio?: string
  socialLinks?: string
  pressKitLink?: string
  coverArtLink?: string
  message?: string
  rightsConfirmed?: boolean
  airplayPermission?: boolean
}

const backupMessage = 'If this form does not work email to music@wavenation.online.'

export async function POST(request: Request) {
  let payload: MusicSubmissionPayload

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: `Invalid form data. ${backupMessage}` }, { status: 400 })
  }

  const validationError = validateSubmission(payload)
  if (validationError) {
    return NextResponse.json({ ok: false, message: `${validationError} ${backupMessage}` }, { status: 400 })
  }

  const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const tableName = process.env.AIRTABLE_MUSIC_SUBMISSIONS_TABLE || 'Music Submissions'

  if (!token || !baseId || !tableName) {
    return NextResponse.json(
      {
        ok: false,
        message:
          `Music submission storage is not configured yet. ${backupMessage}`,
      },
      { status: 503 },
    )
  }

  const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`

  const fields = {
    'Artist / Group Name': payload.artistName,
    'Legal Name': payload.legalName,
    Email: payload.email,
    Phone: payload.phone,
    'City / State': payload.cityState,
    'Song Title': payload.songTitle,
    Genre: payload.genre,
    'Clean or Explicit': payload.cleanOrExplicit,
    'Streaming Links': payload.streamingLinks,
    'Download Link': payload.downloadLink,
    'Artist Bio / Story': payload.bio,
    'Social Links': payload.socialLinks,
    'Press Kit Link': payload.pressKitLink,
    'Cover Art Link': payload.coverArtLink,
    Message: payload.message,
    'Rights Confirmed': Boolean(payload.rightsConfirmed),
    'Airplay Permission': Boolean(payload.airplayPermission),
    'Submission Source': 'WaveNation Website',
    'Submitted At': new Date().toISOString(),
  }

  try {
    const response = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records: [{ fields }] }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('Airtable music submission failed:', response.status, text)
      return NextResponse.json(
        { ok: false, message: `We could not save your submission right now. ${backupMessage}` },
        { status: 502 },
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'Thank you. Your music submission was received by WaveNation.',
    })
  } catch (error) {
    console.error('Music submission route error:', error)
    return NextResponse.json(
      { ok: false, message: `Something went wrong while submitting your music. ${backupMessage}` },
      { status: 500 },
    )
  }
}

function validateSubmission(payload: MusicSubmissionPayload) {
  if (!payload.artistName?.trim()) return 'Artist / Group Name is required.'
  if (!payload.legalName?.trim()) return 'Legal Name is required.'
  if (!payload.email?.trim()) return 'Email is required.'
  if (!/^\S+@\S+\.\S+$/.test(payload.email)) return 'Please enter a valid email address.'
  if (!payload.songTitle?.trim()) return 'Song Title is required.'
  if (!payload.genre?.trim()) return 'Genre is required.'
  if (!payload.cleanOrExplicit?.trim()) return 'Clean or Explicit status is required.'
  if (!payload.rightsConfirmed) return 'You must confirm that you own or are authorized to submit the music.'
  if (!payload.airplayPermission) return 'You must grant WaveNation permission to consider the song for airplay.'
  return null
}
