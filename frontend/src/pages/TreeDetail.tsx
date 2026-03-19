import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTree, updateTree, getPhotos, uploadPhoto } from '../api/trees'
import { useAuthStore } from '../store/auth.store'
import { ActionBadge, PriorityBadge, StatusDot } from '../components/ActionBadge'
import HealthBadge from '../components/HealthBadge'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'
import { ArrowLeft, Camera, ClipboardList, Activity, Edit2, CheckCircle2 } from 'lucide-react'

const STATUSES = ['pending','in_progress','completed','on_hold']

export default function TreeDetail() {
  const { code } = useParams()
  const nav = useNavigate()
  const { isOwner, user } = useAuthStore()
  const [tree, setTree] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [statusNote, setStatusNote] = useState('')

  useEffect(() => {
    Promise.all([getTree(code!), getPhotos(code!)])
      .then(([t, p]) => { setTree(t); setPhotos(p) })
      .finally(() => setLoading(false))
  }, [code])

  const changeStatus = async (s: string) => {
    try {
      await updateTree(code!, { status: s, log_notes: statusNote })
      setTree((t: any) => ({ ...t, status: s }))
      toast.success(`Status → ${s.replace('_',' ')}`)
    } catch {}
  }

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !code) return
    setUploading(true)
    try {
      const p = await uploadPhoto(code, file, 'general')
      setPhotos(prev => [p, ...prev])
      toast.success('Photo uploaded')
    } finally { setUploading(false) }
  }

  if (loading) return <Spinner label="Loading tree…" />
  if (!tree) return <div className="p-6 text-center text-gray-400">Tree not found</div>

  const name = tree.custom_common_name || tree.species?.common_name || 'Unknown Tree'
  const isMyTree = tree.assigned_to === user?.id || isOwner()

  return (
    <div className="pb-8">
      <div className="bg-forest-700 px-4 pt-12 pb-6 text-white">
        <button onClick={() => nav(-1)} className="mb-4 flex items-center gap-1 text-forest-200"><ArrowLeft size={16} /> Back</button>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-forest-300 text-xs font-mono mb-1">{tree.tree_code}</p>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="italic text-forest-200 text-sm">{tree.species?.scientific_name}</p>
          </div>
          {isOwner() && (
            <button onClick={() => nav(`/trees/${code}/edit`)} className="w-9 h-9 bg-forest-600 rounded-xl flex items-center justify-center"><Edit2 size={16} /></button>
          )}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <ActionBadge action={tree.action} />
          <PriorityBadge p={tree.priority} />
          <StatusDot status={tree.status} />
          <span className="text-xs text-forest-200 capitalize">{tree.status.replace('_',' ')}</span>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Health</p>
          <HealthBadge score={tree.health_score} />
        </div>

        {tree.action_notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Instructions</p>
            <p className="text-sm text-gray-700">{tree.action_notes}</p>
          </div>
        )}

        {isMyTree && tree.status!=='completed' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Update Status</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {STATUSES.filter(s => s!==tree.status).map(s => (
                <button key={s} onClick={() => changeStatus(s)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors capitalize ${s==='completed'?'bg-forest-600 text-white border-forest-600':'border-gray-200 text-gray-600'}`}>
                  {s==='completed' && <CheckCircle2 size={14} className="inline mr-1" />}
                  {s.replace('_',' ')}
                </button>
              ))}
            </div>
            <input value={statusNote} onChange={e => setStatusNote(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
              placeholder="Optional note about this update…" />
          </div>
        )}

        {tree.status==='completed' && (
          <div className="bg-forest-50 border border-forest-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 size={24} className="text-forest-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-forest-700">Work Completed</p>
              {tree.completed_at && <p className="text-xs text-gray-400">{new Date(tree.completed_at).toLocaleDateString()}</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {tree.approx_age_yrs && <div className="bg-white rounded-xl p-3 text-center shadow-sm"><p className="font-bold text-gray-800">{tree.approx_age_yrs}y</p><p className="text-xs text-gray-400">Age</p></div>}
          {tree.height_m && <div className="bg-white rounded-xl p-3 text-center shadow-sm"><p className="font-bold text-gray-800">{tree.height_m}m</p><p className="text-xs text-gray-400">Height</p></div>}
          {tree.trunk_diameter_cm && <div className="bg-white rounded-xl p-3 text-center shadow-sm"><p className="font-bold text-gray-800">{tree.trunk_diameter_cm}cm</p><p className="text-xs text-gray-400">Trunk ⌀</p></div>}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => nav(`/trees/${code}/activity`)} className="bg-white rounded-xl p-3 flex flex-col items-center gap-1 shadow-sm active:scale-95 transition-transform">
            <Activity size={18} className="text-forest-600" /><p className="text-xs text-gray-600">Activity</p>
          </button>
          <button onClick={() => nav(`/trees/${code}/health`)} className="bg-white rounded-xl p-3 flex flex-col items-center gap-1 shadow-sm active:scale-95 transition-transform">
            <ClipboardList size={18} className="text-forest-600" /><p className="text-xs text-gray-600">Health Log</p>
          </button>
          <label className="bg-white rounded-xl p-3 flex flex-col items-center gap-1 shadow-sm active:scale-95 transition-transform cursor-pointer">
            <Camera size={18} className={uploading?'text-gray-300':'text-forest-600'} />
            <p className="text-xs text-gray-600">{uploading?'Uploading…':'Add Photo'}</p>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} disabled={uploading} />
          </label>
        </div>

        {photos.length>0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Photos</p>
            <div className="grid grid-cols-3 gap-1.5">
              {photos.map((p:any) => (
                <div key={p.id} className="relative">
                  <img src={p.photo_url} alt={p.caption} className="rounded-xl object-cover w-full h-24" />
                  <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded-lg capitalize">{p.photo_type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(tree.land_zones?.zone_name || tree.coord_x) && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Location</p>
            {tree.land_zones?.zone_name && <p className="text-sm text-gray-600">Zone: <span className="font-medium">{tree.land_zones.zone_name}</span></p>}
            {tree.coord_x && tree.coord_y && <p className="text-sm text-gray-600 font-mono">x: {tree.coord_x}, y: {tree.coord_y}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
