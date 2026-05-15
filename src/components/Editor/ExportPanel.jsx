import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Download, FileImage, FileText } from 'lucide-react'
import { FORMATS } from '../../lib/formats'
import { Button } from '../UI'
import { jsPDF } from 'jspdf'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'

export default function ExportPanel({ canvas, format, onClose }) {
  const { t } = useTranslation()
  const [exporting, setExporting] = useState(false)
  const fmt = FORMATS[format]

  const exportAs = async (type) => {
    if (!canvas) return
    setExporting(true)
    try {
      const multiplier = fmt.width / canvas.width
      if (type === 'png' || type === 'jpg') {
        const dataUrl = canvas.toDataURL({
          format: type === 'jpg' ? 'jpeg' : 'png',
          quality: 0.95,
          multiplier,
        })
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        saveAs(blob, `social-canvas-${format}.${type}`)
        toast.success(`Exportado como ${type.toUpperCase()} ✓`)
      } else if (type === 'pdf') {
        const dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.9, multiplier })
        const pdf = new jsPDF({
          orientation: fmt.width >= fmt.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [fmt.width, fmt.height],
        })
        pdf.addImage(dataUrl, 'JPEG', 0, 0, fmt.width, fmt.height)
        pdf.save(`social-canvas-${format}.pdf`)
        toast.success('Exportado como PDF ✓')
      }
    } catch (err) {
      toast.error('Error al exportar: ' + err.message)
    } finally {
      setExporting(false)
      onClose()
    }
  }

  const options = [
    { type: 'png', label: 'PNG', desc: 'Alta calidad, fondo transparente', icon: FileImage },
    { type: 'jpg', label: 'JPG', desc: 'Comprimido, ideal para web', icon: FileImage },
    { type: 'pdf', label: 'PDF', desc: 'Documento vectorial imprimible', icon: FileText },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-500" />
            {t('editor.export')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Exportando en {fmt.width}×{fmt.height}px ({format.toUpperCase()})
          </p>
          {options.map(({ type, label, desc, icon: Icon }) => (
            <button
              key={type}
              onClick={() => exportAs(type)}
              disabled={exporting}
              className="w-full flex items-center gap-4 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
              <Download className="w-4 h-4 text-slate-400 ml-auto" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
