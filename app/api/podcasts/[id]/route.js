/**
 * app/api/podcasts/[id]/route.js
 * GET /api/podcasts/:id — get single podcast
 */
import { NextResponse } from 'next/server'
import { getPodcast } from '@/lib/db/podcasts'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const podcast = await getPodcast(id)
    return NextResponse.json({ success: true, podcast })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
