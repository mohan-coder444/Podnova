/**
 * lib/backend/rateLimit.js
 * In-DB rate limiting using the rate_limits table.
 * Falls back to allow on DB error (fail-open for UX).
 *
 * Limits (per window):
 *   /api/generate-script  → 5 req / 60s per IP
 *   /api/generate-audio   → 3 req / 60s per IP
 *   /api/merge-audio      → 5 req / 60s per IP
 *   default               → 30 req / 60s per IP
 */
import getInsforgeClient from '../insforge'

const LIMITS = {
  'generate-script': { max: 5,  windowSec: 60 },
  'enhance-script':  { max: 10, windowSec: 60 },
  'generate-audio':  { max: 3,  windowSec: 60 },
  'merge-audio':     { max: 5,  windowSec: 60 },
  'create-project':  { max: 20, windowSec: 60 },
  default:           { max: 30, windowSec: 60 },
}

/**
 * Checks and increments rate limit for a given identifier + endpoint.
 * @param {string} identifier - IP address or userId
 * @param {string} endpoint   - e.g. 'generate-script'
 * @returns {{ allowed: boolean, remaining: number, resetAt: Date }}
 */
export async function checkRateLimit(identifier, endpoint) {
  const { max, windowSec } = LIMITS[endpoint] ?? LIMITS.default

  try {
    const db = getInsforgeClient()
    const windowStart = new Date(Date.now() - windowSec * 1000).toISOString()

    // Fetch current record
    const { data: existing } = await db.database
      .from('rate_limits')
      .select('id, hits, window_start')
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .single()

    if (!existing || new Date(existing.window_start) < new Date(windowStart)) {
      // New window — upsert with hits = 1
      await db.database.from('rate_limits').upsert([{
        identifier,
        endpoint,
        hits: 1,
        window_start: new Date().toISOString(),
      }], { onConflict: 'identifier,endpoint' })

      return { allowed: true, remaining: max - 1, resetAt: new Date(Date.now() + windowSec * 1000) }
    }

    if (existing.hits >= max) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(new Date(existing.window_start).getTime() + windowSec * 1000),
      }
    }

    // Increment
    await db.database
      .from('rate_limits')
      .update({ hits: existing.hits + 1 })
      .eq('id', existing.id)

    return {
      allowed: true,
      remaining: max - existing.hits - 1,
      resetAt: new Date(new Date(existing.window_start).getTime() + windowSec * 1000),
    }
  } catch {
    // Fail-open: don't block users due to DB issues
    return { allowed: true, remaining: 1, resetAt: new Date() }
  }
}

/**
 * Next.js App Router middleware helper.
 * Usage: const rl = await rateLimitMiddleware(req, 'generate-script')
 *        if (rl) return rl  // returns 429 Response if limited
 */
export async function rateLimitMiddleware(request, endpoint) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const result = await checkRateLimit(ip, endpoint)

  if (!result.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please slow down.', retryAfter: result.resetAt }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(LIMITS[endpoint]?.max ?? LIMITS.default.max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetAt.toISOString(),
        },
      }
    )
  }

  return null // allowed
}
