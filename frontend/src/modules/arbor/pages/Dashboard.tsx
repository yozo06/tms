import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardStats, getBiodiversityIndex } from '../api/dashboard'
import { getTrees, exportTreesCsv } from '../api/trees'
import { useAuthStore } from '../../../core/store/auth.store'
import { Plus, AlertTriangle, CheckCircle2, Clock, Download, Leaf, QrCode } from 'lucide-react'

// Action pill config: label · color classes (text + bg)
const ACTION_PILLS = [
  { key: 'toCut',      label: 'Cut',     textCls: 'text-red-700',    bgCls: 'bg-red-50    border-red-100'    },
  { key: 'toTrim',     label: 'Trim',    textCls: 'text-amber-700',  bgCls: 'bg-amber-50  border-amber-100'  },
  { key: 'completed',  label: 'Done',    textCls: 'text-green-700',  bgCls: 'bg-green-50  border-green-100'  },
  { key: 'inProgress', label: 'Active',  textCls: 'text-blue-700',   bgCls: 'bg-blue-50   border-blue-100'   },
  { key: 'pending',    label: 'Pending', textCls: 'text-gray-500',   bgCls: 'bg-gray-100  border-gray-200'   },
]
import Spinner from '../../../core/components/Spinner'
import ProjectSwitcher from '../../../core/components/ProjectSwitcher'

