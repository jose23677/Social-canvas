// ─── Pollinations AI — GRATIS, sin API key ─────────────────────────────────
// Model: flux → hyper-realistic, state-of-the-art quality
const STYLE_SUFFIX = {
  photorealistic: 'photorealistic, ultra detailed, 8k, sharp focus, professional photography',
  artistic: 'digital art, vibrant colors, artistic, creative, painterly',
  cinematic: 'cinematic photography, dramatic lighting, film grain, anamorphic lens',
  illustration: 'clean illustration, vector style, graphic design, flat design',
  instagram: 'instagram aesthetic, lifestyle, warm golden tones, professional editorial',
  hyperreal: 'hyperrealistic, ultra photographic, medium format camera, skin texture, bokeh',
  luxury: 'luxury editorial photography, Vogue quality, champagne lighting, ultra premium',
}

// Default: flux model for maximum realism
export function generatePollinationsUrl(prompt, style = 'photorealistic', width = 1024, height = 1024, model = 'flux') {
  const seed = Math.floor(Math.random() * 999999)
  const full = `${prompt}, ${STYLE_SUFFIX[style] || STYLE_SUFFIX.photorealistic}`
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(full)}?model=${model}&width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`
}

export function generatePollinationsVariants(prompt, style = 'photorealistic', width = 1024, height = 1024, count = 4, model = 'flux') {
  return Array.from({ length: count }, () => generatePollinationsUrl(prompt, style, width, height, model))
}

// Pre-carga la imagen y devuelve dataURL para evitar problemas CORS en canvas
export async function fetchImageAsDataUrl(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Error cargando imagen: ${res.status}`)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// ─── Stability AI ──────────────────────────────────────────────────────────
export async function generateStability(prompt, style, apiKey) {
  const styleMap = {
    photorealistic: 'photographic',
    artistic: 'digital-art',
    cinematic: 'cinematic',
    illustration: 'comic-book',
  }
  const res = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      samples: 1,
      steps: 30,
      style_preset: styleMap[style] || 'photographic',
    }),
  })
  if (!res.ok) throw new Error(`Stability AI: ${res.status}`)
  const data = await res.json()
  return `data:image/png;base64,${data.artifacts[0].base64}`
}

// ─── Google Imagen ──────────────────────────────────────────────────────────
export async function generateGoogle(prompt, apiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '1:1' },
      }),
    }
  )
  if (!res.ok) throw new Error(`Google Imagen: ${res.status}`)
  const data = await res.json()
  const b64 = data.predictions?.[0]?.bytesBase64Encoded
  if (!b64) throw new Error('No image returned')
  return `data:image/png;base64,${b64}`
}

// ─── Midjourney (via useapi.net proxy) ──────────────────────────────────────
export async function generateMidjourney(prompt, apiKey) {
  const res = await fetch('https://api.useapi.net/v2/jobs/imagine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ prompt, replyUrl: '', replyRef: '' }),
  })
  if (!res.ok) throw new Error(`Midjourney proxy: ${res.status}`)
  const job = await res.json()
  return job.jobid
}

export async function pollMidjourney(jobId, apiKey) {
  const res = await fetch(`https://api.useapi.net/v2/jobs/?jobid=${jobId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error(`Midjourney poll: ${res.status}`)
  const data = await res.json()
  if (data.status === 'completed') return data.attachments?.[0]?.url
  return null
}

// ─── Unsplash ───────────────────────────────────────────────────────────────
export async function searchUnsplash(prompt, apiKey) {
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(prompt)}&per_page=9&orientation=squarish`,
    { headers: { Authorization: `Client-ID ${apiKey}` } }
  )
  if (!res.ok) throw new Error(`Unsplash: ${res.status}`)
  const data = await res.json()
  return data.results.map((p) => ({
    url: p.urls.regular,
    thumb: p.urls.small,
    credit: p.user.name,
  }))
}

// ─── RunwayML ───────────────────────────────────────────────────────────────
export async function generateRunway(prompt, apiKey, duration = 4) {
  const res = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'X-Runway-Version': '2024-11-06',
    },
    body: JSON.stringify({
      promptText: prompt,
      model: 'gen3a_turbo',
      duration,
      ratio: '1280:768',
    }),
  })
  if (!res.ok) throw new Error(`RunwayML: ${res.status}`)
  const data = await res.json()
  return data.id
}

export async function pollRunway(taskId, apiKey) {
  const res = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'X-Runway-Version': '2024-11-06',
    },
  })
  if (!res.ok) throw new Error(`RunwayML poll: ${res.status}`)
  const data = await res.json()
  if (data.status === 'SUCCEEDED') return data.output?.[0]
  if (data.status === 'FAILED') throw new Error('RunwayML generation failed')
  return null
}

// ─── Higgsfield AI ──────────────────────────────────────────────────────────
export async function generateHiggsfield(prompt, apiKey) {
  const res = await fetch('https://api.higgsfield.ai/v1/video/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ prompt, duration: 4, resolution: '720p' }),
  })
  if (!res.ok) throw new Error(`Higgsfield: ${res.status}`)
  const data = await res.json()
  return data.task_id || data.id
}

export async function pollHiggsfield(taskId, apiKey) {
  const res = await fetch(`https://api.higgsfield.ai/v1/video/status/${taskId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error(`Higgsfield poll: ${res.status}`)
  const data = await res.json()
  if (data.status === 'completed') return data.video_url
  if (data.status === 'failed') throw new Error('Higgsfield generation failed')
  return null
}
