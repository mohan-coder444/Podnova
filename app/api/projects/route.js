/**
 * app/api/projects/route.js
 * GET  /api/projects?userId=&limit=&offset=  → list projects
 * DELETE /api/projects?id=                   → delete project
 */
import { NextResponse } from 'next/server'
import { rateLimitMiddleware } from '@/lib/backend/rateLimit'
import { parseUUID } from '@/lib/backend/validate'
import { listProjects, deleteProject, getProject } from '@/lib/db/projects'

export async function GET(request) {
  const rl = await rateLimitMiddleware(request, 'default')
  if (rl) return rl

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') || 'anonymous'
  const limit  = Math.min(Math.max(Number(searchParams.get('limit'))  || 20, 1), 100)
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0)

  try {
    const { projects, total } = await listProjects(userId, { limit, offset })
    return NextResponse.json({
      success: true,
      projects,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    })
  } catch (err) {
    console.error('[GET /api/projects]', err)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function DELETE(request) {
  const rl = await rateLimitMiddleware(request, 'default')
  if (rl) return rl

  const { searchParams } = new URL(request.url)
  const id = parseUUID(searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'Invalid or missing project id' }, { status: 400 })

  try {
    await deleteProject(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/projects]', err)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
