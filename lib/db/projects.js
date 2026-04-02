/**
 * lib/db/projects.js
 * InsForge DB layer for projects table.
 */
import getInsforgeClient from '../insforge'

const TABLE = 'projects'

export async function createProject({ userId = 'anonymous', name, topic, description, style, language, durationMinutes }) {
  const db = getInsforgeClient()
  const { data, error } = await db.database
    .from(TABLE)
    .insert([{
      user_id:          userId,
      name:             name.trim(),
      topic:            topic.trim(),
      description:      description?.trim() || null,
      style:            style || 'conversational',
      language:         language || 'English',
      duration_minutes: durationMinutes || 5,
      status:           'draft',
      created_at:       new Date().toISOString(),
      updated_at:       new Date().toISOString(),
    }])
    .select()

  if (error) throw new Error(`DB insert project failed: ${error.message}`)
  return data[0]
}

export async function updateProject(id, updates) {
  const db = getInsforgeClient()
  const { error } = await db.database
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(`DB update project failed: ${error.message}`)
}

export async function getProject(id) {
  const db = getInsforgeClient()
  const { data, error } = await db.database
    .from(TABLE).select('*').eq('id', id).single()
  if (error) throw new Error(`DB fetch project failed: ${error.message}`)
  return data
}

export async function listProjects(userId, { limit = 20, offset = 0 } = {}) {
  const db = getInsforgeClient()
  const { data, error, count } = await db.database
    .from(TABLE)
    .select('id, name, topic, status, duration_minutes, style, thumbnail_url, tags, created_at, updated_at', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) throw new Error(`DB list projects failed: ${error.message}`)
  return { projects: data, total: count }
}

export async function deleteProject(id) {
  const db = getInsforgeClient()
  const { error } = await db.database.from(TABLE).delete().eq('id', id)
  if (error) throw new Error(`DB delete project failed: ${error.message}`)
}

// ── Scripts sub-table helpers ──────────────────────────────────────────────

export async function createScript({ projectId, rawScript, scriptJson, title, description, keywords, wordCount, estimatedMinutes, modelUsed }) {
  const db = getInsforgeClient()

  // Auto-increment version
  const { data: existing } = await db.database
    .from('scripts')
    .select('version')
    .eq('project_id', projectId)
    .order('version', { ascending: false })
    .limit(1)

  const version = (existing?.[0]?.version || 0) + 1

  const { data, error } = await db.database
    .from('scripts')
    .insert([{
      project_id:         projectId,
      version,
      raw_script:         rawScript,
      script_json:        scriptJson,
      title,
      description,
      keywords:           keywords || [],
      word_count:         wordCount,
      estimated_minutes:  estimatedMinutes,
      model_used:         modelUsed || 'mistral-medium-latest',
      status:             'draft',
      created_at:         new Date().toISOString(),
      updated_at:         new Date().toISOString(),
    }])
    .select()

  if (error) throw new Error(`DB insert script failed: ${error.message}`)
  return data[0]
}

export async function updateScript(id, updates) {
  const db = getInsforgeClient()
  const { error } = await db.database
    .from('scripts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(`DB update script failed: ${error.message}`)
}

export async function getScript(id) {
  const db = getInsforgeClient()
  const { data, error } = await db.database
    .from('scripts').select('*').eq('id', id).single()
  if (error) throw new Error(`DB fetch script failed: ${error.message}`)
  return data
}

export async function getLatestScript(projectId) {
  const db = getInsforgeClient()
  const { data, error } = await db.database
    .from('scripts')
    .select('*')
    .eq('project_id', projectId)
    .order('version', { ascending: false })
    .limit(1)
    .single()
  if (error) throw new Error(`DB fetch latest script failed: ${error.message}`)
  return data
}

// ── Audio files sub-table helpers ──────────────────────────────────────────

export async function createAudioFile({ projectId, scriptId, type, segmentIndex, segmentText, voiceId, storageKey, publicUrl, fileSizeBytes, durationSeconds }) {
  const db = getInsforgeClient()
  const { data, error } = await db.database
    .from('audio_files')
    .insert([{
      project_id:       projectId,
      script_id:        scriptId || null,
      type,
      segment_index:    segmentIndex ?? null,
      segment_text:     segmentText || null,
      voice_id:         voiceId || null,
      storage_key:      storageKey,
      public_url:       publicUrl,
      file_size_bytes:  fileSizeBytes || null,
      duration_seconds: durationSeconds || null,
      status:           'ready',
      created_at:       new Date().toISOString(),
    }])
    .select()
  if (error) throw new Error(`DB insert audio_file failed: ${error.message}`)
  return data[0]
}

export async function getAudioFiles(projectId, type) {
  const db = getInsforgeClient()
  let q = db.database
    .from('audio_files')
    .select('*')
    .eq('project_id', projectId)
    .order('segment_index', { ascending: true })
  if (type) q = q.eq('type', type)
  const { data, error } = await q
  if (error) throw new Error(`DB fetch audio_files failed: ${error.message}`)
  return data
}
