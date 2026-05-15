// ── Pollinations Text API — GRATIS, sin key ──────────────────────────────────
// Docs: https://github.com/pollinations/pollinations/blob/master/APIDOCS.md
const POLLINATIONS_TEXT = 'https://text.pollinations.ai/openai'

const SYSTEM_PROMPT = `Eres un director creativo de élite, experto en:
- Marketing médico-estético premium para Instagram
- Copywriting de alta conversión en español
- Diseño editorial de lujo (nivel Vogue Beauty, Dior, Chanel)
- Psicología del consumidor y persuasión ética
- Medicina estética: botox, rellenos, skincare, PRP, bioestimuladores

Tu tarea es crear el contenido completo y detallado de un carrusel premium de Instagram de 10 slides.

IMPORTANTE: Investiga el tema a fondo, añade datos médicos reales, cifras, estadísticas y detalles específicos que den autoridad. Si el tema es médico, incluye información clínica precisa y actualizada.

ESTRUCTURA EXACTA — devuelve SOLO JSON válido, sin markdown, sin texto extra:

{
  "topic": "título del tema detectado",
  "hook": "frase viral corta (máx 8 palabras)",
  "slides": [
    {
      "id": 1,
      "type": "cover",
      "label": "ETIQUETA BREVE (máx 3 palabras) · UPPERCASE",
      "headline": ["línea 1", "línea 2", "línea 3"],
      "accent": "subtítulo elegante en cursiva",
      "body": null,
      "bullets": null,
      "quote": null,
      "stat": null,
      "imagePrompt": "prompt ultra detallado en inglés para generar imagen AI fotorrealista editorial premium",
      "imageStyle": "photorealistic"
    }
  ],
  "caption": "caption completo para Instagram con hashtags",
  "hashtags": ["hashtag1", "hashtag2"]
}

TIPOS DE SLIDE permitidos: cover | educational | list | myths | timeline | stat | preventive | trust | cta
imageStyle opciones: photorealistic | cinematic | instagram | artistic | illustration

REGLAS DE COPYWRITING:
- Títulos: máx 4 palabras por línea, máximo 3 líneas, impactantes
- Body: párrafos cortos (máx 2-3 frases), lenguaje premium no clínico
- Bullets: máx 4 items, concisos y poderosos
- Quotes: 1 frase memorable, entre comillas, máx 12 palabras
- Stat: número grande + contexto (ej: "15 min · procedimiento completo")
- El slide 1 SIEMPRE es cover con hook viral
- El slide 10 SIEMPRE es CTA con datos de contacto del médico
- Distribuir: 1 cover + 7 educativos/trust/mitos/datos + 1 preventivo/aspiracional + 1 CTA
- Lenguaje: español premium, elegante, nunca informal ni técnico extremo

IMAGE PROMPTS — deben ser ultra específicos:
- Incluir: tipo de toma, iluminación, estilo fotográfico, colores, modelo, ambiente
- Ejemplo: "ultra-realistic editorial portrait 35yo woman natural glowing skin champagne background soft window light Vogue Beauty campaign 85mm f1.4 shallow dof"
- Nunca incluir texto en los prompts de imagen`

// ── Build user prompt ─────────────────────────────────────────────────────────
function buildUserPrompt(topic, extraInfo, tone, brand) {
  const brandCtx = [
    brand.doctor && `Médico: ${brand.doctor}`,
    brand.handle && `Instagram: ${brand.handle}`,
    brand.specialty && `Especialidad: ${brand.specialty}`,
  ].filter(Boolean).join(' · ')

  const toneMap = {
    educational: 'educativo y científico, con datos clínicos reales',
    aspirational: 'aspiracional y de lujo, haciendo desear el tratamiento',
    trust: 'orientado a generar confianza máxima y derribar miedos',
    conversion: 'orientado a conversión directa, urgencia elegante y CTA fuerte',
  }

  return `TEMA DEL CARRUSEL: ${topic}

${extraInfo ? `INFORMACIÓN ADICIONAL DEL CLIENTE: ${extraInfo}` : ''}

${brandCtx ? `MARCA: ${brandCtx}` : ''}

TONO DESEADO: ${toneMap[tone] || toneMap.educational}

INSTRUCCIONES ESPECÍFICAS:
1. Investiga a fondo el tema y añade datos reales, cifras y estadísticas médicas actualizadas
2. Crea 10 slides completos con todo el contenido (headline, body, bullets, quote según el tipo)
3. El hook de la portada debe ser imposible de ignorar en el feed
4. Incluye al menos un slide de mitos/realidad y uno con datos estadísticos
5. El CTA final debe incluir: ${brand.handle || '@tuclínica'} y ${brand.whatsapp ? `WhatsApp: ${brand.whatsapp}` : 'link en bio'}
6. Cada imagePrompt debe ser ultra detallado (mínimo 20 palabras en inglés)
7. Añade datos médicos específicos: porcentajes, tiempos, duraciones, estudios

Genera el JSON completo ahora.`
}

