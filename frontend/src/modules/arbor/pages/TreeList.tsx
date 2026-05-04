import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTrees, type Tree } from '../api/trees'
import { getZones } from '../api/species'
import { useAuthStore } from '../../../core/store/auth.store'
import TreeCard from '../components/TreeCard'
import Spinner, { EmptyState } from '../../../core/components/Spinner'
import { Search, Plus, X } from 'lucide-react'

const ACTIONS = ['all', 'cut', 'trim', 'keep', 'monitor', 'treat', 'pending'] as const
type ActionFilter = typeof ACTIONS[number]

export default function TreeList() {
  const { isOwner } = useAuthStore()
  const nav = useNavigate()
  const [trees, setTrees] = useState<Tree[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [action, setAction] = useState<ActionFilter>('all')
  const [zone, setZone] = useState('all')
  const [zones, setZones] = useState<any[]>([])

  useEffect(() => { getZones().then(setZones) }, [])

  const load = useCallback(() => {
    setLoading(true)
    const params: Record<string, any> = { limit: 100 }
    if (search) params.search = search
    if (action !== 'all') params.action = action
    if (zone !== 'all') params.zone = zone
    getTrees(params)
      .then((r: any) => { setTrees(r.trees); setTotal(r.total || 0) })
      .finally(() => setLoading(false))
  }, [search, action, zone])

  useEffect(() => { load() }, [load])

  const hasFilters = action !== 'all' || zone !== 'all'

  return (
    <div className="px-4 pt-5 pb-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[17px] font-medium text-brand-night">Trees</h1>
        {isOwner() && (
          <button onClick={() => nav('/trees/new')} aria-label="Add new tree"
            className="w-10 h-10 bg-brand-forest rounded-xl flex items-center justify-center text-white active:scale-95 transition-transform">
            <Plus size={18} />
          </button>
        )}
      </div>

      {/* ── Search ── */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-3 text-brand-muted pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-brand-night/10 rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-brand-night placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-forest/20"
          placeholder="Search trees, codes, species…"
        />
      </div>

      {/* ── Action filter chips (always visible) ── */}
      <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 no-scrollbar">
        {ACTIONS.map(a => (
          <button key={a} onClick={() => setAction(a)}
            className={`flex-shrink-0 text-[11px] px-3 py-1 rounded-full border capitalize transition-colors ${
              action === a
                ? 'bg-brand-forest text-white border-brand-forest'
                : 'bg-white border-brand-night/15 text-brand-muted'
            }`}>
            {a === 'all' ? 'All actions' : a}
          </button>
        ))}
      </div>

      {/* ── Zone filter + clear ── */}
      <div className="flex items-center gap-2 mb-4">
        <select value={zone} onChange={e => setZone(e.target.value)}
          className="flex-1 bg-white border border-brand-night/10 rounded-xl px-3 py-2 text-[12px] text-brand-night focus:outline-none focus:ring-2 focus:ring-brand-forest/20 appearance-none">
          <option value="all">All zones</option>
          {zones.map((z: any) => (
            <option key={z.id} value={z.id}>{z.zone_name} ({z.zone_code})</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setAction('all'); setZone('all') }}
            aria-label="Clear filters"
            className="flex items-center gap-1 text-[11px] text-red-500 font-medium px-2.5 py-2 rounded-xl border border-red-100 bg-red-50 flex-shrink-0">
            <X size={11} /> Clear
          </button>
        )}
      </div>

      {/* ── Result count ── */}
      <p className="text-[11px] text-brand-muted mb-3">{total} trees</p>

      {/* ── List ── */}
      {loading
        ? <Spinner />
        : trees.length === 0
          ? <EmptyState icon="🌳" title="No trees found" sub="Try adjusting your filters" />
          : <div className="space-y-2">{trees.map(t => <TreeCard key={t.id} tree={t} />)}</div>
      }
    </div>
  )
}
