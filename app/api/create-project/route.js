/**
 * app/api/create-project/route.js
 * POST /api/create-project
 *
 * Creates a new Podnova project record.
 * Body: { name, topic, description?, style?, language?, durationMinutes?, userId? }
 * Returns: { project }
 */
import { NextResponse } from 'next/server'
import { rateLimitMiddleware } from '@/lib/backend/rateLimit'
import { validateProjectRequest, sanitizeString } from '@/lib/backend/validate'
import { createProject } from '@/lib/db/projects'

export async function POST(request) {
  // ── Rate limit ─────────────────────────────────────────────────────────────
  const rl = await rateLimitMiddleware(request, 'create-project')
  if (rl) return rl

  // ── Parse + validate ───────────────────────────────────────────────────────
  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const { valid, error: validErr } = validateProjectRequest(body)
  if (!valid) return NextResponse.json({ error: validErr }, { status: 400 })

  const {
    name,
    topic,
    description,
    style            = 'conversational',
    language         = 'English',
    durationMinutes  = 5,
    userId           = 'anonymous',
  } = body

  // ── Create ─────────────────────────────────────────────────────────────────
  try {
    const project = await createProject({
      userId,
      name:            sanitizeString(name),
      topic:           sanitizeString(topic),
      description:     description ? sanitizeString(description) : null,
      style,
      language,
      durationMinutes: Math.min(Math.max(Number(durationMinutes) || 5, 1), 30),
    })

    return NextResponse.json({ success: true, project }, { status: 201 })
  } catch (err) {
    console.error('[/api/create-project]', err)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
