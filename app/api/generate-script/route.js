/**
 * app/api/generate-script/route.js
 * POST /api/generate-script
 *
 * Step 1 of pipeline — generates Mistral script and stores in DB.
 * Body: { projectId, topic, duration?, style?, language? }
 * Returns: { script }
 */
import { NextResponse } from 'next/server'
import { rateLimitMiddleware } from '@/lib/backend/rateLimit'
import { validateScriptRequest, sanitizeString, parseUUID } from '@/lib/backend/validate'
import { generatePodcastScript } from '@/lib/ai/mistral'
import { createScript, updateProject } from '@/lib/db/projects'

export const maxDuration = 120  // 2 min

export async function POST(request) {
  // ── Rate limit ─────────────────────────────────────────────────────────────
  const rl = await rateLimitMiddleware(request, 'generate-script')
  if (rl) return rl

  // ── Parse + validate ───────────────────────────────────────────────────────
  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const { valid, error: validErr } = validateScriptRequest(body)
  if (!valid) return NextResponse.json({ error: validErr }, { status: 400 })

  const {
    projectId,
    topic,
    duration  = 5,
    style     = 'conversational',
    language  = 'English',
  } = body

  const pid = parseUUID(projectId)
  if (!pid) return NextResponse.json({ error: 'projectId must be a valid UUID' }, { status: 400 })

  // ── Generate ───────────────────────────────────────────────────────────────
  try {
    // Mark project as generating
    await updateProject(pid, { status: 'generating' })

    const scriptData = await generatePodcastScript(sanitizeString(topic), { duration, style, language })

    // Count words
    const allText  = scriptData.segments.map(s => s.text).join(' ')
    const wordCount = allText.split(/\s+/).length

    const script = await createScript({
      projectId:        pid,
      rawScript:        allText,
      scriptJson:       scriptData,
      title:            scriptData.title,
      description:      scriptData.description,
      keywords:         scriptData.keywords || [],
      wordCount,
      estimatedMinutes: scriptData.estimated_duration_minutes || duration,
      modelUsed:        'mistral-medium-latest',
    })

    // Update project with title
    await updateProject(pid, {
      name:             scriptData.title || body.name,
      status:           'draft',
      duration_minutes: scriptData.estimated_duration_minutes || duration,
    })

    return NextResponse.json({ success: true, script }, { status: 201 })
  } catch (err) {
    console.error('[/api/generate-script]', err)
    await updateProject(pid, { status: 'error' }).catch(() => {})

    // Surface user-friendly errors
    if (err.message?.includes('Mistral API error 401')) {
      return NextResponse.json({ error: 'Invalid Mistral API key' }, { status: 502 })
    }
    if (err.message?.includes('timed out')) {
      return NextResponse.json({ error: 'Script generation timed out. Try a shorter duration.' }, { status: 504 })
    }
    return NextResponse.json({ error: 'Script generation failed. Please try again.' }, { status: 500 })
  }
}
