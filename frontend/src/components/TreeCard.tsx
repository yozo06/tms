import { useNavigate } from 'react-router-dom'
import type { Tree } from '../modules/arbor/api/trees'
import { ActionBadge, StatusDot } from './ActionBadge'
import HealthBadge from './HealthBadge'

export default function TreeCard({ tree }: { tree: Tree }) {
  const nav = useNavigate()
  const name = tree.custom_common_name || (tree.species as any)?.common_name || 'Unknown'
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-95 transition-transform cursor-pointer"
      onClick={() => nav(`/trees/${tree.tree_code}`)}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <StatusDot status={tree.status} />
            <span className="text-xs font-mono text-gray-400">{tree.tree_code}</span>
          </div>
          <h3 className="font-semibold text-gray-800 mt-0.5">{name}</h3>
          {(tree.species as any)?.scientific_name && (
            <p className="text-xs italic text-gray-400">{(tree.species as any).scientific_name}</p>
          )}
        </div>
        <ActionBadge action={tree.action} />
      </div>
      <div className="flex items-center justify-between mt-3">
        <HealthBadge score={tree.health_score} />
        {(tree.land_zones as any) && <span className="text-xs text-gray-400">{(tree.land_zones as any).zone_name}</span>}
      </div>
      {(tree.assigned_user as any) && <p className="text-xs text-gray-400 mt-1">→ {(tree.assigned_user as any).name}</p>}
    </div>
  )
}
