import { useEffect, useState } from 'react'
import { client } from '../api/client'
import { useAuthStore } from '../store/auth.store'
import { ChevronDown, MapPin } from 'lucide-react'

export default function ProjectSwitcher() {
    const { activeProjectId, setActiveProject } = useAuthStore()
    const [projects, setProjects] = useState<any[]>([])
    const [open, setOpen] = useState(false)

    useEffect(() => {
        client.get('/projects').then(res => {
            setProjects(res.data)
            if (!activeProjectId && res.data.length > 0) {
                setActiveProject(res.data[0].id)
            }
        }).catch(console.error)
    }, [activeProjectId])

    const activeProject = projects.find(p => p.id === activeProjectId)

    if (projects.length === 0) return null

    return (
        <div className="relative z-50">
            <button onClick={() => setOpen(!open)} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm text-sm font-medium text-gray-700 active:scale-95 transition-transform">
                <MapPin size={16} className="text-forest-600" />
                {activeProject?.name || 'Loading Project...'}
                <ChevronDown size={14} className="text-gray-400" />
            </button>

            {open && (
                <div className="absolute top-10 left-0 bg-white rounded-xl shadow-lg border border-gray-100 p-2 min-w-[200px]">
                    {projects.map(p => (
                        <button
                            key={p.id}
                            onClick={() => {
                                if (p.id !== activeProjectId) {
                                    setActiveProject(p.id)
                                    setOpen(false)
                                    window.location.reload()
                                } else setOpen(false)
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${p.id === activeProjectId ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="opacity-50" />
                                    <span>{p.name}</span>
                                </div>
                                <span className="text-[10px] uppercase opacity-60 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-100">{p.user_role}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
