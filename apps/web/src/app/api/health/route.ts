import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type ServiceStatus = 'ok' | 'degraded' | 'down'

type DependencyCheck = {
  status: ServiceStatus
  url: string
  latencyMs: number
  statusCode?: number
  message?: string
  error?: string
}

const DEFAULT_CMS_BASE_URL = 'https://cms.wavenation.online'
const DEFAULT_TIMEOUT_MS = 3000

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function readBoolean(value: string | undefined, fallback: boolean) {
  if (!value) return fallback

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}

function getCmsHealthUrl() {
  if (process.env.WAVENATION_CMS_HEALTH_URL) {
    return process.env.WAVENATION_CMS_HEALTH_URL
  }

  const cmsBaseUrl =
    process.env.WAVENATION_CMS_URL ??
    process.env.NEXT_PUBLIC_WAVENATION_CMS_URL ??
    DEFAULT_CMS_BASE_URL

  return `${trimTrailingSlash(cmsBaseUrl)}/api/health`
}

async function checkDependency(
  url: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<DependencyCheck> {
  const startedAt = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        accept: 'application/json,text/plain,*/*',
      },
    })

    const contentType = response.headers.get('content-type') ?? ''
    let message: string | undefined

    if (contentType.includes('application/json')) {
      const data = (await response.json().catch(() => null)) as
        | Record<string, unknown>
        | null

      if (typeof data?.status === 'string') {
        message = data.status
      } else if (typeof data?.message === 'string') {
        message = data.message
      }
    } else {
      const text = await response.text().catch(() => '')
      message = text.slice(0, 160) || undefined
    }

    return {
      status: response.ok ? 'ok' : 'down',
      url,
      statusCode: response.status,
      latencyMs: Date.now() - startedAt,
      ...(message ? { message } : {}),
    }
  } catch (error) {
    return {
      status: 'down',
      url,
      latencyMs: Date.now() - startedAt,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown dependency check error',
    }
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET() {
  const startedAt = Date.now()

  const checkCms = readBoolean(process.env.WAVENATION_HEALTH_CHECK_CMS, true)
  const cmsRequired = readBoolean(
    process.env.WAVENATION_CMS_REQUIRED_FOR_HEALTH,
    false,
  )

  const timeoutMs =
    Number(process.env.WAVENATION_HEALTH_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS

  const dependencies: Record<string, DependencyCheck> = {}

  if (checkCms) {
    dependencies.cms = await checkDependency(getCmsHealthUrl(), timeoutMs)
  }

  const cmsIsDown = checkCms && dependencies.cms?.status !== 'ok'

  const status: ServiceStatus = cmsIsDown ? 'degraded' : 'ok'
  const httpStatus = cmsIsDown && cmsRequired ? 503 : 200

  return NextResponse.json(
    {
      status,
      service: 'wavenation-frontend',
      app: 'web',
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
      region: process.env.VERCEL_REGION ?? 'local',
      version:
        process.env.NEXT_PUBLIC_APP_VERSION ??
        process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
        'local',
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
      uptimeSeconds: Math.round(process.uptime()),
      checks: {
        frontend: {
          status: 'ok',
          runtime,
        },
        ...dependencies,
      },
    },
    {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
      },
    },
  )
}