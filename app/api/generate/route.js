/**
 * app/api/generate/route.js
 * POST /api/generate
 * 
 * Main AI pipeline:
 *  1. Receive topic + options from client
 *  2. Generate script via Mistral
 *  3. Enhance via HuggingFace
 *  4. Synthesize TTS via ElevenLabs (segment by segment)
 *  5. Merge audio buffers
 *  6. Upload to InsForge Storage
 *  7. Save podcast record to InsForge DB
 *  8. Return podcast record to client
 */
import { NextResponse } from 'next/server'
import { generatePodcastScript } from '@/lib/ai/mistral'
import { enhanceAllSegments } from '@/lib/ai/huggingface'
import { synthesizeSegments, VOICES } from '@/lib/ai/elevenlabs'
import { concatenateAudioBuffers, toBase64, formatAudioSize } from '@/lib/audio/processor'
import { createPodcast, updatePodcast } from '@/lib/db/podcasts'
import getInsforgeClient from '@/lib/insforge'

export const maxDuration = 300 // 5 minutes — long AI pipeline

export async function POST(request) {
  let podcastId = null

  try {
    const body = await request.json()
    const { topic, duration = 5, style = 'conversational', voiceId, userId = 'anonymous' } = body

    if (!topic || topic.trim().length < 5) {
      return NextResponse.json({ error: 'Topic must be at least 5 characters' }, { status: 400 })
    }

    // ── 0. Guard: check required API keys are set ─────────────────────────────
    const missingKeys = []
    if (!process.env.MISTRAL_API_KEY     || process.env.MISTRAL_API_KEY.includes('your_'))     missingKeys.push('MISTRAL_API_KEY')
    if (!process.env.ELEVENLABS_API_KEY  || process.env.ELEVENLABS_API_KEY.includes('your_'))  missingKeys.push('ELEVENLABS_API_KEY')
    if (!process.env.INSFORGE_BASE_URL   || !process.env.INSFORGE_API_KEY) missingKeys.push('INSFORGE keys')

    if (missingKeys.length > 0) {
      return NextResponse.json({
        error: `Missing API keys: ${missingKeys.join(', ')}. Add them to .env.local and restart the server.`
      }, { status: 503 })
    }

    // ── 1. Create initial DB record ───────────────────────────────────────────
    const podcast = await createPodcast({ userId, topic, options: { duration, style } })
    podcastId = podcast.id

    // ── 2. Generate script with Mistral ─────────────────────────────────────
    await updatePodcast(podcastId, { status: 'generating_script', step: 'Script generation' })
    const scriptData = await generatePodcastScript(topic, { duration, style })

    // ── 3. Enhance with HuggingFace ──────────────────────────────────────────
    await updatePodcast(podcastId, { status: 'enhancing', step: 'Enhancing script' })
    const enhancedSegments = await enhanceAllSegments(scriptData.segments)

    // ── 4. Text-to-Speech with ElevenLabs ───────────────────────────────────
    await updatePodcast(podcastId, { status: 'synthesizing', step: 'Voice synthesis' })
    const voice = voiceId || VOICES.host
    const audioSegments = await synthesizeSegments(enhancedSegments, voice)

    // ── 5. Merge audio buffers ───────────────────────────────────────────────
    await updatePodcast(podcastId, { status: 'processing_audio', step: 'Audio processing' })
    const merged = concatenateAudioBuffers(audioSegments.map(s => s.buffer))

    // ── 6. Upload to InsForge Storage ────────────────────────────────────────
    await updatePodcast(podcastId, { status: 'uploading', step: 'Uploading audio' })
    const db = getInsforgeClient()
    const fileName = `podcasts/${podcastId}.mp3`
    const blob = new Blob([merged], { type: 'audio/mpeg' })

    const { data: uploadData, error: uploadError } = await db.storage
      .from('podcast-audio')
      .upload(fileName, blob, { contentType: 'audio/mpeg', upsert: true })

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

    const audioUrl = `${process.env.INSFORGE_BASE_URL}/storage/v1/object/public/podcast-audio/${fileName}`

    // ── 7. Update DB with final data ─────────────────────────────────────────
    const scriptText = enhancedSegments.map(s => s.text).join('\n\n')
    await updatePodcast(podcastId, {
      status: 'done',
      step: 'Complete',
      title: scriptData.title,
      description: scriptData.description,
      script: scriptText,
      script_json: JSON.stringify({ ...scriptData, segments: enhancedSegments }),
      audio_url: audioUrl,
      audio_size: formatAudioSize(merged),
      duration_minutes: scriptData.estimated_duration_minutes || duration,
      keywords: scriptData.keywords?.join(',') || '',
    })

    // ── 8. Return result ─────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      podcast: {
        id: podcastId,
        title: scriptData.title,
        description: scriptData.description,
        audio_url: audioUrl,
        script: scriptText,
        duration_minutes: scriptData.estimated_duration_minutes || duration,
        status: 'done',
      },
    })
  } catch (err) {
    console.error('[/api/generate] Pipeline error:', err)
    if (podcastId) {
      await updatePodcast(podcastId, {
        status: 'error',
        error_message: err.message?.slice(0, 500),
      }).catch(() => {})
    }

    // Surface the real error message to the client
    return NextResponse.json(
      { error: err.message || 'Generation failed. Please try again.' },
      { status: 500 }
    )
  }
}
