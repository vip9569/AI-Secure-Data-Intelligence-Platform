import Toggle from './Toggle'

const INPUT_TYPES = [
  { type: 'text',  label: 'Text / Chat'  },
  { type: 'log',   label: 'Log file'     },
  { type: 'file',  label: 'File upload'  },
  { type: 'sql',   label: 'SQL'          },
]

const RISK_COLORS = {
  critical: '#ff4444',
  high:     '#ff8800',
  medium:   '#f0d040',
  low:      '#44aaff',
  info:     '#6e7681',
}

export default function Sidebar({ inputType, setInputType, opts, setOpts, history }) {
  return (
    <aside className="border-r border-white/[0.07] bg-bg2 flex flex-col gap-6 p-4 overflow-y-auto">

      {/* Input type */}
      <div>
        <p className="font-display text-[10px] font-bold text-muted uppercase tracking-[.12em] mb-2">
          Input type
        </p>
        <div className="flex flex-col gap-0.5">
          {INPUT_TYPES.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => setInputType(type)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-[12px] transition-all border
                ${inputType === type
                  ? 'bg-accent/[0.08] border-accent/20 text-accent'
                  : 'border-transparent text-muted hover:bg-bg3 hover:text-dim'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div>
        <p className="font-display text-[10px] font-bold text-muted uppercase tracking-[.12em] mb-2">
          Analysis options
        </p>
        <div className="flex flex-col">
          {[
            { key: 'mask',            label: 'Mask sensitive data' },
            { key: 'block_high_risk', label: 'Block high-risk input' },
            { key: 'log_analysis',    label: 'AI deep analysis' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between py-1.5 text-[12px] text-muted">
              <span>{label}</span>
              <Toggle on={opts[key]} onChange={(v) => setOpts((o) => ({ ...o, [key]: v }))} />
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="flex-1 min-h-0">
        <p className="font-display text-[10px] font-bold text-muted uppercase tracking-[.12em] mb-2">
          Recent analyses
        </p>
        <div className="flex flex-col gap-1">
          {history.length === 0 ? (
            <span className="text-[11px] text-muted">No history yet</span>
          ) : (
            history.slice(0, 8).map((h) => (
              <div key={h.id} className="px-2.5 py-2 rounded-md border border-white/[0.07] hover:border-white/[0.12] transition-colors cursor-pointer">
                <div className="text-[11px] text-dim truncate">{h.filename || h.input_type}</div>
                <div className="text-[10px] text-muted mt-0.5">
                  <span style={{ color: RISK_COLORS[h.risk_level] || '#6e7681' }}>{h.risk_level}</span>
                  {' · score '}{h.risk_score}{' · '}{h.finding_count}{' findings'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* API endpoints */}
      <div>
        <p className="font-display text-[10px] font-bold text-muted uppercase tracking-[.12em] mb-2">
          API endpoint
        </p>
        <div className="font-code text-[10px] text-muted leading-6">
          POST /api/analyze<br />
          POST /api/upload<br />
          GET&nbsp; /api/history
        </div>
      </div>
    </aside>
  )
}
