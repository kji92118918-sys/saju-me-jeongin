const PENDING_KEY = 'saju_pending_reading'

export function savePendingReading(reading) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(reading))
}

export function loadPendingReading() {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.result) return null
    return parsed
  } catch {
    return null
  }
}

export function clearPendingReading() {
  sessionStorage.removeItem(PENDING_KEY)
}

/** Split result text near the midpoint at a natural break. */
export function splitReadingPreview(text, ratio = 0.48) {
  const full = String(text ?? '')
  if (!full.trim()) {
    return { preview: '', rest: '' }
  }

  const target = Math.floor(full.length * ratio)
  const windowStart = Math.max(0, target - 80)
  const windowEnd = Math.min(full.length, target + 80)
  const window = full.slice(windowStart, windowEnd)

  const breakCandidates = ['\n\n', '\n', '. ', '? ', '! ', '。', '…']
  let breakAt = -1

  for (const token of breakCandidates) {
    const local = window.lastIndexOf(token)
    if (local !== -1) {
      breakAt = windowStart + local + token.length
      break
    }
  }

  if (breakAt <= 0 || breakAt >= full.length) {
    breakAt = target
  }

  return {
    preview: full.slice(0, breakAt).trimEnd(),
    rest: full.slice(breakAt).trimStart(),
  }
}
