import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import BottomNav from './BottomNav'
import { useAuthStore } from '../store/auth.store'

export default function Layout() {
  const { user } = useAuthStore()
  return (
    <div
      className="min-h-screen flex flex-col max-w-md mx-auto relative"
      style={{
        background: '#F7F5EE',
        borderLeft: '1px solid rgba(28,43,31,0.08)',
        borderRight: '1px solid rgba(28,43,31,0.08)',
      }}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1C2B1F',
            color: '#F7F5EE',
            fontSize: 13,
            borderRadius: 12,
          },
        }}
      />
      <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        <Outlet />
      </main>
      {user && <BottomNav />}
    </div>
  )
}