export default function Dashboard() {
  const { user, isOwner } = useAuthStore()
  const nav = useNavigate()
  const [data, setData] = useState<any>(null)
  const [urgent, setUrgent] = useState<any[]>([])
  const [biodiversity, setBiodiversity] = useState<any>(null)
  const [exporting, setExporting] = useState<'trees' | 'health' | null>(null)

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getTrees({ priority: 'urgent', limit: 3 }),
      getBiodiversityIndex()
    ]).then(([statsData, urgentData, bioData]) => {
      setData(statsData)
      setUrgent(urgentData.trees)
      setBiodiversity(bioData)
    })
  }, [])

  if (!data) return <Spinner label="Loading dashboard…" />
  const { stats, zones } = data

  async function handleExport(type: 'trees' | 'health') {
    setExporting(type)
    try {
      await exportTreesCsv(type)
    } finally {
      setExporting(null)
    }
  }

  const completionPct = Math.round((stats.completed / (stats.total || 1)) * 100)

  return (
    <div className="px-4 pt-5 pb-4">

      {/* ── Header row: project pill + add button ── */}
      <div className="flex justify-between items-center mb-5">
        <div className="pointer-events-auto relative z-50">
          <ProjectSwitcher />
        </div>
        {isOwner() && (
          <button onClick={() => nav('/trees/new')} aria-label="Add new tree"
            className="w-10 h-10 bg-brand-forest rounded-xl flex items-center justify-center active:scale-95 transition-transform">
            <Plus size={18} className="text-white" />
          </button>
        )}
      </div>

      {/* ── Hero: total tree count ── */}
      <div className="mb-3">
        <p className="text-[40px] font-medium text-brand-night leading-none">{stats.total}</p>
        <p className="text-[12px] text-brand-muted mt-1">
          trees on your land · {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── Action pill strip ── */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
        {ACTION_PILLS.map(({ key, label, textCls, bgCls }) => {
          const val = (stats as any)[key] ?? 0
          if (val === 0) return null
          return (
            <span key={key}
              className={`flex-shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full border ${textCls} ${bgCls}`}>
              {label} {val}
            </span>
          )
        })}
      </div>

      {/* ── Progress bar ── */}
      <div className="bg-white rounded-[14px] p-4 border border-brand-night/8 mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[11px] font-medium text-brand-muted uppercase tracking-wide">Overall progress</p>
          <p className="text-[12px] font-medium text-brand-forest">{completionPct}%</p>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-forest-mid rounded-full transition-all" style={{ width: `${completionPct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-brand-muted mt-2">
          <span className="flex items-center gap-1"><Clock size={9} /> {stats.pending} pending</span>
          <span className="flex items-center gap-1"><AlertTriangle size={9} /> {stats.inProgress} active</span>
          <span className="flex items-center gap-1"><CheckCircle2 size={9} /> {stats.completed} done</span>
        </div>
      </div>
      {/* ── Urgent attention ── */}
      {urgent.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-[14px] p-4 mb-4">
          <p className="text-[10px] font-medium text-red-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <AlertTriangle size={11} /> Needs attention
          </p>
          {urgent.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-red-100 last:border-0 cursor-pointer active:opacity-70"
              onClick={() => nav(`/trees/${t.tree_code}`)}>
              <div>
                <p className="text-[13px] font-medium text-gray-800">{t.custom_common_name || t.species?.common_name}</p>
                <p className="text-[10px] font-mono text-brand-muted">{t.tree_code}</p>
              </div>
              <span className="text-[10px] bg-red-600 text-white px-2.5 py-0.5 rounded-full capitalize">{t.action}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Biodiversity (M-06) ── */}
      {biodiversity && (
        <div className="bg-brand-forest-light border border-brand-forest-mid/20 rounded-[14px] p-4 mb-4">
          <p className="text-[10px] font-medium text-brand-forest-mid uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Leaf size={11} /> Biodiversity · Shannon H&apos;
          </p>
          <div className="flex items-end gap-3 mb-2">
            <p className="text-[28px] font-medium text-brand-forest leading-none">{biodiversity.shannon_h.toFixed(2)}</p>
            <div className="mb-0.5">
              <p className="text-[11px] text-brand-forest">{biodiversity.species_richness} species · {biodiversity.total_trees} trees</p>
              <p className="text-[11px] text-brand-forest-mid">Evenness {biodiversity.shannon_evenness.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-[11px] text-brand-forest font-medium mb-3">{biodiversity.interpretation}</p>
          {biodiversity.species_breakdown.slice(0, 4).map((s: any) => (
            <div key={s.scientific_name || s.common_name} className="flex items-center gap-2 mb-1.5">
              <div className="h-[3px] bg-brand-forest rounded-full flex-shrink-0"
                style={{ width: `${Math.round(s.proportion * 100)}%`, minWidth: '6px', maxWidth: '55%' }} />
              <span className="text-[10px] text-brand-forest truncate">{s.common_name} ({s.count})</span>
            </div>
          ))}
        </div>
      )}

      {/* ── By Zone ── */}
      {zones.length > 0 && (
        <div className="bg-white rounded-[14px] p-4 border border-brand-night/8 mb-4">
          <p className="text-[10px] font-medium text-brand-muted uppercase tracking-wide mb-3">By zone</p>
          {zones.map((z: any) => (
            <div key={z.zone_code} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-[13px] font-medium text-brand-night">{z.zone_name}</p>
                <p className="text-[10px] text-brand-muted">{z.zone_code}</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-medium text-brand-night">{z.total_trees} trees</p>
                <p className="text-[10px] text-brand-forest-mid">{z.completed} done</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Export (M-05) — owners only ── */}
      {isOwner() && (
        <div className="bg-white rounded-[14px] p-4 border border-brand-night/8 mb-4">
          <p className="text-[10px] font-medium text-brand-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Download size={11} /> Export data
          </p>
          <div className="flex gap-2">
            <button onClick={() => handleExport('trees')} disabled={exporting !== null} aria-label="Download trees CSV"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-brand-forest-light text-brand-forest rounded-xl text-[11px] font-medium active:scale-95 transition-transform disabled:opacity-50">
              <Download size={12} />
              {exporting === 'trees' ? 'Exporting…' : 'Trees CSV'}
            </button>
            <button onClick={() => handleExport('health')} disabled={exporting !== null} aria-label="Download health CSV"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-green-50 text-green-700 rounded-xl text-[11px] font-medium active:scale-95 transition-transform disabled:opacity-50">
              <Download size={12} />
              {exporting === 'health' ? 'Exporting…' : 'Health CSV'}
            </button>
          </div>
        </div>
      )}

      {/* ── QR print sheet (M-03) ── */}
      <div className="bg-white rounded-[14px] p-4 border border-brand-night/8">
        <button onClick={() => nav('/print-sheet')} aria-label="Open QR print sheet"
          className="w-full flex items-center gap-3 text-left hover:bg-brand-forest-light rounded-xl p-1 transition-colors active:scale-95">
          <div className="bg-brand-forest-light p-2.5 rounded-xl border border-brand-forest-mid/20">
            <QrCode size={16} className="text-brand-forest" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-brand-night">QR print sheet</p>
            <p className="text-[10px] text-brand-muted mt-0.5">Print QR tags for all trees</p>
          </div>
        </button>
      </div>
    </div>
  )
}
