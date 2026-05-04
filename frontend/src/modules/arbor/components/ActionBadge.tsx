const colors: Record<string, string> = {
  cut:'bg-red-100 text-red-700', trim:'bg-yellow-100 text-yellow-700',
  keep:'bg-green-100 text-green-700', monitor:'bg-blue-100 text-blue-700',
  treat:'bg-purple-100 text-purple-700', replant:'bg-orange-100 text-orange-700',
  pending:'bg-gray-100 text-gray-600',
}
const priorityColors: Record<string, string> = {
  urgent:'bg-red-600 text-white', high:'bg-orange-500 text-white',
  medium:'bg-yellow-400 text-gray-800', low:'bg-gray-200 text-gray-600',
}
export function ActionBadge({ action }: { action: string }) {
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${colors[action] || colors.pending}`}>{action}</span>
}
export function PriorityBadge({ p }: { p: string }) {
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${priorityColors[p] || priorityColors.low}`}>{p}</span>
}
export function StatusDot({ status }: { status: string }) {
  const c: Record<string, string> = {
    pending:'bg-gray-400', in_progress:'bg-blue-500', completed:'bg-green-500', on_hold:'bg-yellow-500'
  }
  return <span className={`inline-block w-2 h-2 rounded-full ${c[status] || 'bg-gray-400'}`} />
}
