const STYLES = {
  critical: 'bg-[rgba(255,68,68,0.2)]  text-critical',
  high:     'bg-[rgba(255,136,0,0.2)]  text-high',
  medium:   'bg-[rgba(240,208,64,0.2)] text-medium',
  low:      'bg-[rgba(68,170,255,0.2)] text-low',
  info:     'bg-[rgba(110,118,129,0.2)] text-muted',
}

export default function RiskBadge({ risk }) {
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] uppercase tracking-[.06em] flex-shrink-0 ${STYLES[risk] || STYLES.info}`}>
      {risk}
    </span>
  )
}
