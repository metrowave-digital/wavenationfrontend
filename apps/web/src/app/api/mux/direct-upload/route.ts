import { NextResponse } from 'next/server'
import { createMuxDirectUpload } from '../../../../lib/mux-sever'

export const runtime = 'nodejs'

export async function POST() {
  try {
    const upload = await createMuxDirectUpload()

    return NextResponse.json({
      id: upload.id,
      url: upload.url,
      status: upload.status,
      assetId: upload.asset_id || null,
      timeout: upload.timeout,
    })
  } catch (error) {
    console.error('[WaveNation Mux Direct Upload Error]', error)

    return NextResponse.json(
      {
        error: 'Unable to create Mux direct upload URL.',
      },
      {
        status: 500,
      }
    )
  }
}