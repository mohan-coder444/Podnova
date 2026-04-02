/**
 * lib/db/podcasts.js
 * InsForge database layer for podcast CRUD operations.
 * All queries go through this module — never call InsForge client directly from API routes.
 */
import getInsforgeClient from '../insforge'

const TABLE = 'podcasts'

/**
 * Creates a new podcast job record with 'processing' status.
 * @param {{ userId, topic, options }} data
 * @returns {object} New podcast record
 */
export async function createPodcast({ userId, topic, options = {} }) {
  const db = getInsforgeClient()
  const { data, error } = await db.database
    .from(TABLE)
    .insert([{
      user_id: userId,
      topic,
      options: JSON.stringify(options),
      status: 'processing',
      created_at: new Date().toISOString(),
    }])
    .select()

  if (error) throw new Error(`DB insert failed: ${error.message}`)
  return data[0]
}

/**
 * Updates a podcast record with script, audio URL, or error.
 * @param {string} id - Podcast UUID
 * @param {object} updates - Fields to update
 */
export async function updatePodcast(id, updates) {
  const db = getInsforgeClient()
  const { error } = await db.database
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(`DB update failed: ${error.message}`)
}

/**
 * Fetches a single podcast by ID.
 * @param {string} id
 * @returns {object}
 */
export async function getPodcast(id) {
  const db = getInsforgeClient()
  const { data, error } = await db.database
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(`DB fetch failed: ${error.message}`)
  return data
}

/**
 * Lists all podcasts for a user, newest first.
 * @param {string} userId
 * @returns {Array}
 */
export async function listPodcasts(userId) {
  const db = getInsforgeClient()
  const { data, error } = await db.database
    .from(TABLE)
    .select('id, topic, status, title, created_at, audio_url, duration_minutes')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(`DB list failed: ${error.message}`)
  return data
}

/**
 * Deletes a podcast record by ID.
 */
export async function deletePodcast(id) {
  const db = getInsforgeClient()
  const { error } = await db.database
    .from(TABLE)
    .delete()
    .eq('id', id)

  if (error) throw new Error(`DB delete failed: ${error.message}`)
}
