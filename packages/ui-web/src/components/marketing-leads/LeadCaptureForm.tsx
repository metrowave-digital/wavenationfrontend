'use client'

import { FormEvent, useMemo, useState } from 'react'
import type { MarketingFormConfig, MarketingFormField } from './types'
import styles from './LeadCaptureForm.module.css'

type LeadCaptureFormProps = {
  config: MarketingFormConfig
  pageTitle?: string
}

type FormState = 'idle' | 'submitting' | 'success' | 'error'

function fieldInputMode(type: MarketingFormField['type']) {
  if (type === 'email') return 'email'
  if (type === 'tel') return 'tel'
  if (type === 'url') return 'url'
  return undefined
}

function normalizeFieldValue(formData: FormData, field: MarketingFormField) {
  if (field.type === 'checkbox') {
    return formData.get(field.name) === 'on'
  }

  if (field.type === 'checkboxGroup') {
    return formData.getAll(field.name).map((value) => String(value))
  }

  return String(formData.get(field.name) || '').trim()
}

function isRequiredMissing(formData: FormData, field: MarketingFormField) {
  if (!field.required) return false

  if (field.type === 'checkbox') {
    return formData.get(field.name) !== 'on'
  }

  if (field.type === 'checkboxGroup') {
    return formData.getAll(field.name).length === 0
  }

  return !String(formData.get(field.name) || '').trim()
}

export function LeadCaptureForm({ config, pageTitle }: LeadCaptureFormProps) {
  const [state, setState] = useState<FormState>('idle')
  const [message, setMessage] = useState<string>('')

  const requiredFieldNames = useMemo(
    () => config.fields.filter((field) => field.required).map((field) => field.label),
    [config.fields],
  )

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    const missingField = config.fields.find((field) => isRequiredMissing(formData, field))
    if (missingField) {
      setState('error')
      setMessage(`Please complete: ${missingField.label}`)
      return
    }

    const payload: Record<string, string | boolean | string[]> = {
      intent: config.intent,
      pageTitle: pageTitle || '',
      companyWebsite: String(formData.get('companyWebsite') || ''),
    }

    for (const field of config.fields) {
      payload[field.name] = normalizeFieldValue(formData, field)
    }

    setState('submitting')
    setMessage('')

    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = (await response.json().catch(() => null)) as { message?: string } | null

      if (!response.ok) {
        throw new Error(result?.message || 'The form could not be submitted.')
      }

      form.reset()
      setState('success')
      setMessage(config.successMessage || result?.message || 'Thanks. Your request has been received.')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.header}>
        <p className={styles.kicker}>WaveNation intake</p>
        <h2>{config.title}</h2>
        {config.description ? <p>{config.description}</p> : null}
        {requiredFieldNames.length > 0 ? (
          <p className={styles.requiredNote}>Required fields are marked with an asterisk.</p>
        ) : null}
      </div>

      <label className={styles.honeypot} htmlFor={`${config.intent}-companyWebsite`}>
        Company website
        <input id={`${config.intent}-companyWebsite`} name="companyWebsite" tabIndex={-1} autoComplete="off" />
      </label>

      <div className={styles.fields}>
        {config.fields.map((field) => {
          const id = `${config.intent}-${field.name}`

          if (field.type === 'textarea') {
            return (
              <label key={field.name} className={styles.field} htmlFor={id}>
                <span>
                  {field.label}
                  {field.required ? <em>*</em> : null}
                </span>
                <textarea id={id} name={field.name} placeholder={field.placeholder} required={field.required} rows={6} />
                {field.helperText ? <small>{field.helperText}</small> : null}
              </label>
            )
          }

          if (field.type === 'select') {
            return (
              <label key={field.name} className={styles.field} htmlFor={id}>
                <span>
                  {field.label}
                  {field.required ? <em>*</em> : null}
                </span>
                <select id={id} name={field.name} required={field.required} defaultValue="">
                  <option value="" disabled>
                    Select an option
                  </option>
                  {(field.options || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {field.helperText ? <small>{field.helperText}</small> : null}
              </label>
            )
          }

          if (field.type === 'checkbox') {
            return (
              <label key={field.name} className={styles.checkbox}>
                <input name={field.name} type="checkbox" required={field.required} />
                <span>
                  {field.label}
                  {field.required ? <em>*</em> : null}
                </span>
              </label>
            )
          }

          if (field.type === 'checkboxGroup') {
            return (
              <fieldset key={field.name} className={styles.checkboxGroup}>
                <legend>
                  {field.label}
                  {field.required ? <em>*</em> : null}
                </legend>
                <div>
                  {(field.options || []).map((option) => (
                    <label key={option.value}>
                      <input name={field.name} type="checkbox" value={option.value} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                {field.helperText ? <small>{field.helperText}</small> : null}
              </fieldset>
            )
          }

          return (
            <label key={field.name} className={styles.field} htmlFor={id}>
              <span>
                {field.label}
                {field.required ? <em>*</em> : null}
              </span>
              <input
                id={id}
                name={field.name}
                type={field.type}
                inputMode={fieldInputMode(field.type)}
                placeholder={field.placeholder}
                required={field.required}
              />
              {field.helperText ? <small>{field.helperText}</small> : null}
            </label>
          )
        })}
      </div>

      <button className={styles.submit} type="submit" disabled={state === 'submitting'}>
        {state === 'submitting' ? 'Sending…' : config.submitLabel || 'Submit request'}
      </button>

      {message ? (
        <p className={state === 'success' ? styles.success : styles.error} role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
    </form>
  )
}
