'use client'

import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'
import { useEffect } from 'react'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background:
            'radial-gradient(circle at top left, rgba(0,179,255,.18), transparent 32rem), #0B0D0F',
          color: '#FFFFFF',
          fontFamily:
            'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        }}
      >
        <main
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <section style={{ maxWidth: '42rem' }}>
            <p
              style={{
                color: '#00B3FF',
                fontWeight: 800,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
              }}
            >
              WaveNation
            </p>

            <h1
              style={{
                margin: '0 0 1rem',
                fontSize: 'clamp(2.4rem, 8vw, 5rem)',
                lineHeight: 0.95,
                textTransform: 'uppercase',
              }}
            >
              Something went off-wave.
            </h1>

            <p style={{ color: '#D7DCE3', lineHeight: 1.7 }}>
              We logged the issue and are working to bring the experience back.
              Refresh the page or return home.
            </p>

            <Link
              href="/"
              style={{
                display: 'inline-flex',
                marginTop: '1.5rem',
                padding: '.85rem 1.2rem',
                borderRadius: '999px',
                border: '1px solid rgba(0,179,255,.45)',
                color: '#FFFFFF',
                textDecoration: 'none',
                boxShadow: '0 0 28px rgba(0,179,255,.25)',
              }}
            >
              Return Home
            </Link>
          </section>
        </main>
      </body>
    </html>
  )
}