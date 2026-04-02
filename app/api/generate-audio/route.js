/**
 * app/api/generate-audio/route.js
 * POST /api/generate-audio
 *
 * Step 3 — ElevenLabs TTS per segment, upload each to InsForge Storage,
 * record every file in audio_files table.
 *
 * Body: { scriptId, voiceId? }
 * Returns: { audioFiles: [{ id, segmentIndex, public_url, duration_seconds }] }
 */
import { NextResponse } from 'next/server'
import { rateLimitMiddleware } from '@/lib/backend/rateLimit'
import { validateAudioRequest, parseUUID } from '@/lib/backend/validate'
import { synthesizeSegments, VOICES } from '@/lib/ai/elevenlabs'
import { getScript, createAudioFile, updateProject } from '@/lib/db/projects'
import getInsforgeClient from '@/lib/insforge'

export const maxDuration = 300  // 5 min — long TTS pipeline

const BUCKET      = 'podcast-audio'
const BASE_URL    = process.env.INSFORGE_BASE_URL

export async function POST(request) {
  // ── Rate limit ─────────────────────────────────────────────────────────────
  const rl = await rateLimitMiddleware(request, 'generate-audio')
  if (rl) return rl

  // ── Parse + validate ───────────────────────────────────────────────────────
  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const { valid, error: validErr } = validateAudioRequest(body)
  if (!valid) return NextResponse.json({ error: validErr }, { status: 400 })

  const scriptId = parseUUID(body.scriptId)
  const voiceId  = body.voiceId && Object.values(VOICES).includes(body.voiceId)
    ? body.voiceId
    : VOICES.host

  // ── Load script ────────────────────────────────────────────────────────────
  let script
  try {
    script = await getScript(scriptId)
    if (!script) return NextResponse.json({ error: 'Script not found' }, { status: 404 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load script' }, { status: 500 })
  }

  const scriptJson = typeof script.script_json === 'string'
    ? JSON.parse(script.script_json)
    : script.script_json

  const segments = scriptJson?.segments
  if (!segments?.length) {
    return NextResponse.json({ error: 'Script has no segments' }, { status: 422 })
  }

  // ── TTS + Upload ───────────────────────────────────────────────────────────
  try {
    await updateProject(script.project_id, { status: 'generating' })

    const synthesized = await synthesizeSegments(segments, voiceId)
    const db          = getInsforgeClient()
    const audioFiles  = []

    for (const seg of synthesized) {
      const fileName   = `projects/${script.project_id}/segments/seg_${seg.segmentIndex}.mp3`
      const blob       = new Blob([seg.buffer], { type: 'audio/mpeg' })

      // Upload segment to InsForge Storage
      const { error: uploadErr } = await db.storage
        .from(BUCKET)
        .upload(fileName, blob, { contentType: 'audio/mpeg', upsert: true })

      if (uploadErr) {
        console.error(`Segment ${seg.segmentIndex} upload failed:`, uploadErr)
        continue  // skip failed segment, don't abort whole job
      }

      const publicUrl = `${BASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`
      const sizeBytes = seg.buffer.byteLength || seg.buffer.length || 0

      const audioFile = await createAudioFile({
        projectId:    script.project_id,
        scriptId,
        type:         'segment',
        segmentIndex: seg.segmentIndex,
        segmentText:  seg.text,
        voiceId,
        storageKey:   fileName,
        publicUrl,
        fileSizeBytes: sizeBytes,
      })

      audioFiles.push(audioFile)
    }

    await updateProject(script.project_id, { status: 'draft' })

    return NextResponse.json({ success: true, audioFiles }, { status: 201 })
  } catch (err) {
    console.error('[/api/generate-audio]', err)
    await updateProject(script.project_id, { status: 'error' }).catch(() => {})

    if (err.message?.includes('ElevenLabs error 401')) {
      return NextResponse.json({ error: 'Invalid ElevenLabs API key' }, { status: 502 })
    }
    if (err.message?.includes('timed out')) {
      return NextResponse.json({ error: 'Audio synthesis timed out. Try a shorter script.' }, { status: 504 })
    }
    return NextResponse.json({ error: 'Audio generation failed. Please try again.' }, { status: 500 })
  }
}
