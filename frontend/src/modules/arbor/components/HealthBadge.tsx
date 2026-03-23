export default function HealthBadge({ score }: { score?: number }) {
  if (!score) return <span className="text-xs text-gray-400">No data</span>
  const color = score >= 8 ? 'text-green-600' : score >= 5 ? 'text-yellow-600' : 'text-red-600'
  const bar = Math.round((score / 10) * 5)
  return <span className={`text-sm font-bold ${color}`}>{'█'.repeat(bar)}{'░'.repeat(5-bar)} {score}/10</span>
}
