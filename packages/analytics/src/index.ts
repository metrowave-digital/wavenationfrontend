export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',

  CTA_CLICK: 'cta_click',
  NAV_CLICK: 'nav_click',
  SEARCH_OPEN: 'search_open',
  SEARCH_SUBMIT: 'search_submit',

  ARTICLE_OPEN: 'article_open',
  ARTICLE_SHARE: 'article_share',
  CATEGORY_VIEW: 'category_view',
  AUTHOR_VIEW: 'author_view',

  PLAYER_PLAY: 'player_play',
  PLAYER_PAUSE: 'player_pause',
  PLAYER_RELOAD: 'player_reload',
  PLAYER_SHARE: 'player_share',
  PLAYER_OPEN_POPUP: 'player_open_popup',
  PLAYER_CLOSE_POPUP: 'player_close_popup',
  PLAYER_MUTE: 'player_mute',
  PLAYER_UNMUTE: 'player_unmute',
  PLAYER_ERROR: 'player_error',
  PLAYER_AUTOPLAY_BLOCKED: 'player_autoplay_blocked',

  LISTEN_LIVE_VIEW: 'listen_live_view',
  WATCH_LIVE_VIEW: 'watch_live_view',
  VIDEO_PLAY: 'video_play',
  VIDEO_PAUSE: 'video_pause',
  VOD_VIEW: 'vod_view',

  PLAYLIST_VIEW: 'playlist_view',
  CHART_VIEW: 'chart_view',
  TRACK_CLICK: 'track_click',

  NEWSLETTER_SIGNUP: 'newsletter_signup',
  FORM_SUBMIT: 'form_submit',
  FORM_ERROR: 'form_error',

  CREATOR_HUB_VIEW: 'creator_hub_view',
  CREATOR_APPLICATION_START: 'creator_application_start',
  CONTRIBUTOR_APPLICATION_SUBMIT: 'contributor_application_submit',

  AD_CLICK: 'ad_click',
  SPONSOR_CLICK: 'sponsor_click'
} as const

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]

export type AnalyticsPrimitive = string | number | boolean | null | undefined

export type AnalyticsProperties = Record<
  string,
  AnalyticsPrimitive | AnalyticsPrimitive[]
>

export function sanitizeAnalyticsProperties(
  properties: AnalyticsProperties = {}
): AnalyticsProperties {
  return Object.fromEntries(
    Object.entries(properties)
      .filter(([key]) => Boolean(key))
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return [
            key,
            value.filter((item): item is Exclude<AnalyticsPrimitive, undefined> => item !== undefined),
          ]
        }

        return [key, value ?? null]
      })
  )
}

export function createAnalyticsPayload(
  properties: AnalyticsProperties = {}
): AnalyticsProperties {
  return sanitizeAnalyticsProperties({
    app: 'wavenation_web',
    platform: 'web',
    ...properties,
  })
}