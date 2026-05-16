// ── Silent AI Provider Manager ────────────────────────────────────────────────
// Tries multiple providers automatically. Never shows raw errors to users.

import { generatePollinationsUrl } from './aiProviders'

const PROVIDERS_ORDER = ['pollinations_a', 'pollinations_b']

// Generate image with automatic fallback
export async function generateImageSafe(prompt, style = 'photorealistic', width = 820, height = 1024) {
  const seeds = [Math.floor(Math.random() * 999999), Math.floor(Math.random() * 999999)]
  const models = ['flux', 'turbo']
  const styleMap = {
    photorealistic: 'photorealistic ultra detailed 8k sharp focus',
    luxury: 'luxury editorial photography Vogue quality champagne lighting ultra premium',
    cinematic: 'cinematic photography dramatic lighting film grain anamorphic',
    illustration: 'clean illustration vector style graphic design minimal',
    instagram: 'instagram aesthetic lifestyle warm golden tones professional editorial',
    artistic: 'digital art vibrant colors artistic creative painterly',
  }
  const full = `${prompt}, ${styleMap[style] || styleMap.photorealistic}`

  for (let i = 0; i < 2; i++) {
    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(full)}?model=${models[i]}&width=${width}&height=${height}&seed=${seeds[i]}&nologo=true&enhance=true`
      return url
    } catch {
      continue
    }
  }
  // Final fallback: return a URL that will be attempted on load
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=${width}&height=${height}&seed=1&nologo=true`
}

// Generate text carousel with automatic fallback chain
export async function generateTextSafe(userMessage, apiKey = '', provider = 'instant') {
  const errors = []

  // 1. Groq (if key provided)
  if (provider === 'groq' && apiKey) {
    try {
      return await callGroq(userMessage, apiKey)
    } catch (e) { errors.push(`Groq: ${e.message}`) }
  }

  // 2. Claude (if key provided)
  if (provider === 'claude' && apiKey) {
    try {
      return await callClaude(userMessage, apiKey)
    } catch (e) { errors.push(`Claude: ${e.message}`) }
  }

  // 3. OpenAI (if key provided)
  if (provider === 'openai' && apiKey) {
    try {
      return await callOpenAI(userMessage, apiKey)
    } catch (e) { errors.push(`OpenAI: ${e.message}`) }
  }

  // 4. Pollinations (free fallback)
  if (provider === 'pollinations' || !apiKey) {
    try {
      return await callPollinations(userMessage)
    } catch (e) {
      errors.push(`Pollinations: ${e.message}`)
      // 5. Retry Pollinations with different model
      try {
        return await callPollinations(userMessage, 'mistral')
      } catch (e2) { errors.push(`Pollinations/mistral: ${e2.message}`) }
    }
  }

  throw new Error('No pudimos conectar con ningún proveedor de IA. Usa el modo Instantáneo.')
}

async function callGroq(msg, key) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: msg }], response_format: { type: 'json_object' }, max_tokens: 4096, temperature: 0.7 }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  const d = await res.json()
  return JSON.parse(d.choices[0].message.content)
}

async function callClaude(msg, key) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 4096, messages: [{ role: 'user', content: msg }] }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  const d = await res.json()
  const text = d.content[0].text
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON')
  return JSON.parse(m[0])
}

async function callOpenAI(msg, key) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: msg }], response_format: { type: 'json_object' }, max_tokens: 4096 }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  const d = await res.json()
  return JSON.parse(d.choices[0].message.content)
}

async function callPollinations(msg, model = 'openai') {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: msg }], response_format: { type: 'json_object' }, private: true }),
    })
    if (res.ok) {
      const d = await res.json()
      const content = d?.choices?.[0]?.message?.content
      if (!content) throw new Error('empty')
      const clean = content.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
      return JSON.parse(clean)
    }
    if (attempt === 1) await new Promise(r => setTimeout(r, 2000))
  }
  throw new Error('unavailable')
}
