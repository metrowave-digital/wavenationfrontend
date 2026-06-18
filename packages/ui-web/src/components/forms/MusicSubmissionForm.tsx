'use client'

import { useState } from 'react'
import styles from './MusicSubmissionForm.module.css'

type MusicSubmissionFormProps = {
  endpoint?: string
}

type FormState = 'idle' | 'submitting' | 'success' | 'error'

const backupMessage = 'If this form does not work email to wavenationfm@gmail.com.'

export function MusicSubmissionForm({ endpoint = '/api/submit-music' }: MusicSubmissionFormProps) {
  const [state, setState] = useState<FormState>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('submitting')
    setMessage('')

    const formData = new FormData(event.currentTarget)
    const payload = Object.fromEntries(formData.entries()) as Record<string, string>

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          rightsConfirmed: formData.get('rightsConfirmed') === 'on',
          airplayPermission: formData.get('airplayPermission') === 'on',
        }),
      })

      const json = (await response.json()) as { ok?: boolean; message?: string }

      if (!response.ok || !json.ok) {
        setState('error')
        setMessage(json.message || backupMessage)
        return
      }

      setState('success')
      setMessage(json.message || 'Thank you. Your music submission was received by WaveNation.')
      event.currentTarget.reset()
    } catch {
      setState('error')
      setMessage(`Something went wrong. ${backupMessage}`)
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.header}>
        <p>WaveNation Music Review</p>
        <h2>Artist Submission Form</h2>
        <span>{backupMessage}</span>
      </div>

      <div className={styles.grid}>
        <Field label="Artist / Group Name" name="artistName" required />
        <Field label="Legal Name" name="legalName" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Phone" name="phone" type="tel" />
        <Field label="City / State" name="cityState" />
        <Field label="Song Title" name="songTitle" required />
        <Field label="Genre" name="genre" required />

        <label className={styles.field}>
          <span>Clean or Explicit <strong>*</strong></span>
          <select name="cleanOrExplicit" required defaultValue="">
            <option value="" disabled>Choose one</option>
            <option value="Clean / Radio Edit">Clean / Radio Edit</option>
            <option value="Explicit">Explicit</option>
            <option value="Both Available">Both Available</option>
          </select>
        </label>
      </div>

      <div className={styles.fullGrid}>
        <TextArea label="Streaming Links" name="streamingLinks" placeholder="Spotify, Apple Music, YouTube, SoundCloud, Audiomack, etc." />
        <TextArea label="Download Link" name="downloadLink" placeholder="Public Google Drive, Dropbox, Box, WeTransfer, or direct download link." />
        <TextArea label="Bio / Artist Story" name="bio" placeholder="Tell us who you are, your sound, and your story." />
        <TextArea label="Social Links" name="socialLinks" placeholder="Instagram, TikTok, YouTube, Facebook, X, website, etc." />
        <Field label="Press Kit Link" name="pressKitLink" />
        <Field label="Cover Art Link" name="coverArtLink" />
        <TextArea label="Message to WaveNation" name="message" placeholder="Anything else we should know?" />
      </div>

      <div className={styles.consentBox}>
        <label>
          <input name="rightsConfirmed" type="checkbox" required />
          <span>I confirm that I own this music or am authorized to submit it for consideration.</span>
        </label>
        <label>
          <input name="airplayPermission" type="checkbox" required />
          <span>I give WaveNation permission to review this submission for possible airplay, editorial, playlist, interview, or creator spotlight consideration.</span>
        </label>
      </div>

      <button className={styles.submit} type="submit" disabled={state === 'submitting'}>
        {state === 'submitting' ? 'Submitting...' : 'Submit Music'}
      </button>

      {message ? (
        <p className={state === 'success' ? styles.success : styles.error} role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
    </form>
  )
}

type FieldProps = {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
}

function Field({ label, name, type = 'text', required = false, placeholder }: FieldProps) {
  return (
    <label className={styles.field}>
      <span>{label} {required ? <strong>*</strong> : null}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} />
    </label>
  )
}

function TextArea({ label, name, placeholder }: FieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <textarea name={name} rows={4} placeholder={placeholder} />
    </label>
  )
}
