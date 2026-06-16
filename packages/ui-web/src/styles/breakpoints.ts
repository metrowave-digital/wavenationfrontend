export const WN_BREAKPOINTS = {
  xs: 360,
  sm: 480,
  md: 768,
  lg: 980,
  xl: 1200,
  '2xl': 1440,
  tv: 1920,
  tv4k: 3840,
} as const

export type WaveNationBreakpoint = keyof typeof WN_BREAKPOINTS

export const WN_MEDIA = {
  mobile: `(max-width: ${WN_BREAKPOINTS.md - 1}px)`,
  tablet: `(min-width: ${WN_BREAKPOINTS.md}px) and (max-width: ${WN_BREAKPOINTS.lg - 1}px)`,
  desktop: `(min-width: ${WN_BREAKPOINTS.lg}px)`,
  wide: `(min-width: ${WN_BREAKPOINTS.xl}px)`,
  tv: `(min-width: ${WN_BREAKPOINTS.tv}px)`,
} as const