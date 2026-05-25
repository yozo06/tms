import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TreePine, Sprout, Map, User } from 'lucide-react'
import { useAuthStore } from '../store/auth.store'

interface NavItem { to: string; icon: React.ReactNode; label: string }

export default function BottomNav() {
  const { isOwner } = useAuthStore()

  const items: NavItem[] = [
    { to: '/home',     icon: <LayoutDashboard size={20} />, label: 'Home'  },
    { to: '/trees',    icon: <TreePine size={20} />,        label: 'Trees' },
    { to: '/growmate', icon: <Sprout size={20} />,          label: 'Grow'  },
    ...(isOwner() ? [{ to: '/map', icon: <Map size={20} />, label: 'Map' }] : []),
    { to: '/profile',  icon: <User size={20} />,            label: 'Me'    },
  ]

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex justify-around items-center px-3"
      style={{
        background: 'rgba(247,245,238,0.94)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: '1px solid rgba(28,43,31,0.10)',
        paddingTop: 8,
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)',
      }}
    >
      {items.map(({ to, icon, label }) => (
        <NavLink
          key={to} to={to} end={to === '/home'}
          className="flex flex-col items-center gap-0.5 min-w-[52px]"
          style={({ isActive }) => ({ textDecoration: 'none', color: isActive ? '#2A5934' : '#6B7B6F' })}
        >
          {({ isActive }) => (
            <>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '5px 14px', borderRadius: 20,
                background: isActive ? 'rgba(42,89,52,0.12)' : 'transparent',
                transition: 'background 0.15s',
              }}>
                {icon}
              </span>
              <span style={{ fontSize: 10, fontWeight: isActive ? 500 : 400, lineHeight: 1 }}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
