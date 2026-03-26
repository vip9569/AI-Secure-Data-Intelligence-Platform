const BASE = import.meta.env.VITE_SERVER_URL || '/api'

export async function analyzeText(inputType, content, options) {
  const res = await fetch(`${BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input_type: inputType, content, options }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Analysis failed')
  return data
}

export async function analyzeFile(file, options) {
  const form = new FormData()
  form.append('file', file)
  form.append('mask', options.mask)
  form.append('block_high_risk', options.block_high_risk)
  form.append('log_analysis', options.log_analysis)

  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Upload failed')
  return data
}

export async function fetchHistory() {
  const res = await fetch(`${BASE}/history`)
  if (!res.ok) return []
  return res.json()
}
