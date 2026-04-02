/**
 * lib/audio/processor.js
 * Audio processing layer — concatenates TTS audio buffers.
 * Runs pure JS in the API route (no native FFmpeg binary needed).
 * For production, swap with a server-side FFmpeg child process.
 */

/**
 * Concatenates multiple MP3 ArrayBuffers into one Uint8Array.
 * Simple byte-level merge (works for MP3 with identical bitrates).
 * @param {ArrayBuffer[]} buffers
 * @returns {Uint8Array}
 */
export function concatenateAudioBuffers(buffers) {
  const arrays = buffers.map(b => new Uint8Array(b))
  const totalLength = arrays.reduce((sum, a) => sum + a.length, 0)
  const merged = new Uint8Array(totalLength)
  let offset = 0
  for (const arr of arrays) {
    merged.set(arr, offset)
    offset += arr.length
  }
  return merged
}

/**
 * Converts Uint8Array to base64 string for JSON transport.
 * @param {Uint8Array} uint8Array
 * @returns {string}
 */
export function toBase64(uint8Array) {
  let binary = ''
  const chunkSize = 8192
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    binary += String.fromCharCode(...uint8Array.slice(i, i + chunkSize))
  }
  return btoa(binary)
}

/**
 * Returns audio size in MB for display.
 * @param {Uint8Array|ArrayBuffer} data
 * @returns {string}
 */
export function formatAudioSize(data) {
  const bytes = data.byteLength || data.length
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}
