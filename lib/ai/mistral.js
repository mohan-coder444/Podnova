/**
 * lib/ai/mistral.js  (v2 — with retry, timeout, chunking)
 * Mistral API integration for podcast script generation.
 */
import { withRetry, withTimeout } from '../backend/retry'

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'
const TIMEOUT_MS      = 60_000  // 60s

/**
 * Generates a structured podcast script from a user prompt.
 * Retries up to 3 times on transient failures.
 *
 * @param {string} topic
 * @param {{ duration?, style?, language? }} options
 * @returns {{ title, description, segments[], estimated_duration_minutes, keywords[] }}
 */
export async function generatePodcastScript(topic, options = {}) {
  const {
    duration = 5,
    style    = 'conversational',
    language = 'English',
  } = options

  const systemPrompt = `You are an expert podcast scriptwriter. Create engaging, professional podcast scripts.
Output ONLY valid JSON with this exact structure — no markdown, no prose:
{
  "title": "Episode title (max 80 chars)",
  "description": "2-sentence episode description",
  "segments": [
    { "id": 1, "type": "intro",   "speaker": "Host", "text": "..." },
    { "id": 2, "type": "main",    "speaker": "Host", "text": "..." },
    { "id": 3, "type": "main",    "speaker": "Host", "text": "..." },
    { "id": 4, "type": "outro",   "speaker": "Host", "text": "..." }
  ],
  "estimated_duration_minutes": ${duration},
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
Rules:
- Each segment text should be 60-150 words (natural TTS chunk size)
- Do NOT include stage directions or [MUSIC] cues
- Write in ${language}`

  const userMessage = `Create a ${duration}-minute ${style} podcast about: "${topic}".
Strong hook in the intro. Valuable, organized content. Clear outro with call-to-action.`

  return withRetry(
    () => withTimeout(callMistral(systemPrompt, userMessage), TIMEOUT_MS, 'Mistral script generation'),
    { retries: 3, baseDelayMs: 1000 }
  )
}

async function callMistral(systemPrompt, userMessage) {
  const res = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model:           'mistral-medium-latest',
      messages:        [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  },
      ],
      temperature:     0.7,
      max_tokens:      4096,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const error = new Error(`Mistral API error ${res.status}: ${err?.message || 'Unknown error'}`)
    error.status = res.status
    throw error
  }

  const data    = await res.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) throw new Error('Empty response from Mistral API')

  try {
    return JSON.parse(content)
  } catch {
    throw new Error(`Mistral returned invalid JSON: ${content.slice(0, 200)}`)
  }
}

/**
 * Splits large text into TTS-safe chunks (max ~150 words each).
 * Preserves sentence boundaries.
 * @param {string} text
 * @param {number} maxWords
 * @returns {string[]}
 */
export function chunkTextForTTS(text, maxWords = 150) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)  // split on sentence-end punctuation
    .filter(s => s.trim().length > 0)

  const chunks  = []
  let current   = []
  let wordCount = 0

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).length
    if (wordCount + words > maxWords && current.length > 0) {
      chunks.push(current.join(' '))
      current   = [sentence]
      wordCount = words
    } else {
      current.push(sentence)
      wordCount += words
    }
  }

  if (current.length > 0) chunks.push(current.join(' '))
  return chunks
}
