export default function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-8 h-[18px] rounded-full transition-colors duration-200 flex-shrink-0 ${on ? 'bg-accent' : 'bg-white/[0.12]'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 ${on ? 'translate-x-3.5' : 'translate-x-0'}`}
      />
    </button>
  )
}
