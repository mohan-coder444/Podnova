/**
 * lib/insforge.js
 * Singleton InsForge SDK client for server-side use.
 * Uses the Admin API key — never expose to the browser.
 */
import { createClient } from '@insforge/sdk'

let _client = null

export function getInsforgeClient() {
  if (_client) return _client
  _client = createClient({
    baseUrl: process.env.INSFORGE_BASE_URL,
    anonKey: process.env.INSFORGE_API_KEY,
  })
  return _client
}

export default getInsforgeClient
