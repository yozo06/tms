import { useEffect, useState } from 'react'
import { client } from '../api/client'
import { useAuthStore } from '../store/auth.store'

export default function ProjectSwitcher() {
    const { isOwner, activeProjectId, setActiveProject } = useAuthStore()
    const [projects, setProjects] = useState<any[]>([])

    useEffect(() => {
        client.get('/projects').then((r: any) => {
            setProjects(r.data)
            if (!activeProjectId && r.data.length > 0) {
                setActiveProject(r.data[0].id)
            }
        }).catch(console.error)
    }, [activeProjectId, setActiveProject])

    if (!isOwner() && projects.length <= 1) {
        return (
            <div className="inline-block bg-gray-100 text-gray-600 font-display font-bold text-[11px] uppercase tracking-widest py-1.5 px-3 rounded-md border border-gray-200 shadow-inner">
                {projects[0]?.name || 'Loading Workspace...'}
            </div>
        )
    }

    if (projects.length === 0) {
        return <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 py-2 animate-pulse">Loading workspace...</div>
    }

    return (
        <select
            className="bg-gray-900 text-white font-display font-bold text-sm py-2 px-4 rounded-full border border-gray-800 focus:outline-none focus:ring-2 focus:ring-forest-500 shadow-md shadow-gray-300 transition-all cursor-pointer"
            value={activeProjectId || ''}
            onChange={e => {
                setActiveProject(e.target.value)
                window.location.reload()
            }}
        >
            {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
            ))}
        </select>
    )
}
