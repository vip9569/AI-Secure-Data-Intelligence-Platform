import { useState, useCallback } from 'react'
import Header         from './components/Header'
import Sidebar        from './components/Sidebar'
import FileUploadZone from './components/FileUploadZone'
import TextInputZone  from './components/TextInputZone'
import LoadingBar     from './components/LoadingBar'
import StatsRow       from './components/StatsRow'
import LogViewer      from './components/LogViewer'
import EmptyState     from './components/EmptyState'
import RightPanel     from './components/RightPanel'
import Toast          from './components/Toast'
import { useToast }   from './hooks/useToast'
import { analyzeText as apiAnalyzeText, analyzeFile as apiAnalyzeFile, fetchHistory } from './utils/api'
import { clientSideScan } from './utils/scanner'
import { useEffect }  from 'react'

const FILE_INPUT_TYPES = ['file', 'log']

export default function App() {
  const [inputType,    setInputType]    = useState('text')
  const [textContent,  setTextContent]  = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [opts,         setOpts]         = useState({ mask: true, block_high_risk: false, log_analysis: true })
  const [loading,      setLoading]      = useState(false)
  const [result,       setResult]       = useState(null)
  const [history,      setHistory]      = useState([])
  const { toast, showToast }            = useToast()

  const isFileMode = FILE_INPUT_TYPES.includes(inputType)

  // Load history from backend on mount
  useEffect(() => {
    fetchHistory().then(setHistory).catch(() => {})
  }, [])

  const refreshHistory = useCallback(() => {
    fetchHistory().then(setHistory).catch(() => {})
  }, [])

  // ── Analyze text / sql / chat ──────────────────────────────────────────
  async function handleAnalyzeText() {
    const content = textContent.trim()
    if (!content) { showToast('Please enter some content to analyze'); return }

    setLoading(true)
    try {
      const data = await apiAnalyzeText(inputType, content, opts)
      setResult(data)
      refreshHistory()
    } catch {
      const demo = clientSideScan(content, inputType, opts)
      setResult(demo)
      showToast('Demo mode — start Ollama + backend to enable AI analysis')
    } finally {
      setLoading(false)
    }
  }

  // ── Analyze uploaded file ──────────────────────────────────────────────
  async function handleAnalyzeFile() {
    if (!selectedFile) return
    setLoading(true)
    try {
      const data = await apiAnalyzeFile(selectedFile, opts)
      setResult(data)
      refreshHistory()
    } catch {
      // Demo: read file client-side
      const reader = new FileReader()
      reader.onload = (e) => {
        const demo = clientSideScan(e.target.result, 'log', opts)
        setResult(demo)
        setLoading(false)
        showToast('Demo mode — start Ollama + backend to enable AI analysis')
        refreshHistory()
      }
      reader.readAsText(selectedFile)
      return
    }
    setLoading(false)
  }

  // ── Switch input type: reset file selection ───────────────────────────
  function handleSetInputType(type) {
    setInputType(type)
    if (!FILE_INPUT_TYPES.includes(type)) setSelectedFile(null)
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg relative">

      <Header loading={loading} />

      {/* Three-column shell */}
      <div
        className="relative z-10 flex-1 grid"
        style={{ gridTemplateColumns: '280px 1fr 320px', minHeight: 'calc(100vh - 56px)' }}
      >

        {/* ── Left Sidebar ── */}
        <Sidebar
          inputType={inputType}
          setInputType={handleSetInputType}
          opts={opts}
          setOpts={setOpts}
          history={history}
        />

        {/* ── Main Panel ── */}
        <main className="flex flex-col bg-bg overflow-y-auto">

          {isFileMode ? (
            <FileUploadZone
              selectedFile={selectedFile}
              onFile={setSelectedFile}
              onAnalyze={handleAnalyzeFile}
              loading={loading}
            />
          ) : (
            <TextInputZone
              inputType={inputType}
              value={textContent}
              onChange={setTextContent}
              onAnalyze={handleAnalyzeText}
              loading={loading}
            />
          )}

          <LoadingBar visible={loading} />

          {result ? (
            <>
              <StatsRow findings={result.findings} />
              <LogViewer
                lineMap={result.line_map}
                useMasked={opts.mask}
                title={opts.mask ? 'Masked output' : 'Raw content'}
              />
            </>
          ) : (
            !loading && <EmptyState />
          )}
        </main>

        {/* ── Right Panel ── */}
        <RightPanel result={result} />

      </div>

      <Toast msg={toast.msg} visible={toast.visible} />
    </div>
  )
}
