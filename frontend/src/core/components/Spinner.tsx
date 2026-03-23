export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
      <div className="w-8 h-8 border-4 border-forest-200 border-t-forest-600 rounded-full animate-spin" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  )
}
export function EmptyState({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
      <span className="text-4xl">{icon}</span>
      <p className="font-medium text-gray-500">{title}</p>
      {sub && <p className="text-sm text-center px-6">{sub}</p>}
    </div>
  )
}
