// apps/web/src/app/api/radio/live365/route.ts
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const STATION_PAGE_URL =
  process.env.LIVE365_STATION_PAGE_URL ||
  'https://live365.com/station/WaveNation-FM-a49099'

type Live365Metadata = {
  stationId: string
  stationName: string
  streamUrl: string
  nowPlaying: {
    title: string
    artist: string
  }
  lastPlayed: Array<{
    title: string
    artist: string
    playedAtLabel: string
  }>
  sourceUrl: string
  updatedAt: string
}

function cleanText(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function htmlToLines(html: string) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')

  return text
    .split('\n')
    .map(cleanText)
    .filter(Boolean)
    .filter((line) => !['Image', 'EN', 'English', 'Spanish'].includes(line))
}

function parseLive365Page(html: string): Live365Metadata {
  const lines = htmlToLines(html)

  const nowIndex = lines.findIndex(
    (line) => line.toLowerCase() === 'now playing',
  )

  const lastIndex = lines.findIndex(
    (line) => line.toLowerCase() === 'last played',
  )

  const aboutIndex = lines.findIndex((line) => line.toLowerCase() === 'about')

  const nowTitle = nowIndex >= 0 ? lines[nowIndex + 1] || 'WaveNation FM' : 'WaveNation FM'
  const nowArtist = nowIndex >= 0 ? lines[nowIndex + 2] || 'Live Radio' : 'Live Radio'

  const lastPlayedLines =
    lastIndex >= 0 && aboutIndex > lastIndex
      ? lines.slice(lastIndex + 1, aboutIndex)
      : []

  const lastPlayed = []

  for (let i = 0; i < lastPlayedLines.length; i += 3) {
    const title = lastPlayedLines[i]
    const artist = lastPlayedLines[i + 1]
    const playedAtLabel = lastPlayedLines[i + 2]

    if (title && artist && playedAtLabel) {
      lastPlayed.push({
        title,
        artist,
        playedAtLabel,
      })
    }
  }

  return {
    stationId: 'a49099',
    stationName: 'WaveNation FM',
    streamUrl: 'https://streaming.live365.com/a49099',
    nowPlaying: {
      title: nowTitle,
      artist: nowArtist,
    },
    lastPlayed,
    sourceUrl: STATION_PAGE_URL,
    updatedAt: new Date().toISOString(),
  }
}

export async function GET() {
  try {
    const response = await fetch(STATION_PAGE_URL, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'WaveNation Website Metadata Fetcher',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Unable to fetch Live365 metadata',
          status: response.status,
        },
        { status: 502 },
      )
    }

    const html = await response.text()
    const metadata = parseLive365Page(html)

    return NextResponse.json(metadata, {
      headers: {
        'Cache-Control': 'public, max-age=20, stale-while-revalidate=40',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Live365 metadata request failed',
      },
      { status: 500 },
    )
  }
}