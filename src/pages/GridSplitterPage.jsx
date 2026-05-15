import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Download, Grid, Scissors, RefreshCw, LayoutGrid, Info, CheckCircle, Layers } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Button, Card, cn } from '../components/UI'
import toast from 'react-hot-toast'

// ── Presets ──────────────────────────────────────────────────────────────────
const PRESETS = [
  { label: '3×3', rows: 3, cols: 3, desc: 'Mosaico 9 posts', popular: true },
  { label: '1×3', rows: 1, cols: 3, desc: 'Panorámico 3 posts' },
  { label: '2×3', rows: 2, cols: 3, desc: 'Galería 6 posts' },
  { label: '3×1', rows: 3, cols: 1, desc: 'Columna 3 posts' },
  { label: '4×3', rows: 4, cols: 3, desc: 'Mega-mosaico 12 posts' },
  { label: '1×2', rows: 1, cols: 2, desc: 'Díptico 2 posts' },
]

// Split a loaded image into tiles using Canvas API
async function splitImageToTiles(img, rows, cols) {
  const tileW = Math.floor(img.naturalWidth / cols)
  const tileH = Math.floor(img.naturalHeight / rows)
  const tiles = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const canvas = document.createElement('canvas')
      canvas.width = tileW
      canvas.height = tileH
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, c * tileW, r * tileH, tileW, tileH, 0, 0, tileW, tileH)
      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.95))
      const thumb = canvas.toDataURL('image/jpeg', 0.5)
      // tile index (left-to-right, top-to-bottom) = r*cols + c
      tiles.push({ blob, thumb, row: r, col: c, index: r * cols + c })
    }
  }
  return tiles
}

// Instagram posts left→right, top→bottom but you PUBLISH right→left, bottom→top
function getPostingOrder(tiles, rows, cols) {
  // Reverse: last tile to post first shows up at bottom-right of feed
  const total = rows * cols
  return tiles.map(t => ({
    ...t,
    postOrder: total - t.index, // post order 1 = first to publish = bottom-right tile
  }))
}

