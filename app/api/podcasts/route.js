/**
 * app/api/podcasts/route.js
 * GET /api/podcasts?userId=xxx  — list podcasts
 * DELETE /api/podcasts?id=xxx   — delete a podcast
 */
import { NextResponse } from 'next/server'
import { listPodcasts, deletePodcast } from '@/lib/db/podcasts'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'anonymous'
    const podcasts = await listPodcasts(userId)
    return NextResponse.json({ success: true, podcasts })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    await deletePodcast(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
