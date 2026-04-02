/**
 * lib/ai/elevenlabs.js
 * ElevenLabs Text-to-Speech integration.
 * Converts podcast script segments into audio buffers.
 */
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'

// Default voice IDs from ElevenLabs
export const VOICES = {
  host:   'EXAVITQu4vr4xnSDxMaL',  // Sarah — clear, professional
  expert: 'onwK4e9ZLuTAKqWW03F9',  // Daniel — authoritative
  casual: 'XrExE9yKIg1WjnnlVkGX',  // Matilda — friendly
}

/**
 * Converts a text string to audio (returns ArrayBuffer).
 * @param {string} text - The script text to synthesize
 * @param {string} voiceId - ElevenLabs voice ID
 * @param {object} settings - voice settings override
 * @returns {ArrayBuffer}
 */
export async function textToSpeech(text, voiceId = VOICES.host, settings = {}) {
  const defaultSettings = {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.3,
    use_speaker_boost: true,
    ...settings,
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: defaultSettings,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`ElevenLabs error ${response.status}: ${err}`)
  }

  return response.arrayBuffer()
}

/**
 * Converts all script segments to audio buffers.
 * Processes sequentially to avoid rate limits.
 * @param {Array} segments - Script segments from Mistral
 * @param {string} voiceId - Voice to use
 * @returns {Array<{ segmentId, buffer }>}
 */
export async function synthesizeSegments(segments, voiceId = VOICES.host) {
  const results = []
  for (const segment of segments) {
    const buffer = await textToSpeech(segment.text, voiceId)
    results.push({ segmentId: segment.id, buffer })
    // Small delay to respect rate limits
    await new Promise(r => setTimeout(r, 200))
  }
  return results
}
