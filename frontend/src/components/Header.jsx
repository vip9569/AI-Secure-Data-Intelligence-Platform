export default function Header({ loading }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-14 px-8 border-b border-white/[0.12] bg-[rgba(8,12,16,0.95)] backdrop-blur-md">
      <div className="flex items-center gap-2.5 font-display text-[15px] font-extrabold text-white tracking-wide">
        <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm"
          style={{ background: 'linear-gradient(135deg,#00d9ff,#7c3aed)' }}>
          ⬡
        </div>
        AI<span className="text-accent">SDIP</span>
        <span className="text-muted text-[11px] font-normal ml-1">Secure Data Intelligence</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
        <span className="text-[11px] text-muted">
          {loading ? 'Analyzing…' : 'Engine ready'}
        </span>
        <span className="text-[11px] text-muted">v1.0</span>
      </div>
    </header>
  )
}
