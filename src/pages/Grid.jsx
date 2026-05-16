import { useState, useRef, useCallback } from 'react'
import { Upload, Download, Grid3x3, RefreshCw, X } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'

const PRESETS = [
  { label: '3×3', rows: 3, cols: 3, desc: '9 posts · mosaico clásico', hot: true },
  { label: '1×3', rows: 1, cols: 3, desc: '3 posts · panorámico' },
  { label: '2×3', rows: 2, cols: 3, desc: '6 posts · galería' },
  { label: '3×1', rows: 3, cols: 1, desc: '3 posts · columna' },
  { label: '4×3', rows: 4, cols: 3, desc: '12 posts · mega-mosaico' },
  { label: '1×2', rows: 1, cols: 2, desc: '2 posts · díptico' },
]

async function splitImage(img, rows, cols) {
  const tW = Math.floor(img.naturalWidth / cols)
  const tH = Math.floor(img.naturalHeight / rows)
  const tiles = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const canvas = document.createElement('canvas')
      canvas.width = tW; canvas.height = tH
      canvas.getContext('2d').drawImage(img, c * tW, r * tH, tW, tH, 0, 0, tW, tH)
      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.95))
      const thumb = canvas.toDataURL('image/jpeg', 0.5)
      const total = rows * cols
      tiles.push({ blob, thumb, row: r, col: c, index: r * cols + c, postOrder: total - (r * cols + c) })
    }
  }
  return tiles
}

export default function Grid() {
  const [image, setImage] = useState(null)
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [tiles, setTiles] = useState([])
  const [splitting, setSplitting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const imgRef = useRef(null)
  const fileRef = useRef(null)

  const loadFile = (file) => {
    if (!file?.type.startsWith('image/')) return toast.error('Solo imágenes JPG, PNG o WEBP')
    if (file.size > 20 * 1024 * 1024) return toast.error('Máximo 20MB')
    const reader = new FileReader()
    reader.onload = e => { setImage({ src: e.target.result, name: file.name.replace(/\.[^.]+$/, '') }); setTiles([]) }
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e) => { e.preventDefault(); setDragging(false); loadFile(e.dataTransfer.files[0]) }, [])

  const split = async () => {
    if (!imgRef.current || !image) return
    setSplitting(true); setTiles([])
    try {
      const t = await splitImage(imgRef.current, rows, cols)
      setTiles(t); toast.success(`${rows * cols} tiles listos`)
    } catch (e) { toast.error(e.message) }
    finally { setSplitting(false) }
  }

  const download = async () => {
    if (!tiles.length) return
    setDownloading(true)
    try {
      const zip = new JSZip()
      const folder = zip.folder(`${image.name}_instagram`)
      const sorted = [...tiles].sort((a, b) => a.postOrder - b.postOrder)
      for (const t of sorted) {
        folder.file(`post_${String(t.postOrder).padStart(2,'0')}_r${t.row+1}c${t.col+1}.jpg`, t.blob)
      }
      folder.file('ORDEN.txt',
        `Publicar en este orden:\n${sorted.map(t => `${t.postOrder}. Fila ${t.row+1} · Columna ${t.col+1}`).join('\n')}\n\nEl post #1 se publica PRIMERO y aparece al final del feed.`
      )
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${image.name}_${cols}x${rows}.zip`)
      toast.success('ZIP descargado ✓')
    } catch (e) { toast.error(e.message) }
    finally { setDownloading(false) }
  }

  const total = rows * cols

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 6 }}>Grid Maker</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Divide tu imagen en tiles para Instagram. Descarga el ZIP con el orden de publicación.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* Left: upload + preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!image ? (
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `1.5px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 16, padding: '60px 24px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer',
                background: dragging ? 'var(--accent-d)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.15s', minHeight: 280,
              }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--accent-d)', border: '1px solid var(--accent-b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Arrastra tu imagen aquí</p>
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>JPG · PNG · WEBP · máx. 20MB</p>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img ref={imgRef} src={image.src} alt="" style={{ width: '100%', display: 'block', maxHeight: 480, objectFit: 'contain' }} crossOrigin="anonymous" />
                {/* Grid overlay */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(to right, rgba(232,184,122,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(232,184,122,0.5) 1px, transparent 1px)`, backgroundSize: `${100/cols}% ${100/rows}%`, pointerEvents: 'none' }} />
                <button onClick={() => { setImage(null); setTiles([]) }}
                  style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} />
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8, textAlign: 'center' }}>{cols}×{rows} = {total} tiles</p>
            </div>
          )}

          {/* Tiles result */}
          {tiles.length > 0 && (
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Tiles generados <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> — número = orden de publicación</span></p>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6 }}>
                {tiles.map((t, i) => (
                  <div key={i} style={{ borderRadius: 8, overflow: 'hidden', aspectRatio: '1', position: 'relative', border: '1px solid var(--border)' }}>
                    <img src={t.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 4, left: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(10,10,10,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--accent)' }}>
                      {t.postOrder}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Presets */}
          <div className="card" style={{ padding: 18 }}>
            <p className="label">Presets</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => { setRows(p.rows); setCols(p.cols); setTiles([]) }}
                  style={{
                    padding: '9px 10px', borderRadius: 8, border: `1px solid ${rows === p.rows && cols === p.cols ? 'var(--accent-b)' : 'var(--border)'}`,
                    background: rows === p.rows && cols === p.cols ? 'var(--accent-d)' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', position: 'relative',
                  }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: rows === p.rows && cols === p.cols ? 'var(--accent)' : 'var(--text)' }}>{p.label}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{p.desc}</p>
                  {p.hot && <span style={{ position: 'absolute', top: 4, right: 4, fontSize: 8, background: 'var(--accent)', color: '#1A0F00', borderRadius: 99, padding: '1px 5px', fontWeight: 700 }}>✦</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Custom */}
          <div className="card" style={{ padding: 18 }}>
            <p className="label">Personalizado</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['Columnas', cols, c => { setCols(c); setTiles([]) }, 1, 6], ['Filas', rows, r => { setRows(r); setTiles([]) }, 1, 6]].map(([label, val, set, min, max]) => (
                <div key={label}>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>{label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => val > min && set(val - 1)}
                      style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>−</button>
                    <span style={{ fontSize: 18, fontWeight: 700, flex: 1, textAlign: 'center' }}>{val}</span>
                    <button onClick={() => val < max && set(val + 1)}
                      style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <button className="btn btn-primary" onClick={split} disabled={!image || splitting}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: 10, fontSize: 14 }}>
            {splitting ? <><span className="spinner spinner-sm" /> Dividiendo...</> : <><Grid3x3 size={15} /> Dividir imagen</>}
          </button>

          <button className="btn btn-ghost" onClick={download} disabled={!tiles.length || downloading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: 10, fontSize: 14 }}>
            {downloading ? <><span className="spinner spinner-sm" /> Generando ZIP...</> : <><Download size={15} /> Descargar ZIP ({total} tiles)</>}
          </button>

          {/* Info */}
          <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--border)', fontSize: 12 }}>
            <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>Cómo publicar</p>
            <ol style={{ paddingLeft: 16, color: 'var(--text-3)', lineHeight: 1.8 }}>
              <li>Divide y descarga el ZIP</li>
              <li>Publica el <strong style={{ color: 'var(--accent)' }}>tile #1</strong> primero</li>
              <li>El #1 aparecerá en el extremo derecho/inferior del feed</li>
              <li>Espera entre publicaciones</li>
            </ol>
          </div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
    </div>
  )
}
