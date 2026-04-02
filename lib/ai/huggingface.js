/**
 * lib/ai/huggingface.js  (v2 — retry, timeout, concurrency cap)
 * HuggingFace Inference API for script enhancement.
 * Processes segments with retry, timeout, and graceful fallback.
 */
import { withRetry, withTimeout } from '../backend/retry'

const HF_API_URL    = 'https://api-inference.huggingface.co/models'
const MODEL         = 'mistralai/Mistral-7B-Instruct-v0.2'
const TIMEOUT_MS    = 30_000
const MAX_PARALLEL  = 3   // cap concurrency to avoid HF rate limits

/**
 * Enhances a single pod script segment for natural speech.
 * Returns original text on any failure (fail-safe).
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function enhanceScript(text) {
  if (!text?.trim()) return text

  const prompt = `<s>[INST] You are a podcast script editor. Rewrite the following podcast script segment to sound more natural, conversational, and engaging for audio delivery. Preserve all facts and key ideas. Remove awkward phrasing. Do NOT add introductions or explanations — output only the rewritten segment text.

Segment: ${text.slice(0, 800)} [/INST]`

  return withRetry(
    () => withTimeout(_hfRequest(prompt, text), TIMEOUT_MS, 'HuggingFace enhance'),
    {
      retries: 2,
      baseDelayMs: 1000,
      shouldRetry: (err) => {
        // Retry on loading (model cold start) or rate limit
        const msg = err?.message?.toLowerCase() || ''
        return msg.includes('loading') || msg.includes('rate limit') || msg.includes('503')
      },
    }
  )
}

async function _hfRequest(prompt, fallbackText) {
  const res = await fetch(`${HF_API_URL}/${MODEL}`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens:   400,
        temperature:      0.5,
        top_p:            0.9,
        return_full_text: false,
      },
      options: {
        wait_for_model: true,  // wait if model is loading (cold start)
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    const err  = new Error(`HuggingFace API error ${res.status}: ${body.slice(0, 200)}`)
    err.status = res.status
    throw err
  }

  const data     = await res.json()
  const enhanced = data?.[0]?.generated_text?.trim()

  // Validate output is meaningful (not empty, not repeated prompt)
  if (!enhanced || enhanced.length < 20) return fallbackText
  if (enhanced.toLowerCase().includes('[inst]')) return fallbackText

  return enhanced
}

/**
 * Batch-enhance all segments with capped concurrency.
 * Falls back to original text per-segment on failure.
 * @param {Array<{ id, type, speaker, text }>} segments
 * @returns {Promise<Array>}
 */
export async function enhanceAllSegments(segments) {
  const results = new Array(segments.length)

  // Process in batches of MAX_PARALLEL
  for (let i = 0; i < segments.length; i += MAX_PARALLEL) {
    const batch = segments.slice(i, i + MAX_PARALLEL)

    const batchResults = await Promise.allSettled(
      batch.map(async (seg) => {
        try {
          const enhanced = await enhanceScript(seg.text)
          return { ...seg, text: enhanced, _enhanced: true }
        } catch {
          return { ...seg, _enhanced: false }  // graceful fallback
        }
      })
    )

    batchResults.forEach((r, j) => {
      results[i + j] = r.status === 'fulfilled' ? r.value : segments[i + j]
    })
  }

  return results
}
