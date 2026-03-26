import { escapeHtml } from '../utils/scanner'

const LINE_STYLES = {
  critical: { bg: 'rgba(255,68,68,0.06)',   border: '#ff4444', text: '#ffaaaa' },
  high:     { bg: 'rgba(255,136,0,0.05)',   border: '#ff8800', text: '#ffcc88' },
  medium:   { bg: 'rgba(240,208,64,0.04)',  border: '#f0d040', text: '#f0e88a' },
  low:      { bg: 'rgba(68,170,255,0.04)',  border: '#44aaff', text: null      },
  none:     { bg: 'transparent',            border: 'transparent', text: null  },
}

export default function LogViewer({ lineMap, useMasked, title }) {
  if (!lineMap?.length) return null

  const riskyLines = lineMap.filter((l) => l.max_risk !== 'none').length

  return (
    <div className="mx-6 mb-6 mt-4 rounded-[10px] overflow-hidden border border-white/[0.07] flex flex-col" style={{ flex: 1 }}>
      {/* Header */}
      <div className="bg-bg3 px-3.5 py-2 flex items-center justify-between border-b border-white/[0.07]">
        <span className="font-display text-[11px] font-bold text-muted uppercase tracking-[.08em]">
          {title || (useMasked ? 'Masked output' : 'Raw content')}
        </span>
        <div className="flex gap-2 text-[10px] text-muted">
          <span>{lineMap.length} lines</span>
          {riskyLines > 0 && <span className="text-high">{riskyLines} flagged</span>}
        </div>
      </div>

      {/* Lines */}
      <div className="overflow-y-auto max-h-[420px]" style={{ background: '#050810' }}>
        {lineMap.map((l) => {
          const style  = LINE_STYLES[l.max_risk] || LINE_STYLES.none
          const lineText = escapeHtml((useMasked ? l.masked : l.text) || '')

          return (
            <div
              key={l.line_no}
              className="grid hover:bg-white/[0.025] transition-colors border-b border-white/[0.03] text-[11.5px] leading-[1.8]"
              style={{
                gridTemplateColumns: '44px 1fr',
                background:  style.bg,
                borderLeft:  style.border !== 'transparent' ? `2px solid ${style.border}` : undefined,
              }}
            >
              <div className="text-muted text-[10px] px-2 pt-1 border-r border-white/[0.04] select-none flex items-start">
                {l.line_no}
              </div>
              <div
                className="px-3 py-0.5 whitespace-pre-wrap break-all"
                style={{ color: style.text || '#c9d1d9' }}
                dangerouslySetInnerHTML={{ __html: lineText }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
