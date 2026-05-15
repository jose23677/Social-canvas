// ── URL → Text (via allorigins CORS proxy) ───────────────────────────────────
export async function extractFromUrl(url) {
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
  const res = await fetch(proxy)
  if (!res.ok) throw new Error(`No se pudo acceder a la URL: ${res.status}`)
  const data = await res.json()
  if (!data.contents) throw new Error('No se obtuvo contenido de la URL')

  // Strip HTML tags and clean up text
  const text = data.contents
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 4000)

  if (text.length < 100) throw new Error('El contenido de la URL es muy corto o no se pudo leer')
  return { text, source: url }
}

// ── YouTube → Metadata (via oEmbed + ID extraction) ──────────────────────────
export function extractYoutubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export async function extractFromYoutube(url) {
  const videoId = extractYoutubeId(url)
  if (!videoId) throw new Error('URL de YouTube no válida')

  // oEmbed gives title, author, thumbnail
  const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
  if (!oembedRes.ok) throw new Error('No se pudo obtener datos del video de YouTube')
  const oembed = await oembedRes.json()

  return {
    text: `Título: ${oembed.title}\nCanal: ${oembed.author_name}\nURL: ${url}\nVideo ID: ${videoId}`,
    title: oembed.title,
    author: oembed.author_name,
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    videoId,
    source: url,
  }
}

// ── PDF → Text (client-side with basic extraction) ───────────────────────────
export async function extractFromPdf(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        // Basic PDF text extraction without pdfjs (reads raw text streams)
        const buffer = e.target.result
        const bytes = new Uint8Array(buffer)
        let text = ''

        // Extract text between BT/ET markers (basic PDF text extraction)
        const str = Array.from(bytes).map(b => String.fromCharCode(b)).join('')
        const matches = str.match(/\(([^)]{2,200})\)/g) || []
        text = matches
          .map(m => m.slice(1, -1))
          .filter(s => /[a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,}/.test(s))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 4000)

        if (text.length < 50) {
          text = `PDF: ${file.name} — Documento cargado. Usa el título y nombre del archivo como contexto para generar el carrusel.`
        }
        resolve({ text, fileName: file.name, source: 'pdf' })
      } catch (err) {
        reject(new Error('Error al leer el PDF: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsArrayBuffer(file)
  })
}
