/**
 * app/api/merge-audio/route.js
 * POST /api/merge-audio
 *
 * Step 4 — Fetches all segment audio files for a project, merges them
 * into a single MP3, uploads to InsForge Storage, records final audio_file.
 *
 * Body: { projectId }
 * Returns: { audioFile }  (the merged/final file record)
 */
import { NextResponse } from 'next/server'
import { rateLimitMiddleware } from '@/lib/backend/rateLimit'
import { parseUUID } from '@/lib/backend/validate'
import { getAudioFiles, createAudioFile, updateProject } from '@/lib/db/projects'
import getInsforgeClient from '@/lib/insforge'

export const maxDuration = 120

const BUCKET   = 'podcast-audio'
const BASE_URL = process.env.INSFORGE_BASE_URL

export async function POST(request) {
  // ── Rate limit ─────────────────────────────────────────────────────────────
  const rl = await rateLimitMiddleware(request, 'merge-audio')
  if (rl) return rl

  // ── Parse ──────────────────────────────────────────────────────────────────
  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const projectId = parseUUID(body?.projectId)
  if (!projectId) {
    return NextResponse.json({ error: 'projectId must be a valid UUID' }, { status: 400 })
  }

  try {
    // ── Load segment files ───────────────────────────────────────────────────
    const segments = await getAudioFiles(projectId, 'segment')

    if (!segments?.length) {
      return NextResponse.json({ error: 'No audio segments found for this project. Run /api/generate-audio first.' }, { status: 422 })
    }

    // ── Fetch each segment's audio from InsForge Storage ────────────────────
    const buffers = []
    for (const seg of segments) {
      try {
        const res = await fetch(seg.public_url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        buffers.push(await res.arrayBuffer())
      } catch (fetchErr) {
        console.error(`Failed to fetch segment ${seg.segment_index}:`, fetchErr)
        // skip failed fetch — partial merge is better than no audio
      }
    }

    if (buffers.length === 0) {
      return NextResponse.json({ error: 'Could not download any audio segments' }, { status: 500 })
    }

    // ── Concatenate buffers (pure-JS MP3 header-compatible merge) ────────────
    const merged    = _concatBuffers(buffers)
    const sizeBytes = merged.byteLength

    // ── Upload merged file ───────────────────────────────────────────────────
    const db       = getInsforgeClient()
    const fileName = `projects/${projectId}/final.mp3`
    const blob     = new Blob([merged], { type: 'audio/mpeg' })

    const { error: uploadErr } = await db.storage
      .from(BUCKET)
      .upload(fileName, blob, { contentType: 'audio/mpeg', upsert: true })

    if (uploadErr) {
      throw new Error(`Storage upload failed: ${uploadErr.message}`)
    }

    const publicUrl = `${BASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`

    // ── Save final audio_file record ─────────────────────────────────────────
    const audioFile = await createAudioFile({
      projectId,
      type:          'final',
      storageKey:    fileName,
      publicUrl,
      fileSizeBytes: sizeBytes,
    })

    // ── Mark project as done ─────────────────────────────────────────────────
    await updateProject(projectId, {
      status: 'done',
      metadata: { audio_url: publicUrl, audio_size_bytes: sizeBytes },
    })

    return NextResponse.json({ success: true, audioFile })
  } catch (err) {
    console.error('[/api/merge-audio]', err)
    await updateProject(projectId, { status: 'error' }).catch(() => {})
    return NextResponse.json({ error: err.message || 'Audio merge failed' }, { status: 500 })
  }
}

/**
 * Concatenates multiple ArrayBuffers into one.
 * For proper MP3 merging in production, pipe through FFmpeg on a server job.
 */
function _concatBuffers(buffers) {
  const arrays = buffers.map(b => new Uint8Array(b))
  const total  = arrays.reduce((sum, a) => sum + a.length, 0)
  const merged = new Uint8Array(total)
  let offset   = 0
  for (const a of arrays) { merged.set(a, offset); offset += a.length }
  return merged.buffer
}
