import { useRef, useState } from 'react'

const FILE_TYPES = ['.log', '.txt', '.pdf', '.sql', '.csv', '.json', '.py', '.yaml']
const ACCEPT     = '.txt,.log,.pdf,.doc,.docx,.sql,.csv,.json,.xml,.yaml,.yml,.py,.js,.ts'

export default function FileUploadZone({ onFile, selectedFile, onAnalyze, loading }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef               = useRef()

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <div className="mx-6 mt-6 mb-2">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current.click()}
        onDragEnter={(e) => { e.preventDefault(); setDragOver(true)  }}
        onDragOver={(e)  => { e.preventDefault(); setDragOver(true)  }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false) }}
        onDrop={handleDrop}
        className={`relative rounded-xl border border-dashed p-8 text-center cursor-pointer transition-all
          ${dragOver ? 'border-accent bg-accent/[0.04]' : 'border-white/[0.12] hover:border-accent hover:bg-accent/[0.02]'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
        />

        <div className="w-10 h-10 mx-auto mb-3 rounded-[10px] bg-accent/10 border border-accent/20 flex items-center justify-center text-lg">
          ⬆
        </div>
        <p className="font-display text-sm font-bold text-white mb-1">Drop file or click to upload</p>
        <p className="text-[11px] text-muted mb-4">Max 10MB · Drag &amp; drop supported</p>

        <div className="flex gap-1.5 justify-center flex-wrap">
          {FILE_TYPES.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-bg3 border border-white/[0.07] text-muted font-code">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* File info + button */}
      <div className="flex items-center gap-3 mt-3">
        <span className={`text-[12px] ${selectedFile ? 'text-accent' : 'text-muted'}`}>
          {selectedFile
            ? `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`
            : 'No file selected'}
        </span>
        <button
          onClick={onAnalyze}
          disabled={!selectedFile || loading}
          className="px-6 py-2.5 rounded-lg bg-accent text-bg font-display text-[13px] font-bold tracking-wide
            hover:opacity-85 active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Analyze file
        </button>
      </div>
    </div>
  )
}
