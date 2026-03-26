const PLACEHOLDERS = {
  text: 'Paste text or chat content here...\n\nTry: password=admin123 or API_KEY=sk-abc123def456...',
  sql:  'Paste SQL here...\n\nTry: SELECT * FROM users WHERE id=1 OR 1=1 --',
  log:  'Paste log output here...\n\nTry: ERROR Failed login attempt for user admin from 192.168.1.1',
}

export default function TextInputZone({ inputType, value, onChange, onAnalyze, loading }) {
  return (
    <div className="mx-6 mt-6 flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={PLACEHOLDERS[inputType] || PLACEHOLDERS.text}
        className="w-full min-h-[120px] resize-y bg-bg2 border border-white/[0.07] rounded-lg p-3
          text-dim font-code text-[12px] leading-relaxed outline-none
          focus:border-accent placeholder:text-muted transition-colors"
      />
      <button
        onClick={onAnalyze}
        disabled={loading}
        className="self-start px-6 py-2.5 rounded-lg bg-accent text-bg font-display text-[13px] font-bold tracking-wide
          hover:opacity-85 active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Run analysis
      </button>
    </div>
  )
}
