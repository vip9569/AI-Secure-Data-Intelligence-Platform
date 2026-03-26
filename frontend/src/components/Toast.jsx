export default function Toast({ msg, visible }) {
  if (!msg) return null
  return (
    <div
      className={`fixed bottom-6 right-6 z-[999] px-4 py-2.5 rounded-lg border border-white/[0.12] bg-bg3 text-[12px] text-dim transition-all duration-300 ${
        visible ? 'toast-enter opacity-100 translate-y-0' : 'toast-exit opacity-0 translate-y-20'
      }`}
    >
      {msg}
    </div>
  )
}
