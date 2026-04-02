/**
 * lib/backend/retry.js
 * Generic exponential-backoff retry wrapper for external API calls.
 *
 * Usage:
 *   const data = await withRetry(() => fetchFromMistral(...), { retries: 3 })
 */

/**
 * Retries an async function with exponential backoff + jitter.
 * @param {() => Promise<T>} fn         - async function to retry
 * @param {object}           opts
 * @param {number}           opts.retries     - max attempts (default 3)
 * @param {number}           opts.baseDelayMs - base delay in ms (default 500)
 * @param {number}           opts.maxDelayMs  - max delay cap (default 8000)
 * @param {(err, attempt) => boolean} opts.shouldRetry - custom predicate
 * @returns {Promise<T>}
 */
export async function withRetry(fn, opts = {}) {
  const {
    retries     = 3,
    baseDelayMs = 500,
    maxDelayMs  = 8000,
    shouldRetry = (err) => isRetryableError(err),
  } = opts

  let lastError

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err

      if (attempt === retries || !shouldRetry(err)) {
        break
      }

      // Exponential backoff with ±20% jitter
      const base  = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs)
      const jitter = base * 0.2 * (Math.random() * 2 - 1)
      const delay = Math.max(0, Math.round(base + jitter))

      console.warn(`[retry] attempt ${attempt}/${retries} failed: ${err.message}. Retrying in ${delay}ms…`)
      await sleep(delay)
    }
  }

  throw lastError
}

/**
 * Determines if an error is transient and worth retrying.
 */
function isRetryableError(err) {
  const msg = err?.message?.toLowerCase() || ''

  // Network / timeout errors
  if (msg.includes('fetch failed') || msg.includes('econnreset') || msg.includes('enotfound')) return true
  if (msg.includes('timeout') || msg.includes('timed out')) return true

  // HTTP 429 / 503 / 502
  const status = err?.status || err?.statusCode
  if ([429, 502, 503, 504].includes(status)) return true

  // ElevenLabs rate limit
  if (msg.includes('rate limit')) return true

  return false
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

/**
 * Wraps a promise with a timeout.
 * @param {Promise} promise
 * @param {number}  ms      - timeout in milliseconds
 * @param {string}  label   - human-readable label for error messages
 */
export async function withTimeout(promise, ms, label = 'Operation') {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timer)
  }
}
