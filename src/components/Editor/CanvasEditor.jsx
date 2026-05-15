import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import * as fabric from 'fabric'
import { useStore } from '../../store/useStore'
import { FORMATS, getDisplayDimensions, FONTS, FONT_WEIGHTS } from '../../lib/formats'
import { Button, Select, ColorPicker, Slider, Tabs, cn } from '../UI'
import { Type, ImageIcon, Square, Circle, Trash2, Copy, ChevronUp, ChevronDown, Download, Wand2, Upload, LayoutGrid } from 'lucide-react'
import toast from 'react-hot-toast'
import AIImagePanel from './AIImagePanel'
import ExportPanel from './ExportPanel'

export default function CanvasEditor() {
  const { t } = useTranslation()
  const canvasRef = useRef(null)
  const fabricRef = useRef(null)
  const fileInputRef = useRef(null)
  const {
    currentFormat, setFormat,
    slides, currentSlide, setCurrentSlide, addSlide, saveCurrentSlide, removeSlide,
    studioSlides, clearStudioSlides,
  } = useStore()

  const [activeTab, setActiveTab] = useState('layers')
  const [selected, setSelected] = useState(null)
  const [textProps, setTextProps] = useState({
    fontFamily: 'Inter', fontSize: 36, fontWeight: 'normal',
    fill: '#000000', textAlign: 'left', charSpacing: 0, opacity: 100,
  })
  const [bgColor, setBgColor] = useState('#ffffff')
  const [layers, setLayers] = useState([])
  const [showAI, setShowAI] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [loadingStudio, setLoadingStudio] = useState(false)

  const dims = getDisplayDimensions(currentFormat, 480)

  // ── Load studio slide into canvas ────────────────────────────────────────
  const loadStudioSlide = useCallback(async (canvas, slideData) => {
    if (!slideData || !canvas) return
    setLoadingStudio(true)
    try {
      // 1. Set background color
      const bgC = slideData.isDark ? (slideData.palette?.bg || '#0C2530') : (slideData.palette?.bg || '#F7F3EE')
      canvas.set('backgroundColor', bgC)
      setBgColor(bgC)

      // 2. Load background image
      if (slideData.imageUrl) {
        try {
          const img = await fabric.FabricImage.fromURL(slideData.imageUrl, { crossOrigin: 'anonymous' })
          // Scale to cover the canvas
          const scaleX = dims.width / img.width
          const scaleY = dims.height / img.height
          const scale = Math.max(scaleX, scaleY)
          img.set({
            scaleX: scale,
            scaleY: scale,
            left: (dims.width - img.width * scale) / 2,
            top: (dims.height - img.height * scale) / 2,
            opacity: slideData.isDark ? 0.25 : 0.35,
            selectable: false,
            evented: false,
            name: 'background-image',
          })
          canvas.add(img)
          canvas.sendObjectToBack(img)
        } catch { /* image load failed, skip */ }
      }

      // 3. Add gradient overlay
      const overlayRect = new fabric.Rect({
        left: 0, top: 0, width: dims.width, height: dims.height,
        fill: slideData.isDark
          ? `rgba(${hexToRgb(slideData.palette?.bg || '#0C2530')},0.65)`
          : `rgba(${hexToRgb(slideData.palette?.bg || '#F7F3EE')},0.55)`,
        selectable: false, evented: false, name: 'overlay',
      })
      canvas.add(overlayRect)

      const el = slideData.elements || {}
      const accentColor = slideData.palette?.accent || '#C4A882'
      const textColor = slideData.isDark ? (slideData.palette?.white || '#F5F0E8') : (slideData.palette?.text || '#2A2520')

      // 4. Add label (small uppercase tag)
      if (el.label) {
        const labelText = typeof el.label === 'string' ? el.label.split('/')[0].trim() : ''
        if (labelText) {
          const label = new fabric.IText(labelText.toUpperCase(), {
            left: dims.width * 0.08,
            top: dims.height * 0.07,
            fontSize: Math.round(dims.width * 0.022),
            fontFamily: 'Helvetica Neue, Inter, sans-serif',
            fill: accentColor,
            fontWeight: '400',
            charSpacing: 200,
            selectable: true,
          })
          canvas.add(label)
        }
      }

      // 5. Add accent line
      const line = new fabric.Rect({
        left: dims.width * 0.08,
        top: dims.height * 0.14,
        width: dims.width * 0.08,
        height: 1,
        fill: accentColor,
        selectable: false, evented: false,
      })
      canvas.add(line)

      // 6. Add headline (each line as IText)
      const headlines = Array.isArray(el.headline) ? el.headline : [el.headline].filter(Boolean)
      const headlineFontSize = Math.round(dims.width * (headlines.length > 2 ? 0.075 : 0.085))
      let headlineTop = dims.height * 0.17

      for (const line of headlines) {
        if (!line) continue
        const ht = new fabric.IText(line, {
          left: dims.width * 0.08,
          top: headlineTop,
          fontSize: headlineFontSize,
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fill: textColor,
          fontWeight: '600',
          lineHeight: 1.1,
          selectable: true,
        })
        canvas.add(ht)
        headlineTop += headlineFontSize * 1.2
      }

      // 7. Add accent/subtitle
      if (el.accent && typeof el.accent === 'string') {
        const sub = new fabric.IText(el.accent.slice(0, 60), {
          left: dims.width * 0.08,
          top: headlineTop + dims.height * 0.02,
          fontSize: Math.round(dims.width * 0.032),
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fill: accentColor,
          fontStyle: 'italic',
          selectable: true,
        })
        canvas.add(sub)
        headlineTop += dims.height * 0.06
      }

      // 8. Add body text (first 120 chars)
      if (el.body && typeof el.body === 'string') {
        const bodyStr = el.body.slice(0, 120) + (el.body.length > 120 ? '…' : '')
        const bodyText = new fabric.Textbox(bodyStr, {
          left: dims.width * 0.08,
          top: Math.min(headlineTop + dims.height * 0.03, dims.height * 0.62),
          width: dims.width * 0.84,
          fontSize: Math.round(dims.width * 0.028),
          fontFamily: 'Inter, Helvetica Neue, sans-serif',
          fill: slideData.isDark ? textColor + 'CC' : textColor + 'DD',
          lineHeight: 1.5,
          fontWeight: '300',
          selectable: true,
        })
        canvas.add(bodyText)
      }

      // 9. Add bullet points (max 4)
      if (Array.isArray(el.bullets) && el.bullets.length) {
        const bulletY = Math.min(headlineTop + dims.height * 0.04, dims.height * 0.58)
        el.bullets.slice(0, 4).forEach((b, i) => {
          const bt = new fabric.IText(`· ${b.slice(0, 50)}`, {
            left: dims.width * 0.08,
            top: bulletY + i * dims.height * 0.065,
            fontSize: Math.round(dims.width * 0.026),
            fontFamily: 'Inter, Helvetica Neue, sans-serif',
            fill: slideData.isDark ? textColor + 'CC' : textColor + 'DD',
            fontWeight: '300',
            selectable: true,
          })
          canvas.add(bt)
        })
      }

      // 10. Add quote
      if (el.quote && typeof el.quote === 'string') {
        const qY = dims.height * 0.75
        const qt = new fabric.IText(`"${el.quote.slice(0, 80)}"`, {
          left: dims.width * 0.08,
          top: qY,
          fontSize: Math.round(dims.width * 0.03),
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fill: accentColor,
          fontStyle: 'italic',
          width: dims.width * 0.84,
          selectable: true,
        })
        canvas.add(qt)
      }

      // 11. Bottom accent line
      const bottomLine = new fabric.Rect({
        left: dims.width * 0.08,
        top: dims.height * 0.88,
        width: dims.width * 0.06,
        height: 1.5,
        fill: accentColor,
        selectable: false, evented: false,
      })
      canvas.add(bottomLine)

      // 12. Handle / doctor info (bottom)
      const handleStr = el.handle || el.ctaInstagram || el.doctor || ''
      if (handleStr) {
        const handle = new fabric.IText(handleStr.slice(0, 30), {
          left: dims.width * 0.18,
          top: dims.height * 0.884,
          fontSize: Math.round(dims.width * 0.022),
          fontFamily: 'Helvetica Neue, Inter, sans-serif',
          fill: accentColor,
          fontWeight: '400',
          charSpacing: 80,
          selectable: true,
        })
        canvas.add(handle)
      }

      canvas.renderAll()
      syncLayers()
      toast.success(`Slide ${currentSlide + 1} cargado ✓`)
    } catch (err) {
      console.error('Error loading studio slide:', err)
    } finally {
      setLoadingStudio(false)
    }
  }, [dims, currentSlide])

  // ── Init fabric canvas ───────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return
    if (fabricRef.current) fabricRef.current.dispose()

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: dims.width,
      height: dims.height,
      backgroundColor: bgColor,
      preserveObjectStacking: true,
    })
    fabricRef.current = canvas

    const savedJson = slides[currentSlide]
    const studioSlide = studioSlides?.[currentSlide]

    if (savedJson) {
      // Load previously saved canvas JSON
      canvas.loadFromJSON(savedJson, () => canvas.renderAll())
    } else if (studioSlide) {
      // Load studio slide with images + text
      loadStudioSlide(canvas, studioSlide)
    }

    canvas.on('selection:created', (e) => { if (e.selected?.length) setSelected(e.selected[0]) })
    canvas.on('selection:updated', (e) => { if (e.selected?.length) setSelected(e.selected[0]) })
    canvas.on('selection:cleared', () => setSelected(null))
    canvas.on('object:modified', syncLayers)
    canvas.on('object:added', syncLayers)
    canvas.on('object:removed', syncLayers)

    syncLayers()
    return () => canvas.dispose()
  }, [currentFormat, currentSlide])

  const syncLayers = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const objs = canvas.getObjects().map((o, i) => ({
      id: i,
      type: o.type,
      label: o.type === 'i-text' ? (o.text?.slice(0, 16) || 'Text')
        : o.name === 'background-image' ? '🖼 Imagen'
        : o.name === 'overlay' ? '◻ Overlay'
        : o.type,
    }))
    setLayers([...objs].reverse())
  }, [])

  // ── Update text props when selecting ────────────────────────────────────
  useEffect(() => {
    if (!selected) return
    if (selected.type === 'i-text' || selected.type === 'text' || selected.type === 'textbox') {
      setTextProps({
        fontFamily: selected.fontFamily || 'Inter',
        fontSize: selected.fontSize || 36,
        fontWeight: selected.fontWeight || 'normal',
        fill: selected.fill || '#000000',
        textAlign: selected.textAlign || 'left',
        charSpacing: selected.charSpacing || 0,
        opacity: Math.round((selected.opacity || 1) * 100),
      })
    }
  }, [selected])

  const applyTextProp = (key, val) => {
    if (!selected) return
    const actualVal = key === 'opacity' ? val / 100 : val
    selected.set(key, actualVal)
    fabricRef.current.renderAll()
    setTextProps((p) => ({ ...p, [key]: val }))
  }

  const addText = () => {
    const text = new fabric.IText('Escribe aquí', {
      left: dims.width / 2 - 100, top: dims.height / 2 - 20,
      fontFamily: 'Inter', fontSize: 36, fill: '#000000', editable: true,
    })
    fabricRef.current.add(text)
    fabricRef.current.setActiveObject(text)
    fabricRef.current.renderAll()
  }

  const addRect = () => {
    const rect = new fabric.Rect({ left: 80, top: 80, width: 200, height: 120, fill: '#6366f1', rx: 8, ry: 8, opacity: 0.85 })
    fabricRef.current.add(rect)
    fabricRef.current.setActiveObject(rect)
    fabricRef.current.renderAll()
  }

  const addCircle = () => {
    const circle = new fabric.Circle({ left: 100, top: 100, radius: 60, fill: '#a855f7' })
    fabricRef.current.add(circle)
    fabricRef.current.setActiveObject(circle)
    fabricRef.current.renderAll()
  }

  const deleteSelected = () => {
    const active = fabricRef.current.getActiveObject()
    if (active) { fabricRef.current.remove(active); fabricRef.current.renderAll(); setSelected(null) }
  }

  const duplicateSelected = () => {
    const active = fabricRef.current.getActiveObject()
    if (!active) return
    active.clone().then((cloned) => {
      cloned.set({ left: (active.left || 0) + 20, top: (active.top || 0) + 20 })
      fabricRef.current.add(cloned)
      fabricRef.current.setActiveObject(cloned)
      fabricRef.current.renderAll()
    })
  }

  const moveLayer = (dir) => {
    const active = fabricRef.current.getActiveObject()
    if (!active) return
    if (dir === 'up') fabricRef.current.bringObjectForward(active)
    else fabricRef.current.sendObjectBackwards(active)
    fabricRef.current.renderAll()
    syncLayers()
  }

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => addImageToCanvas(ev.target.result)
    reader.readAsDataURL(file)
  }

  const addImageToCanvas = (url) => {
    fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
      const scale = Math.min(dims.width / img.width, dims.height / img.height, 0.8)
      img.scale(scale)
      img.set({ left: (dims.width - img.width * scale) / 2, top: (dims.height - img.height * scale) / 2 })
      fabricRef.current.add(img)
      fabricRef.current.setActiveObject(img)
      fabricRef.current.renderAll()
    })
  }

  const handleBgColor = (color) => {
    setBgColor(color)
    fabricRef.current.set('backgroundColor', color)
    fabricRef.current.renderAll()
  }

  const saveSlide = useCallback(() => {
    const json = fabricRef.current.toJSON()
    saveCurrentSlide(json)
    toast.success(t('editor.save') + ' ✓')
  }, [saveCurrentSlide, t])

  const clearCanvas = () => {
    fabricRef.current.clear()
    fabricRef.current.set('backgroundColor', '#ffffff')
    setBgColor('#ffffff')
    fabricRef.current.renderAll()
    syncLayers()
  }

  const formatOptions = Object.entries(FORMATS).map(([k, v]) => ({
    value: k, label: `${t(`editor.formats.${k}`)} (${v.width}×${v.height})`,
  }))

  const isText = selected?.type === 'i-text' || selected?.type === 'text' || selected?.type === 'textbox'

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Studio slides banner */}
      {studioSlides && (
        <div className="flex items-center justify-between px-4 py-2 text-xs font-medium"
          style={{ background: '#0C2530', color: '#C4AA80' }}>
          <span>✦ Creative Studio — {studioSlides.length} slides cargados. Edita libremente y exporta cuando estés listo.</span>
          <button onClick={clearStudioSlides} className="hover:text-white transition-colors underline">
            Descartar
          </button>
        </div>
      )}

      {/* Top toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-wrap">
        <Select options={formatOptions} value={currentFormat} onChange={setFormat} className="w-52" />
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
        <Button size="sm" variant="secondary" onClick={addText}><Type className="w-4 h-4" />{t('editor.addText')}</Button>
        <Button size="sm" variant="secondary" onClick={addRect}><Square className="w-4 h-4" />{t('editor.addShape')}</Button>
        <Button size="sm" variant="secondary" onClick={addCircle}><Circle className="w-4 h-4" /></Button>
        <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4" />{t('editor.uploadImage')}</Button>
        <Button size="sm" variant="secondary" onClick={() => setShowAI(true)}><Wand2 className="w-4 h-4" />{t('editor.aiImage')}</Button>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
        {selected && (
          <>
            <Button size="icon" variant="ghost" onClick={duplicateSelected}><Copy className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => moveLayer('up')}><ChevronUp className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => moveLayer('down')}><ChevronDown className="w-4 h-4" /></Button>
            <Button size="icon" variant="danger" onClick={deleteSelected}><Trash2 className="w-4 h-4" /></Button>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={saveSlide}>{t('editor.save')}</Button>
          <Button size="sm" onClick={() => setShowExport(true)}><Download className="w-4 h-4" />{t('editor.export')}</Button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 flex flex-col items-center justify-start overflow-auto bg-slate-100 dark:bg-slate-900 p-6 gap-4">
          {/* Carousel slide tabs */}
          {slides.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              {slides.map((_, i) => (
                <button key={i}
                  onClick={() => { saveSlide(); setCurrentSlide(i) }}
                  className={cn('px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                    currentSlide === i ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50')}>
                  {studioSlides?.[i]?.elements?.label
                    ? studioSlides[i].elements.label.split('/')[0].trim().slice(0, 10)
                    : `${t('editor.slide')} ${i + 1}`}
                </button>
              ))}
              <Button size="sm" variant="secondary" onClick={addSlide}>+ {t('editor.addSlide')}</Button>
            </div>
          )}
          {slides.length === 1 && (
            <Button size="sm" variant="ghost" onClick={addSlide}>+ {t('editor.addSlide')}</Button>
          )}

          {/* Loading overlay */}
          {loadingStudio && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
              <div className="text-white text-sm flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Cargando slide...
              </div>
            </div>
          )}

          {/* Canvas */}
          <div className="shadow-2xl rounded-xl overflow-hidden relative">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Right panel */}
        <aside className="w-72 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden shrink-0">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <Tabs
              tabs={[{ value: 'layers', label: t('editor.layers') }, { value: 'style', label: t('editor.typography') }]}
              active={activeTab}
              onChange={setActiveTab}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {activeTab === 'layers' && (
              <>
                <ColorPicker label={t('editor.bgColor')} value={bgColor} onChange={handleBgColor} />
                <div className="space-y-1">
                  {layers.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-8">Agrega elementos al canvas</p>
                  )}
                  {layers.map((l) => (
                    <div key={l.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                      onClick={() => {
                        const objs = fabricRef.current?.getObjects()
                        const obj = objs?.[objs.length - 1 - layers.findIndex(x => x.id === l.id)]
                        if (obj) { fabricRef.current.setActiveObject(obj); fabricRef.current.renderAll() }
                      }}>
                      <span className="text-slate-400 text-xs w-4">{l.id + 1}</span>
                      <span className="capitalize text-xs text-slate-500 w-14 shrink-0">{l.type}</span>
                      <span className="flex-1 truncate text-xs">{l.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'style' && (
              <div className="space-y-4">
                {isText ? (
                  <>
                    <Select
                      label={t('editor.font')}
                      options={FONTS.map((f) => ({ value: f, label: f }))}
                      value={textProps.fontFamily}
                      onChange={(v) => applyTextProp('fontFamily', v)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label">{t('editor.size')}</label>
                        <input type="number" value={textProps.fontSize} min={8} max={200}
                          onChange={(e) => applyTextProp('fontSize', +e.target.value)}
                          className="input" />
                      </div>
                      <Select label={t('editor.weight')} options={FONT_WEIGHTS} value={textProps.fontWeight}
                        onChange={(v) => applyTextProp('fontWeight', v)} />
                    </div>
                    <Slider label={t('editor.spacing')} value={textProps.charSpacing}
                      min={-100} max={500} step={10}
                      onChange={(v) => applyTextProp('charSpacing', v)} />
                    <ColorPicker label={t('editor.color')} value={textProps.fill}
                      onChange={(v) => applyTextProp('fill', v)} />
                    <div>
                      <label className="label">{t('editor.align')}</label>
                      <div className="flex gap-1">
                        {['left', 'center', 'right'].map((a) => (
                          <button key={a} onClick={() => applyTextProp('textAlign', a)}
                            className={cn('flex-1 py-1 text-xs rounded-lg border transition-colors',
                              textProps.textAlign === a ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400')}>
                            {a === 'left' ? '⇤' : a === 'center' ? '⇔' : '⇥'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Slider label={t('editor.opacity')} value={textProps.opacity} min={0} max={100}
                      onChange={(v) => applyTextProp('opacity', v)} />
                  </>
                ) : selected ? (
                  <div className="space-y-3">
                    <Slider label={t('editor.opacity')} value={Math.round((selected.opacity || 1) * 100)}
                      min={0} max={100}
                      onChange={(v) => { selected.set('opacity', v / 100); fabricRef.current.renderAll() }} />
                    {(selected.type === 'rect' || selected.type === 'circle') && (
                      <ColorPicker label={t('editor.color')} value={selected.fill || '#000000'}
                        onChange={(v) => { selected.set('fill', v); fabricRef.current.renderAll() }} />
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-8">
                    Selecciona un elemento para editar sus propiedades
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-200 dark:border-slate-700">
            <Button size="sm" variant="ghost" className="w-full text-red-500" onClick={clearCanvas}>
              <Trash2 className="w-4 h-4" /> {t('editor.clear')}
            </Button>
          </div>
        </aside>
      </div>

      {showAI && <AIImagePanel onClose={() => setShowAI(false)} onAddToCanvas={addImageToCanvas} />}
      {showExport && <ExportPanel canvas={fabricRef.current} format={currentFormat} onClose={() => setShowExport(false)} />}
    </div>
  )
}

// Helper: convert hex to "r,g,b" string for rgba()
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
