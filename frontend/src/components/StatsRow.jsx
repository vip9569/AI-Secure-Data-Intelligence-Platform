export default function StatsRow({ findings }) {
  const critical = findings.filter((f) => f.risk === 'critical').length
  const high     = findings.filter((f) => f.risk === 'high').length
  const medium   = findings.filter((f) => f.risk === 'medium').length
  const total    = findings.length

  const cells = [
    { label: 'Critical', value: critical, color: '#ff4444' },
    { label: 'High',     value: high,     color: '#ff8800' },
    { label: 'Medium',   value: medium,   color: '#f0d040' },
    { label: 'Total',    value: total,    color: '#00d9ff' },
  ]

  return (
    <div className="grid grid-cols-4 border-t border-b border-white/[0.07]" style={{ gap: '1px', background: 'rgba(255,255,255,0.07)' }}>
      {cells.map(({ label, value, color }) => (
        <div key={label} className="bg-bg2 py-2.5 px-2 text-center">
          <div className="font-display text-lg font-extrabold" style={{ color }}>{value}</div>
          <div className="text-[9px] text-muted uppercase tracking-[.06em] mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  )
}
