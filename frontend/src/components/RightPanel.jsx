import RiskBadge from './RiskBadge'

const RISK_COLORS = {
  critical: '#ff4444',
  high:     '#ff8800',
  medium:   '#f0d040',
  low:      '#44aaff',
  info:     '#6e7681',
}

const RISK_BG = {
  critical: 'rgba(255,68,68,0.08)',
  high:     'rgba(255,136,0,0.08)',
  medium:   'rgba(240,208,64,0.08)',
  low:      'rgba(68,170,255,0.08)',
  info:     'rgba(110,118,129,0.08)',
}

const ACTION_LABELS = {
  allowed: '✓ Content allowed',
  masked:  '◈ Sensitive data masked',
  blocked: '✕ Content blocked',
}

function SectionTitle({ children }) {
  return (
    <p className="font-display text-[10px] font-bold text-muted uppercase tracking-[.12em] mb-2.5">
      {children}
    </p>
  )
}

export default function RightPanel({ result }) {
  if (!result) {
    return (
      <aside className="border-l border-white/[0.07] bg-bg2 flex flex-col overflow-hidden">
        {/* Empty score header */}
        <div className="p-5 border-b border-white/[0.07] flex items-center gap-3">
          <div className="w-14 h-14 rounded-full border-2 border-white/[0.12] flex items-center justify-center font-display text-lg font-extrabold text-muted flex-shrink-0">
            —
          </div>
          <div>
            <p className="text-[10px] text-muted uppercase tracking-[.1em]">Risk score</p>
            <p className="font-display text-sm font-bold text-muted mt-0.5">Awaiting input</p>
            <p className="text-[11px] text-muted mt-0.5">—</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="text-2xl opacity-30 mb-2">◈</div>
          <p className="text-[11px] text-muted">Analysis results will appear here</p>
        </div>
      </aside>
    )
  }

  const col = RISK_COLORS[result.risk_level] || '#6e7681'
  const bg  = RISK_BG[result.risk_level]     || 'rgba(110,118,129,0.08)'

  return (
    <aside className="border-l border-white/[0.07] bg-bg2 flex flex-col overflow-hidden">

      {/* Score header */}
      <div className="p-5 border-b border-white/[0.07] flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center font-display text-lg font-extrabold flex-shrink-0"
          style={{ border: `2px solid ${col}`, color: col, background: bg }}
        >
          {result.risk_score}
        </div>
        <div>
          <p className="text-[10px] text-muted uppercase tracking-[.1em]">Risk score</p>
          <p className="font-display text-sm font-bold mt-0.5" style={{ color: col }}>
            {result.risk_level.toUpperCase()}
          </p>
          <p className="text-[11px] text-muted mt-0.5">
            {ACTION_LABELS[result.action] || result.action}
          </p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* AI Summary */}
        {result.summary && (
          <div className="p-4 border-b border-white/[0.07]">
            <SectionTitle>AI summary</SectionTitle>
            <p className="text-[12px] text-dim leading-[1.7] p-2.5 rounded-md border border-accent/10 bg-accent/[0.04]">
              {result.summary}
            </p>
          </div>
        )}

        {/* Insights */}
        {result.insights?.length > 0 && (
          <div className="p-4 border-b border-white/[0.07]">
            <SectionTitle>Insights &amp; anomalies</SectionTitle>
            <div>
              {result.insights.map((insight, i) => (
                <div
                  key={i}
                  className="flex gap-2 py-1.5 border-b border-white/[0.04] last:border-0 text-[11px] text-dim leading-[1.5]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-[5px]" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Findings */}
        {result.findings?.length > 0 && (
          <div className="p-4">
            <SectionTitle>
              Findings{' '}
              <span className="text-muted normal-case">({result.findings.length})</span>
            </SectionTitle>
            <div className="flex flex-col gap-1.5">
              {result.findings.slice(0, 40).map((f, i) => (
                <div
                  key={i}
                  className="px-2.5 py-2 rounded-md border border-white/[0.07] hover:border-white/[0.12] transition-colors cursor-default"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <RiskBadge risk={f.risk} />
                    <span className="text-[11px] text-dim font-medium flex-1 capitalize">
                      {f.type.replace(/_/g, ' ')}
                    </span>
                    {f.line && (
                      <span className="text-[10px] text-muted">:{f.line}</span>
                    )}
                  </div>
                  {f.description && (
                    <p className="text-[11px] text-muted leading-[1.5]">{f.description}</p>
                  )}
                  {f.recommendation && (
                    <p className="text-[10px] mt-1 leading-[1.4]" style={{ color: 'rgba(0,217,255,0.7)' }}>
                      ↳ {f.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
