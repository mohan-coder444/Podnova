/**
 * lib/ai/elevenlabs.js  (v2 — chunking, retries, storage upload)
 * ElevenLabs TTS with automatic text chunking for long segments.
 */
import { withRetry, withTimeout } from '../backend/retry'
import { chunkTextForTTS } from './mistral'

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'
const TTS_TIMEOUT_MS     = 45_000
const RATE_LIMIT_DELAY   = 300  // ms between ElevenLabs calls

export const VOICES = {
  host:   'EXAVITQu4vr4xnSDxMaL',  // Sarah — clear, professional
  expert: 'onwK4e9ZLuTAKqWW03F9',  // Daniel — authoritative
  casual: 'XrExE9yKIg1WjnnlVkGX',  // Matilda — friendly
  news:   'ErXwobaYiN019PkySvjV',  // Antoni — newscaster
}

const DEFAULT_VOICE_SETTINGS = {
  stability:         0.50,
  similarity_boost:  0.75,
  style:             0.30,
  use_speaker_boost: true,
}

/**
 * Converts a single text string to MP3 ArrayBuffer.
 * Handles texts longer than ~500 chars by chunking internally and merging.
 *
 * @param {string}  text
 * @param {string}  voiceId
 * @param {object}  settings   - ElevenLabs voice settings override
 * @returns {ArrayBuffer}
 */
export async function textToSpeech(text, voiceId = VOICES.host, settings = {}) {
  const chunks = chunkTextForTTS(text, 150)

  if (chunks.length === 1) {
    return _ttsRequest(chunks[0], voiceId, settings)
  }

  // Multiple chunks → synthesise sequentially and concat
  const buffers = []
  for (const chunk of chunks) {
    const buf = await _ttsRequest(chunk, voiceId, settings)
    buffers.push(buf)
    await sleep(RATE_LIMIT_DELAY)
  }

  return _concatBuffers(buffers)
}

/**
 * Synthesises all script segments sequentially.
 * Returns array of { segmentId, segmentIndex, text, buffer }
 *
 * @param {Array<{ id, text }>} segments
 * @param {string}              voiceId
 */
export async function synthesizeSegments(segments, voiceId = VOICES.host) {
  const results = []

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (!seg.text?.trim()) continue

    const buffer = await textToSpeech(seg.text, voiceId)
    results.push({
      segmentId:    seg.id,
      segmentIndex: i,
      text:         seg.text,
      buffer,
    })

    if (i < segments.length - 1) await sleep(RATE_LIMIT_DELAY)
  }

  return results
}

// ── Private helpers ──────────────────────────────────────────────────────────

async function _ttsRequest(text, voiceId, settingsOverride) {
  return withRetry(
    () => withTimeout(
      _fetchTTS(text, voiceId, { ...DEFAULT_VOICE_SETTINGS, ...settingsOverride }),
      TTS_TIMEOUT_MS,
      `ElevenLabs TTS (${text.slice(0, 40)}…)`
    ),
    { retries: 3, baseDelayMs: 800 }
  )
}

async function _fetchTTS(text, voiceId, voiceSettings) {
  const res = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key':   process.env.ELEVENLABS_API_KEY,
      'Accept':       'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id:       'eleven_turbo_v2_5',
      voice_settings: voiceSettings,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    const err  = new Error(`ElevenLabs error ${res.status}: ${body.slice(0, 200)}`)
    err.status = res.status
    throw err
  }

  return res.arrayBuffer()
}

/**
 * Concatenates multiple ArrayBuffers into one.
 */
function _concatBuffers(buffers) {
  const arrays = buffers.map(b => new Uint8Array(b))
  const total  = arrays.reduce((sum, a) => sum + a.length, 0)
  const merged = new Uint8Array(total)
  let offset   = 0
  for (const a of arrays) {
    merged.set(a, offset)
    offset += a.length
  }
  return merged.buffer
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
