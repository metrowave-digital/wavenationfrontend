'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

const pageProperties = {
  page: 'submit_music',
  route: '/submit-music',
  section: 'artist_submissions',
}

export function SubmitMusicAnalytics() {
  useEffect(() => {
    trackEvent('submit_music_page_view', {
      ...pageProperties,
      path: window.location.pathname,
      title: document.title,
    })

    function handleClick(event: MouseEvent) {
      const target = event.target

      if (!(target instanceof Element)) {
        return
      }

      const analyticsTarget = target.closest('[data-analytics-event]')

      if (!(analyticsTarget instanceof HTMLElement)) {
        return
      }

      const eventName = analyticsTarget.dataset.analyticsEvent

      if (!eventName) {
        return
      }

      trackEvent(eventName, {
        ...pageProperties,
        label:
          analyticsTarget.dataset.analyticsLabel ||
          analyticsTarget.textContent?.trim() ||
          null,
        href: analyticsTarget.getAttribute('href'),
      })
    }

    function handleSubmit(event: SubmitEvent) {
      const target = event.target

      if (!(target instanceof HTMLFormElement)) {
        return
      }

      if (!target.closest('[data-wn-submit-music-form]')) {
        return
      }

      trackEvent('submit_music_form_submit_attempt', {
        ...pageProperties,
        form: 'music_submission',
      })
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('submit', handleSubmit, true)

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('submit', handleSubmit, true)
    }
  }, [])

  return null
}