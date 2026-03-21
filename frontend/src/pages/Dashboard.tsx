import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardStats } from '../api/dashboard'
import { getTrees } from '../api/trees'
import { useAuthStore } from '../store/auth.store'
import { Plus, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import Spinner from '../components/Spinner'
import ProjectSwitcher from '../components/ProjectSwitcher'

export default function Dashboard() {
  const { user, isOwner } = useAuthStore()
  const nav = useNavigate()
  const [data, setData] = useState<any>(null)
  const [urgent, setUrgent] = useState<any[]>([])

  useEffect(() => {
    Promise.all([getDashboardStats(), getTrees({ priority: 'urgent', limit: 3 })])
      .then(([statsData, urgentData]) => {
        setData(statsData)
        setUrgent(urgentData.trees)
      })
  }, [])

  if (!data) return <Spinner label="Loading dashboard…" />
  const { stats, zones } = data

  return (
    <div className="px-4 pt-12 pb-4">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="pointer-events-auto mb-2 relative z-50">
            <ProjectSwitcher />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name.split(' ')[0]}</h1>
        </div>
        {isOwner() && (
          <button onClick={() => nav('/trees/new')} className="w-10 h-10 bg-forest-600 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Plus size={20} className="text-white" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Total Trees', val: stats.total, color: 'bg-forest-50 text-forest-700' },
          { label: 'Completed', val: stats.completed, color: 'bg-green-50 text-green-700' },
          { label: 'To Cut', val: stats.toCut, color: 'bg-red-50 text-red-700' },
          { label: 'To Trim', val: stats.toTrim, color: 'bg-yellow-50 text-yellow-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
            <p className="text-3xl font-bold">{s.val}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-gray-700">Overall Progress</p>
          <p className="text-sm font-bold text-forest-600">{Math.round((stats.completed / (stats.total || 1)) * 100)}%</p>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-forest-500 rounded-full transition-all" style={{ width: `${(stats.completed / (stats.total || 1)) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span className="flex items-center gap-1"><Clock size={10} /> {stats.pending} pending</span>
          <span className="flex items-center gap-1"><AlertTriangle size={10} /> {stats.inProgress} in progress</span>
          <span className="flex items-center gap-1"><CheckCircle2 size={10} /> {stats.completed} done</span>
        </div>
      </div>
      {urgent.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
          <p className="text-xs font-semibold text-red-600 uppercase mb-3 flex items-center gap-1"><AlertTriangle size={12} /> Urgent</p>
          {urgent.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-red-100 last:border-0 cursor-pointer" onClick={() => nav(`/trees/${t.tree_code}`)}>
              <div>
                <p className="font-medium text-sm text-gray-800">{t.custom_common_name || t.species?.common_name}</p>
                <p className="text-xs font-mono text-gray-400">{t.tree_code}</p>
              </div>
              <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full capitalize">{t.action}</span>
            </div>
          ))}
        </div>
      )}
      {zones.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">By Zone</p>
          {zones.map((z: any) => (
            <div key={z.zone_code} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div><p className="font-medium text-sm text-gray-800">{z.zone_name}</p><p className="text-xs text-gray-400">{z.zone_code}</p></div>
              <div className="text-right"><p className="text-sm font-bold text-gray-700">{z.total_trees} trees</p><p className="text-xs text-green-500">{z.completed} done</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
