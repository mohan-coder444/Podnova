/**
 * lib/ai/huggingface.js
 * Hugging Face Inference API integration for script enhancement.
 * Improves script quality, readability, and natural speech flow.
 */
const HF_API_URL = 'https://api-inference.huggingface.co/models'

/**
 * Enhances a podcast script segment using a HF text model.
 * Makes it more natural-sounding and removes filler text.
 * @param {string} text - Raw script text
 * @returns {string} Enhanced text
 */
export async function enhanceScript(text) {
  const prompt = `Rewrite this podcast script to sound more natural and engaging. 
Keep the same information but improve flow, pacing, and conversational quality.
Remove any awkward phrasing. Make it sound like a real podcast host speaking naturally.

Original: ${text}

Enhanced:`

  const response = await fetch(
    `${HF_API_URL}/mistralai/Mistral-7B-Instruct-v0.2`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 512,
          temperature: 0.6,
          return_full_text: false,
        },
      }),
    }
  )

  if (!response.ok) {
    // If HF fails, return original text (graceful fallback)
    console.error('HuggingFace enhancement failed, using original')
    return text
  }

  const data = await response.json()
  const enhanced = data?.[0]?.generated_text?.trim()
  return enhanced || text
}

/**
 * Batch-enhance all segments of a podcast script.
 * Falls back to original text if enhancement fails.
 * @param {Array} segments
 * @returns {Promise<Array>}
 */
export async function enhanceAllSegments(segments) {
  return Promise.all(
    segments.map(async (seg) => {
      try {
        const enhanced = await enhanceScript(seg.text)
        return { ...seg, text: enhanced }
      } catch {
        return seg // fallback
      }
    })
  )
}