// ── Call Pollinations Text (free) ─────────────────────────────────────────────
async function callPollinations(userMessage) {
  const res = await fetch(POLLINATIONS_TEXT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai-large',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      seed: Math.floor(Math.random() * 99999),
      response_format: { type: 'json_object' },
      private: true,
    }),
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Pollinations text: ${res.status} ${errText.slice(0, 100)}`)
  }
  const data = await res.json()
  // Response is OpenAI-compatible: choices[0].message.content
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('Pollinations no devolvió contenido')
  // Parse JSON from content (may have markdown fences)
  const clean = content.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
  return JSON.parse(clean)
}

// ── Call Claude API ───────────────────────────────────────────────────────────
async function callClaude(userMessage, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  if (!res.ok) throw new Error(`Claude API: ${res.status}`)
  const data = await res.json()
  const text = data.content[0].text
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Claude no devolvió JSON válido')
  return JSON.parse(match[0])
}

// ── Call OpenAI ───────────────────────────────────────────────────────────────
async function callOpenAI(userMessage, apiKey) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4096,
    }),
  })
  if (!res.ok) throw new Error(`OpenAI: ${res.status}`)
  const data = await res.json()
  return JSON.parse(data.choices[0].message.content)
}

// ── Call Groq (free tier — Llama 3.3 70B) ────────────────────────────────────
async function callGroq(userMessage, apiKey) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4096,
      temperature: 0.7,
    }),
  })
  if (!res.ok) throw new Error(`Groq: ${res.status}`)
  const data = await res.json()
  return JSON.parse(data.choices[0].message.content)
}

// ── Convert AI output → internal slide format ─────────────────────────────────
function normalizeAISlides(aiData) {
  const slides = aiData.slides || []
  return slides.map((s, i) => ({
    id: s.id || i + 1,
    type: s.type || 'educational',
    bgColor: s.type === 'myths' || s.type === 'cta' ? '#0C2530' : '#F7F3EE',
    isDark: s.type === 'myths' || s.type === 'cta',
    layout: s.type === 'cover' ? 'split-image-left' : 'text-right-illustration-left',
    imagePrompt: s.imagePrompt || `premium medical aesthetic editorial ${s.type} slide elegant minimal`,
    imageStyle: s.imageStyle || 'photorealistic',
    elements: {
      label: s.label || `SLIDE ${i + 1}`,
      headline: Array.isArray(s.headline) ? s.headline : [s.headline || ''],
      accent: s.accent || null,
      body: s.body || null,
      bullets: s.bullets || null,
      quote: s.quote || null,
      stat: s.stat || null,
      myths: s.myths || null,
      timeline: s.timeline || null,
      benefits: s.benefits || null,
      factors: s.factors || null,
      statNumber: s.statNumber || null,
      statLabel: s.statLabel || null,
      ranges: s.ranges || null,
      ctaInstagram: s.ctaInstagram || null,
      ctaWhatsapp: s.ctaWhatsapp || null,
      trust: s.trust || null,
    },
    aiGenerated: true,
    caption: i === 0 ? aiData.caption : null,
  }))
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function generateCarouselFromPrompt({
  topic,
  extraInfo = '',
  tone = 'educational',
  brand = {},
  aiProvider = 'pollinations',
  apiKey = '',
}) {
  const userMessage = buildUserPrompt(topic, extraInfo, tone, brand)

  let aiData
  try {
    if (aiProvider === 'claude' && apiKey) {
      aiData = await callClaude(userMessage, apiKey)
    } else if (aiProvider === 'openai' && apiKey) {
      aiData = await callOpenAI(userMessage, apiKey)
    } else if (aiProvider === 'groq' && apiKey) {
      aiData = await callGroq(userMessage, apiKey)
    } else {
      aiData = await callPollinations(userMessage)
    }
  } catch (err) {
    throw new Error(`Error generando con ${aiProvider}: ${err.message}`)
  }

  if (!aiData || !Array.isArray(aiData.slides) || aiData.slides.length === 0) {
    throw new Error('La IA no devolvió slides válidos. Intenta de nuevo o usa otro proveedor.')
  }

  const slides = normalizeAISlides(aiData)

  return {
    slides,
    meta: {
      topic: aiData.topic || topic,
      hook: aiData.hook || '',
      caption: aiData.caption || '',
      hashtags: aiData.hashtags || [],
    },
  }
}
