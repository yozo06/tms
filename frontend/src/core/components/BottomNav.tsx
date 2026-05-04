import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TreePine, Map, Users, MessageCircle } from 'lucide-react'
import { useAuthStore } from '../store/auth.store'

/** Modules shipping in future phases — shown as greyed coming-soon pills */
const UPCOMING_MODULES = ['Flora', 'Terra', 'Synapse']

export default function BottomNav() {
  const { isOwner } = useAuthStore()
  const cls = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 text-[10px] py-1.5 px-2.5 rounded-xl transition-colors ${
      isActive ? 'text-brand-forest font-medium' : 'text-brand-muted'
    }`

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-brand-night/8 z-50 pb-safe">

      {/* ── Module bar: Arbor active · upcoming modules greyed ── */}
      <div className="flex items-center gap-1.5 px-4 pt-2 pb-1 overflow-x-auto no-scrollbar">
        <span className="flex-shrink-0 text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-brand-forest text-white">
          Arbor
        </span>
        {UPCOMING_MODULES.map(mod => (
          <span key={mod}
            className="flex-shrink-0 text-[10px] px-2.5 py-0.5 rounded-full border border-brand-night/10 text-brand-muted opacity-50 italic">
            {mod}
          </span>
        ))}
      </div>

      {/* ── Nav items ── */}
      <div className="flex justify-around px-1 pb-1">
        <NavLink to="/home" className={cls}><LayoutDashboard size={20} /><span>Home</span></NavLink>
        <NavLink to="/trees" className={cls}><TreePine size={20} /><span>Trees</span></NavLink>
        {isOwner() && <NavLink to="/map" className={cls}><Map size={20} /><span>Map</span></NavLink>}
        {isOwner() && <NavLink to="/employees" className={cls}><Users size={20} /><span>Team</span></NavLink>}
        {/* GrowMate replaces the old "Me" tab; profile accessible via settings/header */}
        <NavLink to="/growmate" className={cls}><MessageCircle size={20} /><span>GrowMate</span></NavLink>
      </div>
    </nav>
  )
}
