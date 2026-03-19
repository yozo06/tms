import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth.store'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import FieldHome from './pages/FieldHome'
import TreeList from './pages/TreeList'
import TreeDetail from './pages/TreeDetail'
import TreeAdd from './pages/TreeAdd'
import TreeEdit from './pages/TreeEdit'
import HealthLog from './pages/HealthLog'
import ActivityLog from './pages/ActivityLog'
import MapView from './pages/MapView'
import Employees from './pages/Employees'
import Profile from './pages/Profile'
import PublicTree from './pages/PublicTree'

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, token } = useAuthStore()
  if (!user || !token) return <Navigate to="/login" replace />
  return children
}

function RequireOwner({ children }: { children: JSX.Element }) {
  const { user, token } = useAuthStore()
  if (!user || !token) return <Navigate to="/login" replace />
  if (user.role !== 'owner') return <Navigate to="/home" replace />
  return children
}

function HomeRedirect() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'owner' ? <Dashboard /> : <FieldHome />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/tree/:code" element={<PublicTree />} />
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/home" element={<HomeRedirect />} />
          <Route path="/trees" element={<TreeList />} />
          <Route path="/trees/new" element={<RequireOwner><TreeAdd /></RequireOwner>} />
          <Route path="/trees/:code" element={<TreeDetail />} />
          <Route path="/trees/:code/edit" element={<RequireOwner><TreeEdit /></RequireOwner>} />
          <Route path="/trees/:code/health" element={<HealthLog />} />
          <Route path="/trees/:code/activity" element={<ActivityLog />} />
          <Route path="/map" element={<RequireOwner><MapView /></RequireOwner>} />
          <Route path="/employees" element={<RequireOwner><Employees /></RequireOwner>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
