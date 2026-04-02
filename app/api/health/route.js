/**
 * app/api/health/route.js
 * GET /api/health
 * Quick health check — confirms env vars are loaded and DB is reachable.
 */
import { NextResponse } from 'next/server'
import getInsforgeClient from '@/lib/insforge'

export async function GET() {
  const checks = {}

  // Check environment variables
  checks.env = {
    mistral:      !!process.env.MISTRAL_API_KEY && process.env.MISTRAL_API_KEY !== 'your_mistral_api_key_here',
    huggingface:  !!process.env.HUGGINGFACE_API_KEY && !process.env.HUGGINGFACE_API_KEY.includes('your_token'),
    elevenlabs:   !!process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key_here',
    insforge:     !!process.env.INSFORGE_BASE_URL && !!process.env.INSFORGE_API_KEY,
  }

  // Quick DB ping
  try {
    const db = getInsforgeClient()
    const { error } = await db.database.from('podcasts').select('id').limit(1)
    checks.database = error ? { ok: false, error: error.message } : { ok: true }
  } catch (err) {
    checks.database = { ok: false, error: err.message }
  }

  const allEnvOk = Object.values(checks.env).every(Boolean)
  const dbOk     = checks.database?.ok === true

  return NextResponse.json({
    status:  allEnvOk && dbOk ? 'healthy' : 'degraded',
    version: '1.0.0',
    checks,
    timestamp: new Date().toISOString(),
  }, { status: allEnvOk && dbOk ? 200 : 207 })
}
