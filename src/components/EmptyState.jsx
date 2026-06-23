export default function EmptyState({ icon = '📭', title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="font-semibold text-flux-black">{title}</p>
      {subtitle && <p className="text-sm text-flux-gray mt-1">{subtitle}</p>}
    </div>
  )
}
