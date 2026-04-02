/**
 * lib/ai/mistral.js
 * Mistral API integration for podcast script generation.
 * Handles prompt engineering, retries, and structured output.
 */
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'

/**
 * Generates a structured podcast script from a user prompt.
 * @param {string} topic - The user's podcast topic/prompt
 * @param {object} options - { duration, style, language }
 * @returns {{ title, description, script, segments }}
 */
export async function generatePodcastScript(topic, options = {}) {
  const {
    duration = 5,      // minutes
    style = 'conversational',
    language = 'English',
  } = options

  const systemPrompt = `You are an expert podcast scriptwriter. Create engaging, professional podcast scripts.
Your output must be valid JSON with this exact structure:
{
  "title": "Episode title",
  "description": "2-sentence episode description",
  "segments": [
    { "id": 1, "type": "intro", "speaker": "Host", "text": "..." },
    { "id": 2, "type": "main", "speaker": "Host", "text": "..." },
    { "id": 3, "type": "outro", "speaker": "Host", "text": "..." }
  ],
  "estimated_duration_minutes": ${duration},
  "keywords": ["keyword1", "keyword2"]
}`

  const userMessage = `Create a ${duration}-minute ${style} podcast episode in ${language} about: "${topic}".
The script should be engaging, informative, and well-paced. Include a strong intro hook, valuable content, and a clear outro with a call-to-action.`

  const response = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mistral-medium-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`Mistral API error ${response.status}: ${err?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) throw new Error('Empty response from Mistral')

  return JSON.parse(content)
}
