export default function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-8 text-muted">
      <div className="text-[32px] mb-3 opacity-40">⬡</div>
      <p className="font-display text-base text-dim mb-1">No analysis yet</p>
      <p className="text-[12px]">Paste content above or upload a file to begin</p>
    </div>
  )
}
