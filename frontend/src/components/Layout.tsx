import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import BottomNav from './BottomNav'
import { useAuthStore } from '../core/store/auth.store'

export default function Layout() {
  const { user } = useAuthStore()
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-xl relative">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <main className="flex-1 overflow-y-auto pb-20"><Outlet /></main>
      {user && <BottomNav />}
    </div>
  )
}
