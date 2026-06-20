'use client'

import { useState, type FormEvent } from 'react'
import styles from './HomepageNewsletterCTA.module.css'

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error'

type NewsletterResponse = {
  message?: string
}

export function HomepageNewsletterCTA() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [consent, setConsent] = useState(false)
  const [state, setState] = useState<SubmissionState>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanEmail = email.trim()
    const cleanName = name.trim()

    if (!cleanEmail) {
      setState('error')
      setMessage('Enter your email address to join the WaveNation newsletter.')
      return
    }

    if (!consent) {
      setState('error')
      setMessage('Please confirm that you agree to receive the WaveNation newsletter.')
      return
    }

    setState('submitting')
    setMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
          firstName: cleanName || undefined,
          consent: true,
          source: 'homepage_newsletter_cta',
        }),
      })

      const data = (await response.json().catch(() => null)) as NewsletterResponse | null

      if (!response.ok) {
        throw new Error(data?.message || 'Newsletter request failed')
      }

      setState('success')
      setMessage(data?.message || 'You are on the list. Watch your inbox for the next WaveNation update.')
      setEmail('')
      setName('')
      setConsent(false)
    } catch (error) {
      setState('error')
      setMessage(
        error instanceof Error
          ? error.message
          : 'The newsletter form could not submit right now. Try again in a moment.',
      )
    }
  }

  return (
    <section className={styles.newsletter} aria-labelledby="homepage-newsletter-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>WaveNation Newsletter</p>
        <h2 id="homepage-newsletter-title">Get the culture brief without the clutter.</h2>
        <p>
          Music, Film & TV, culture, sports, business, tech, events, and creator updates from
          WaveNation.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          <span>Name</span>
          <input
            type="text"
            name="name"
            autoComplete="given-name"
            placeholder="First name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label>
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={state === 'submitting'}>
          {state === 'submitting' ? 'Joining…' : 'Join the List'}
        </button>

        <label className={styles.consent}>
          <input
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            required
          />
          <span>
            I agree to receive the WaveNation newsletter and understand I can unsubscribe later.
          </span>
        </label>

        {message ? (
          <p className={state === 'success' ? styles.success : styles.error}>{message}</p>
        ) : null}
      </form>
    </section>
  )
}