export default function GridSplitterPage() {
  const [image, setImage] = useState(null)   // { src, naturalWidth, naturalHeight, name }
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [tiles, setTiles] = useState([])
  const [splitting, setSplitting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [showOrder, setShowOrder] = useState(true)
  const [showFeedPreview, setShowFeedPreview] = useState(false)
  const imgRef = useRef(null)
  const fileRef = useRef(null)

  const loadImage = (file) => {
    if (!file || !file.type.startsWith('image/')) return toast.error('Solo se aceptan imágenes JPG, PNG o WEBP')
    if (file.size > 20 * 1024 * 1024) return toast.error('Tamaño máximo: 20MB')
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target.result
      setImage({ src, name: file.name.replace(/\.[^.]+$/, '') })
      setTiles([])
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    loadImage(e.dataTransfer.files[0])
  }, [])

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  const splitImage = async () => {
    if (!imgRef.current || !image) return
    setSplitting(true)
    setTiles([])
    try {
      const raw = await splitImageToTiles(imgRef.current, rows, cols)
      setTiles(getPostingOrder(raw, rows, cols))
      toast.success(`¡${rows * cols} tiles listos!`)
    } catch (err) {
      toast.error('Error al dividir: ' + err.message)
    } finally {
      setSplitting(false)
    }
  }

  const downloadZip = async () => {
    if (!tiles.length) return
    setDownloading(true)
    try {
      const zip = new JSZip()
      const folder = zip.folder(`${image?.name || 'grid'}_instagram`)

      // Sort by posting order for ZIP naming
      const sorted = [...tiles].sort((a, b) => a.postOrder - b.postOrder)
      for (const tile of sorted) {
        folder.file(
          `post_${String(tile.postOrder).padStart(2, '0')}_fila${tile.row + 1}_col${tile.col + 1}.jpg`,
          tile.blob
        )
      }

      // Add README
      folder.file('ORDEN_DE_PUBLICACION.txt',
        `INSTRUCCIONES DE PUBLICACIÓN EN INSTAGRAM\n\n` +
        `Publicar en este orden (el post_01 se publica PRIMERO y aparece al final del feed):\n\n` +
        sorted.map(t => `  ${t.postOrder}. post_${String(t.postOrder).padStart(2,'0')} → Fila ${t.row+1}, Columna ${t.col+1}`).join('\n') +
        `\n\nNota: Instagram muestra los posts de más nuevo a más viejo.\n` +
        `Para que el mosaico se vea bien, publica de derecha a izquierda y de abajo a arriba.`
      )

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${image?.name || 'instagram_grid'}_${cols}x${rows}.zip`)
      toast.success('ZIP descargado ✓')
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setDownloading(false)
    }
  }

  const reset = () => { setImage(null); setTiles([]) }

  const total = rows * cols

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F3EE] to-white dark:from-slate-900 dark:to-slate-800">

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-[#E8D5BE] dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-15 bg-gradient-to-br from-[#C4A882] to-[#E8D5BE] -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C4A882]/15 border border-[#C4A882]/30 text-[#8C6B4A] dark:text-[#C4A882] text-xs font-medium uppercase tracking-widest mb-5">
            <Grid className="w-3.5 h-3.5" />
            Instagram Grid Maker
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-[#2A2520] dark:text-white leading-tight mb-3"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Divide tu imagen en un<br />
            <em className="text-[#C4A882]">mosaico perfecto para Instagram</em>
          </h1>
          <p className="text-[#7A746E] dark:text-slate-400 max-w-xl mx-auto">
            Sube tu imagen, elige el grid, previsualiza en tiempo real y descarga todos los tiles numerados en orden de publicación.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-[#7A746E] dark:text-slate-400 flex-wrap">
            {['Sin registro · 100% gratis', 'ZIP con orden de publicación', 'Preview de feed incluido', 'JPG · PNG · WEBP hasta 20MB'].map(t => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#C4A882]" />{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

          {/* ── Left: Upload + Preview ── */}
          <div className="space-y-5">

            {!image ? (
              /* Upload zone */
              <div
                onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                onClick={() => fileRef.current?.click()}
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed cursor-pointer transition-all min-h-[380px] group',
                  dragging
                    ? 'border-[#C4A882] bg-[#C4A882]/10 scale-[1.01]'
                    : 'border-[#E8D5BE] dark:border-slate-700 hover:border-[#C4A882]/60 hover:bg-[#F7F3EE] dark:hover:bg-slate-800/50'
                )}
              >
                <div className={cn('w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all',
                  dragging ? 'bg-[#C4A882] scale-110' : 'bg-[#F0EAE0] dark:bg-slate-700 group-hover:bg-[#E8D5BE]')}>
                  <Upload className={cn('w-8 h-8 transition-colors', dragging ? 'text-white' : 'text-[#C4A882]')} />
                </div>
                <p className="text-lg font-semibold text-[#2A2520] dark:text-white mb-1"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                  {dragging ? 'Suelta tu imagen aquí' : 'Arrastra tu imagen aquí'}
                </p>
                <p className="text-sm text-[#7A746E] dark:text-slate-400">o haz clic para seleccionar desde tu dispositivo</p>
                <p className="text-xs text-[#7A746E]/60 dark:text-slate-500 mt-2">JPG · PNG · WEBP · Máx. 20MB</p>

                {/* Grid lines decoration */}
                <div className="absolute inset-6 opacity-5 pointer-events-none"
                  style={{ backgroundImage: 'linear-gradient(to right, #C4A882 1px, transparent 1px), linear-gradient(to bottom, #C4A882 1px, transparent 1px)', backgroundSize: '33.33% 33.33%' }} />
              </div>
            ) : (
              /* Image preview with grid overlay */
              <div className="space-y-3">
                <div className="relative inline-block w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-800">
                  <img ref={imgRef} src={image.src} alt="Preview"
                    className="w-full block"
                    style={{ maxHeight: '520px', objectFit: 'contain' }}
                    crossOrigin="anonymous" />

                  {/* Grid overlay */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(196,168,130,0.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(196,168,130,0.7) 1px, transparent 1px)`,
                      backgroundSize: `${100 / cols}% ${100 / rows}%`,
                    }} />

                  {/* Tile numbering overlay */}
                  {showOrder && tiles.length > 0 && (
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
                      {tiles.map((t) => (
                        <div key={t.index} className="flex flex-col items-center justify-center gap-0.5">
                          <div className="w-7 h-7 rounded-full bg-[#0C2530]/80 backdrop-blur-sm flex items-center justify-center shadow-lg border border-[#C4A882]/40">
                            <span className="text-[#C4A882] text-[10px] font-bold">{t.postOrder}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reset button */}
                  <button onClick={reset}
                    className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-1.5 text-slate-500 hover:text-red-500 transition-colors shadow-lg">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#7A746E] dark:text-slate-400">
                  <button onClick={() => setShowOrder(!showOrder)}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors',
                      showOrder ? 'border-[#C4A882] bg-[#C4A882]/10 text-[#8C6B4A] dark:text-[#C4A882]' : 'border-slate-200 dark:border-slate-700')}>
                    <Info className="w-3 h-3" />
                    Orden de publicación
                  </button>
                  <button onClick={() => setShowFeedPreview(!showFeedPreview)}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors',
                      showFeedPreview ? 'border-[#C4A882] bg-[#C4A882]/10 text-[#8C6B4A] dark:text-[#C4A882]' : 'border-slate-200 dark:border-slate-700')}>
                    <LayoutGrid className="w-3 h-3" />
                    Preview de feed
                  </button>
                  <span className="ml-auto">{image.name} · {cols}×{rows} = {total} posts</span>
                </div>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => loadImage(e.target.files[0])} />

            {/* Feed preview */}
            {showFeedPreview && tiles.length > 0 && (
              <FeedPreview tiles={tiles} rows={rows} cols={cols} />
            )}

            {/* Tiles grid result */}
            {tiles.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#2A2520] dark:text-white"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                    {total} tiles generados
                  </h3>
                  <span className="text-xs text-[#7A746E] dark:text-slate-400">
                    Número = orden de publicación (1 = publicar primero)
                  </span>
                </div>
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                  {tiles.map((t) => (
                    <div key={t.index} className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-square group">
                      <img src={t.thumb} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 left-1.5">
                        <div className="w-6 h-6 rounded-full bg-[#0C2530]/85 border border-[#C4A882]/50 flex items-center justify-center">
                          <span className="text-[#C4A882] text-[9px] font-bold">{t.postOrder}</span>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-medium">Publicar {t.postOrder}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Controls ── */}
          <div className="space-y-5">

            {/* Presets */}
            <Card className="border-[#E8D5BE] dark:border-slate-700 space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-[#C4A882] mb-3">Presets populares</p>
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map((p) => (
                    <button key={p.label}
                      onClick={() => { setRows(p.rows); setCols(p.cols); setTiles([]) }}
                      className={cn(
                        'relative flex flex-col items-center p-2.5 rounded-xl border-2 transition-all hover:shadow-md',
                        rows === p.rows && cols === p.cols
                          ? 'border-[#C4A882] bg-[#C4A882]/10'
                          : 'border-slate-200 dark:border-slate-700 hover:border-[#C4A882]/40'
                      )}>
                      {p.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] bg-[#C4A882] text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                          Popular
                        </span>
                      )}
                      {/* Mini grid icon */}
                      <div className="mb-1.5" style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${p.cols}, 1fr)`,
                        gap: '2px',
                        width: p.cols <= 3 ? 30 : 36,
                      }}>
                        {Array.from({ length: p.rows * p.cols }).map((_, i) => (
                          <div key={i} className="rounded-[1px]"
                            style={{ height: p.rows <= 2 ? 8 : 6, background: rows === p.rows && cols === p.cols ? '#C4A882' : '#CBD5E1' }} />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-[#2A2520] dark:text-white">{p.label}</span>
                      <span className="text-[9px] text-[#7A746E] dark:text-slate-400 text-center leading-tight">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom controls */}
              <div className="border-t border-[#E8D5BE] dark:border-slate-700 pt-4">
                <p className="text-xs font-medium uppercase tracking-widest text-[#C4A882] mb-3">Personalizado</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Columnas', val: cols, set: (v) => { setCols(v); setTiles([]) }, min: 1, max: 6 },
                    { label: 'Filas', val: rows, set: (v) => { setRows(v); setTiles([]) }, min: 1, max: 6 },
                  ].map(({ label, val, set, min, max }) => (
                    <div key={label}>
                      <p className="text-xs text-[#7A746E] dark:text-slate-400 mb-2">{label}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => val > min && set(val - 1)}
                          className="w-8 h-8 rounded-lg border border-[#E8D5BE] dark:border-slate-600 flex items-center justify-center text-[#2A2520] dark:text-white hover:bg-[#E8D5BE]/50 transition-colors font-bold disabled:opacity-30"
                          disabled={val <= min}>−</button>
                        <span className="flex-1 text-center font-bold text-xl text-[#2A2520] dark:text-white"
                          style={{ fontFamily: 'Cormorant Garamond, serif' }}>{val}</span>
                        <button onClick={() => val < max && set(val + 1)}
                          className="w-8 h-8 rounded-lg border border-[#E8D5BE] dark:border-slate-600 flex items-center justify-center text-[#2A2520] dark:text-white hover:bg-[#E8D5BE]/50 transition-colors font-bold disabled:opacity-30"
                          disabled={val >= max}>+</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grid mini preview */}
                <div className="mt-4 flex items-center gap-3">
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '3px', width: 60 }}>
                    {Array.from({ length: rows * cols }).map((_, i) => (
                      <div key={i} className="rounded-sm bg-[#C4A882]/40" style={{ height: Math.max(60 / rows - 4, 8) }} />
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2A2520] dark:text-white">{cols}×{rows}</p>
                    <p className="text-xs text-[#7A746E] dark:text-slate-400">{total} publicaciones</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={splitImage}
                disabled={!image || splitting}
                className={cn(
                  'w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-medium transition-all shadow-lg',
                  image && !splitting
                    ? 'hover:scale-[1.02] active:scale-[0.98]'
                    : 'opacity-50 cursor-not-allowed'
                )}
                style={{ background: 'linear-gradient(135deg, #0C2530 0%, #1A3A4A 50%, #C4AA80 100%)', color: '#F5F0E8' }}
              >
                {splitting
                  ? <><div className="w-4 h-4 border-2 border-[#C4AA80]/30 border-t-[#C4AA80] rounded-full animate-spin" /> Dividiendo...</>
                  : <><Scissors className="w-4 h-4" /> Dividir imagen en {total} tiles</>
                }
              </button>

              <button
                onClick={downloadZip}
                disabled={!tiles.length || downloading}
                className={cn(
                  'w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-medium border-2 transition-all',
                  tiles.length && !downloading
                    ? 'border-[#C4A882] text-[#8C6B4A] dark:text-[#C4A882] hover:bg-[#C4A882]/10'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
                )}
              >
                {downloading
                  ? <><div className="w-4 h-4 border-2 border-[#C4A882]/30 border-t-[#C4A882] rounded-full animate-spin" /> Generando ZIP...</>
                  : <><Download className="w-4 h-4" /> Descargar ZIP ({total} tiles)</>
                }
              </button>
            </div>

            {/* Instructions */}
            <Card className="border-[#E8D5BE] dark:border-slate-700 bg-[#FDFAF7] dark:bg-slate-900 space-y-3">
              <p className="text-xs font-medium uppercase tracking-widest text-[#C4A882]">Cómo publicar en Instagram</p>
              {[
                { n: '1', t: 'Divide tu imagen', d: 'Sube la foto y haz clic en "Dividir"' },
                { n: '2', t: 'Descarga el ZIP', d: 'Contiene los tiles numerados en orden correcto' },
                { n: '3', t: 'Publica en orden', d: `El tile #1 se publica primero — aparecerá en el extremo ${cols === 1 ? 'inferior' : 'inferior derecho'} del feed` },
                { n: '4', t: 'Espera entre posts', d: 'Publica uno por uno para que el mosaico quede alineado' },
              ].map(({ n, t, d }) => (
                <div key={n} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                    style={{ background: '#C4A882' }}>{n}</div>
                  <div>
                    <p className="text-xs font-semibold text-[#2A2520] dark:text-white">{t}</p>
                    <p className="text-[11px] text-[#7A746E] dark:text-slate-400">{d}</p>
                  </div>
                </div>
              ))}
            </Card>

            {/* Tips */}
            <div className="p-4 rounded-xl bg-[#0C2530] text-[#F5F0E8] space-y-2">
              <p className="text-xs font-medium uppercase tracking-widest text-[#C4AA80]">✦ Tips pro</p>
              <ul className="space-y-1.5">
                {[
                  'Usa imágenes cuadradas o rectangulares para resultados perfectos',
                  'El 3×3 (9 posts) es el mosaico más viral en Instagram',
                  'Publica los tiles con 30-60 segundos de diferencia entre cada uno',
                  'Activa "Preview de feed" para ver cómo se verá en tu perfil',
                ].map((tip, i) => (
                  <li key={i} className="text-[11px] flex gap-2 text-[#C4AA80]/80">
                    <span className="text-[#C4AA80] shrink-0">·</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Feed Preview Component ───────────────────────────────────────────────────
function FeedPreview({ tiles, rows, cols }) {
  // Simulate Instagram profile grid: 3 columns, newest post top-left
  // Posts fill left to right, top to bottom (newest first)
  const sortedByPost = [...tiles].sort((a, b) => a.postOrder - b.postOrder)

  return (
    <Card className="border-[#E8D5BE] dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <LayoutGrid className="w-4 h-4 text-[#C4A882]" />
        <p className="text-sm font-semibold text-[#2A2520] dark:text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Preview de feed Instagram
        </p>
        <span className="text-xs text-[#7A746E] dark:text-slate-400 ml-auto">Así se verá tu perfil</span>
      </div>

      {/* Mock profile header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E8D5BE] dark:border-slate-700">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C4A882]">
          <img src="/Social-canvas/logo-jmc-dark.png" alt="" className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }} />
        </div>
        <div>
          <p className="text-xs font-bold text-[#2A2520] dark:text-white">@drcolmenarez</p>
          <p className="text-[10px] text-[#7A746E] dark:text-slate-400">Medicina Estética</p>
        </div>
      </div>

      {/* 3-column Instagram grid */}
      <div className="grid grid-cols-3 gap-0.5 rounded-lg overflow-hidden">
        {sortedByPost.map((t, i) => (
          <div key={t.index} className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <img src={t.thumb} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
            {i === 0 && (
              <div className="absolute top-1 right-1 bg-[#C4A882] rounded-full w-3 h-3 flex items-center justify-center">
                <span className="text-white text-[6px] font-bold">1</span>
              </div>
            )}
          </div>
        ))}
        {/* Fill empty spots for visual */}
        {Array.from({ length: Math.max(0, (3 - (sortedByPost.length % 3)) % 3) }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square bg-slate-100 dark:bg-slate-800 opacity-30" />
        ))}
      </div>
      <p className="text-[10px] text-[#7A746E] dark:text-slate-400 text-center mt-2">
        El tile marcado con 🔴 es el primero que publicas
      </p>
    </Card>
  )
}
