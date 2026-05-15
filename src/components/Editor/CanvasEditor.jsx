import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import * as fabric from 'fabric'
import { useStore } from '../../store/useStore'
import { FORMATS, getDisplayDimensions, FONTS, FONT_WEIGHTS } from '../../lib/formats'
import { Button, Select, ColorPicker, Slider, Input, Tabs, cn } from '../UI'
import { Type, ImageIcon, Square, Circle, Trash2, Copy, ChevronUp, ChevronDown, Download, Wand2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import AIImagePanel from './AIImagePanel'
import ExportPanel from './ExportPanel'

export default function CanvasEditor() {
  const { t } = useTranslation()
  const canvasRef = useRef(null)
  const fabricRef = useRef(null)
  const fileInputRef = useRef(null)
  const { currentFormat, setFormat, slides, currentSlide, setCurrentSlide, addSlide, saveCurrentSlide, removeSlide } = useStore()

  const [activeTab, setActiveTab] = useState('layers')
  const [selected, setSelected] = useState(null)
  const [textProps, setTextProps] = useState({ fontFamily: 'Inter', fontSize: 36, fontWeight: 'normal', fill: '#000000', textAlign: 'left', charSpacing: 0, opacity: 1 })
  const [bgColor, setBgColor] = useState('#ffffff')
  const [layers, setLayers] = useState([])
  const [showAI, setShowAI] = useState(false)
  const [showExport, setShowExport] = useState(false)

  const dims = getDisplayDimensions(currentFormat, 480)

  // Init fabric canvas
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

    // Load saved slide
    const savedJson = slides[currentSlide]
    if (savedJson) {
      canvas.loadFromJSON(savedJson, () => canvas.renderAll())
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
      label: o.type === 'i-text' ? (o.text?.slice(0, 16) || 'Text') : o.type,
    }))
    setLayers([...objs].reverse())
  }, [])

  // Update selected object props
  useEffect(() => {
    if (!selected) return
    if (selected.type === 'i-text' || selected.type === 'text') {
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
      left: dims.width / 2 - 100,
      top: dims.height / 2 - 20,
      fontFamily: 'Inter',
      fontSize: 36,
      fill: '#000000',
      editable: true,
    })
    fabricRef.current.add(text)
    fabricRef.current.setActiveObject(text)
    fabricRef.current.renderAll()
  }

  const addRect = () => {
    const rect = new fabric.Rect({
      left: 80, top: 80, width: 200, height: 120,
      fill: '#6366f1', rx: 8, ry: 8, opacity: 0.85,
    })
    fabricRef.current.add(rect)
    fabricRef.current.setActiveObject(rect)
    fabricRef.current.renderAll()
  }

  const addCircle = () => {
    const circle = new fabric.Circle({
      left: 100, top: 100, radius: 60, fill: '#a855f7',
    })
    fabricRef.current.add(circle)
    fabricRef.current.setActiveObject(circle)
    fabricRef.current.renderAll()
  }

  const deleteSelected = () => {
    const active = fabricRef.current.getActiveObject()
    if (active) {
      fabricRef.current.remove(active)
      fabricRef.current.renderAll()
      setSelected(null)
    }
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

  const saveSlide = () => {
    const json = fabricRef.current.toJSON()
    saveCurrentSlide(json)
    toast.success(t('editor.save') + ' ✓')
  }

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

  const isText = selected?.type === 'i-text' || selected?.type === 'text'

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Top toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-wrap">
        <Select
          options={formatOptions}
          value={currentFormat}
          onChange={setFormat}
          className="w-52"
        />
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
          {/* Carousel tabs */}
          {slides.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { saveSlide(); setCurrentSlide(i) }}
                  className={cn('px-3 py-1 rounded-lg text-sm font-medium transition-colors', currentSlide === i ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50')}
                >
                  {t('editor.slide')} {i + 1}
                </button>
              ))}
              <Button size="sm" variant="secondary" onClick={addSlide}>+ {t('editor.addSlide')}</Button>
            </div>
          )}
          {slides.length === 1 && (
            <Button size="sm" variant="ghost" onClick={addSlide}>+ {t('editor.addSlide')}</Button>
          )}

          {/* Canvas */}
          <div className="shadow-2xl rounded-xl overflow-hidden">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Right panel */}
        <aside className="w-72 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden shrink-0">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <Tabs
              tabs={[
                { value: 'layers', label: t('editor.layers') },
                { value: 'style', label: t('editor.typography') },
              ]}
              active={activeTab}
              onChange={setActiveTab}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {activeTab === 'layers' && (
              <>
                <div>
                  <ColorPicker label={t('editor.bgColor')} value={bgColor} onChange={handleBgColor} />
                </div>
                <div className="space-y-1">
                  {layers.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-8">
                      Agrega elementos al canvas
                    </p>
                  )}
                  {layers.map((l) => (
                    <div key={l.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                      <span className="text-slate-400 text-xs w-4">{l.id + 1}</span>
                      <span className="capitalize text-xs text-slate-500 w-12">{l.type}</span>
                      <span className="flex-1 truncate">{l.label}</span>
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
                        <input
                          type="number"
                          value={textProps.fontSize}
                          min={8} max={200}
                          onChange={(e) => applyTextProp('fontSize', +e.target.value)}
                          className="input"
                        />
                      </div>
                      <Select
                        label={t('editor.weight')}
                        options={FONT_WEIGHTS}
                        value={textProps.fontWeight}
                        onChange={(v) => applyTextProp('fontWeight', v)}
                      />
                    </div>
                    <Slider
                      label={t('editor.spacing')}
                      value={textProps.charSpacing}
                      min={-100} max={500} step={10}
                      onChange={(v) => applyTextProp('charSpacing', v)}
                    />
                    <ColorPicker
                      label={t('editor.color')}
                      value={textProps.fill}
                      onChange={(v) => applyTextProp('fill', v)}
                    />
                    <div>
                      <label className="label">{t('editor.align')}</label>
                      <div className="flex gap-1">
                        {['left', 'center', 'right'].map((a) => (
                          <button
                            key={a}
                            onClick={() => applyTextProp('textAlign', a)}
                            className={cn('flex-1 py-1 text-xs rounded-lg border transition-colors', textProps.textAlign === a ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400')}
                          >
                            {a === 'left' ? '⇤' : a === 'center' ? '⇔' : '⇥'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Slider
                      label={t('editor.opacity')}
                      value={textProps.opacity}
                      min={0} max={100}
                      onChange={(v) => applyTextProp('opacity', v)}
                    />
                  </>
                ) : selected ? (
                  <div className="space-y-3">
                    <Slider
                      label={t('editor.opacity')}
                      value={Math.round((selected.opacity || 1) * 100)}
                      min={0} max={100}
                      onChange={(v) => {
                        selected.set('opacity', v / 100)
                        fabricRef.current.renderAll()
                      }}
                    />
                    {(selected.type === 'rect' || selected.type === 'circle') && (
                      <ColorPicker
                        label={t('editor.color')}
                        value={selected.fill || '#000000'}
                        onChange={(v) => {
                          selected.set('fill', v)
                          fabricRef.current.renderAll()
                        }}
                      />
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
              <Trash2 className="w-4 h-4" />
              {t('editor.clear')}
            </Button>
          </div>
        </aside>
      </div>

      {showAI && (
        <AIImagePanel
          onClose={() => setShowAI(false)}
          onAddToCanvas={addImageToCanvas}
        />
      )}
      {showExport && (
        <ExportPanel
          canvas={fabricRef.current}
          format={currentFormat}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}
