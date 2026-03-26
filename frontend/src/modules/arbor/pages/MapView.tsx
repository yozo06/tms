import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMapTrees } from '../api/map'
import MapCanvas from '../components/MapCanvas'
import { ActionBadge } from '../components/ActionBadge'
import Spinner from '../../../core/components/Spinner'

const LEGEND = [
  {key:'cut',color:'#ef4444'},{key:'trim',color:'#f59e0b'},{key:'keep',color:'#22c55e'},
  {key:'monitor',color:'#3b82f6'},{key:'pending',color:'#9ca3af'},
]

export default function MapView() {
  const nav = useNavigate()
  const [trees, setTrees] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { getMapTrees().then(setTrees).finally(() => setLoading(false)) }, [])
  if (loading) return <Spinner label="Loading map…" />
  return (
    <div className="flex flex-col h-screen">
      <div className="px-4 pt-12 pb-3 bg-white border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800">Land Map</h1>
        <p className="text-xs text-gray-400">{trees.filter(t=>t.coord_x).length} trees plotted</p>
      </div>
      <div className="flex gap-3 px-4 py-2 bg-white border-b border-gray-100 overflow-x-auto">
        {LEGEND.map(l => (
          <div key={l.key} className="flex items-center gap-1 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full" style={{background:l.color}} />
            <span className="text-xs text-gray-500 capitalize">{l.key}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 bg-gray-50 relative">
        <MapCanvas trees={trees} onSelect={setSelected} selected={selected?.id} />
        {selected && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-gray-400">{selected.tree_code}</p>
                <p className="font-semibold text-gray-800">{selected.display_name||'Unknown'}</p>
                {selected.zone_code && <p className="text-xs text-gray-400">Zone {selected.zone_code}</p>}
              </div>
              <ActionBadge action={selected.action} />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => nav(`/trees/${selected.tree_code}`)} className="flex-1 bg-forest-600 text-white text-sm font-medium py-2 rounded-xl">View Tree</button>
              <button onClick={() => setSelected(null)} className="w-10 h-9 border border-gray-200 rounded-xl text-gray-400 flex items-center justify-center">✕</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
