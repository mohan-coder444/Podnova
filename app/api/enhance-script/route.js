/**
 * app/api/enhance-script/route.js
 * POST /api/enhance-script
 *
 * Step 2 of pipeline — HuggingFace enhancement pass.
 * Body: { scriptId }
 * Returns: { script } with enhanced_script populated
 */
import { NextResponse } from 'next/server'
import { rateLimitMiddleware } from '@/lib/backend/rateLimit'
import { parseUUID } from '@/lib/backend/validate'
import { enhanceAllSegments } from '@/lib/ai/huggingface'
import { getScript, updateScript } from '@/lib/db/projects'

export const maxDuration = 120

export async function POST(request) {
  const rl = await rateLimitMiddleware(request, 'enhance-script')
  if (rl) return rl

  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const scriptId = parseUUID(body?.scriptId)
  if (!scriptId) return NextResponse.json({ error: 'scriptId must be a valid UUID' }, { status: 400 })

  try {
    // Fetch existing script
    const script = await getScript(scriptId)
    if (!script) return NextResponse.json({ error: 'Script not found' }, { status: 404 })

    const scriptJson = typeof script.script_json === 'string'
      ? JSON.parse(script.script_json)
      : script.script_json

    if (!scriptJson?.segments?.length) {
      return NextResponse.json({ error: 'Script has no segments to enhance' }, { status: 422 })
    }

    // Enhance all segments in parallel (with graceful fallback per segment)
    const enhancedSegments = await enhanceAllSegments(scriptJson.segments)
    const enhancedText     = enhancedSegments.map(s => s.text).join('\n\n')

    // Persist enhanced version
    await updateScript(scriptId, {
      enhanced_script: enhancedText,
      script_json:     { ...scriptJson, segments: enhancedSegments },
      status:          'enhanced',
    })

    const updatedScript = await getScript(scriptId)
    return NextResponse.json({ success: true, script: updatedScript })
  } catch (err) {
    console.error('[/api/enhance-script]', err)
    return NextResponse.json({ error: 'Script enhancement failed. Original script is preserved.' }, { status: 500 })
  }
}
