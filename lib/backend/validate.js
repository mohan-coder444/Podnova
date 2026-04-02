/**
 * lib/backend/validate.js
 * Input validation helpers for all API routes.
 * Returns { valid: boolean, error?: string }
 */

const ALLOWED_STYLES = ['conversational', 'educational', 'storytelling', 'interview', 'documentary']
const ALLOWED_LANGS  = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Portuguese', 'Japanese']

/**
 * Sanitizes a string — trims, collapses whitespace, strips control chars.
 */
export function sanitizeString(str = '') {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\x00-\x1F\x7F]/g, '') // strip control chars
    .slice(0, 5000) // hard cap
}

/**
 * Validates the /generate-script request body.
 */
export function validateScriptRequest(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be JSON' }
  }

  const { topic, duration, style, language } = body

  if (!topic || typeof topic !== 'string' || topic.trim().length < 5) {
    return { valid: false, error: 'topic must be at least 5 characters' }
  }
  if (topic.trim().length > 500) {
    return { valid: false, error: 'topic must be under 500 characters' }
  }
  if (duration !== undefined) {
    const d = Number(duration)
    if (isNaN(d) || d < 1 || d > 30) {
      return { valid: false, error: 'duration must be between 1 and 30 minutes' }
    }
  }
  if (style !== undefined && !ALLOWED_STYLES.includes(style)) {
    return { valid: false, error: `style must be one of: ${ALLOWED_STYLES.join(', ')}` }
  }
  if (language !== undefined && !ALLOWED_LANGS.includes(language)) {
    return { valid: false, error: `language must be one of: ${ALLOWED_LANGS.join(', ')}` }
  }

  return { valid: true }
}

/**
 * Validates the /generate-audio request body.
 */
export function validateAudioRequest(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be JSON' }
  }

  const { scriptId, voiceId } = body

  if (!scriptId || typeof scriptId !== 'string') {
    return { valid: false, error: 'scriptId is required' }
  }
  // Basic UUID check
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRe.test(scriptId)) {
    return { valid: false, error: 'scriptId must be a valid UUID' }
  }
  if (voiceId !== undefined && typeof voiceId !== 'string') {
    return { valid: false, error: 'voiceId must be a string' }
  }

  return { valid: true }
}

/**
 * Validates /create-project body.
 */
export function validateProjectRequest(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be JSON' }
  }

  const { name, topic } = body

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { valid: false, error: 'name must be at least 2 characters' }
  }
  if (name.trim().length > 100) {
    return { valid: false, error: 'name must be under 100 characters' }
  }
  if (!topic || typeof topic !== 'string' || topic.trim().length < 5) {
    return { valid: false, error: 'topic must be at least 5 characters' }
  }

  return { valid: true }
}

/**
 * Returns a validated UUID or null.
 */
export function parseUUID(str) {
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return str && uuidRe.test(str) ? str : null
}
