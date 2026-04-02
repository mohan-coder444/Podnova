/**
 * lib/utils.js
 * Shared utility functions across the app.
 */
import { clsx } from 'clsx'

/** Merges Tailwind class names conditionally */
export function cn(...inputs) {
  return clsx(inputs)
}

/** Returns a short relative time string ("2 min ago") */
export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60)   return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60)   return `${min}m ago`
  const hr  = Math.floor(min / 60)
  if (hr  < 24)   return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

/** Generates a consistent placeholder colour from string */
export function stringToColor(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  const hue = Math.abs(hash) % 360
  return `hsl(${hue},65%,60%)`
}

/** Clamps a value between min and max */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

/** Formats seconds into MM:SS */
export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Truncates text to n characters */
export function truncate(text = '', n = 100) {
  return text.length > n ? text.slice(0, n) + '…' : text
}

/** Validates env vars are present; throws loudly in dev */
export function requireEnv(key) {
  const val = process.env[key]
  if (!val && process.env.NODE_ENV !== 'test') {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return val
}

/** Generic API error response helper */
export function apiError(res, status, message) {
  return res.status(status).json({ success: false, error: message })
}

/** Generic API success response helper */
export function apiSuccess(res, data) {
  return res.status(200).json({ success: true, ...data })
}
