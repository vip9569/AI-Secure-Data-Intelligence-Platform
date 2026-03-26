export default function LoadingBar({ visible }) {
  if (!visible) return null
  return (
    <div className="mx-6 my-3 h-[2px] bg-white/[0.07] relative overflow-hidden rounded-sm">
      <div className="absolute top-0 h-full w-[60%] animate-sweep"
        style={{ left: '-60%', background: 'linear-gradient(90deg, transparent, #00d9ff, transparent)' }}
      />
    </div>
  )
}
