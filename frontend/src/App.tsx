import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './core/store/auth.store'
import Layout from './core/components/Layout'
import Login from './core/pages/Login'
import Signup from './core/pages/Signup'
import Dashboard from './modules/arbor/pages/Dashboard'
import FieldHome from './modules/arbor/pages/FieldHome'
import TreeList from './modules/arbor/pages/TreeList'
import TreeDetail from './modules/arbor/pages/TreeDetail'
import TreeAdd from './modules/arbor/pages/TreeAdd'
import TreeEdit from './modules/arbor/pages/TreeEdit'
import HealthLog from './modules/arbor/pages/HealthLog'
import ActivityLog from './modules/arbor/pages/ActivityLog'
import MapView from './modules/arbor/pages/MapView'
import Employees from './settings/pages/Employees'
import Profile from './settings/pages/Profile'
import PublicTree from './modules/arbor/pages/PublicTree'

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

function RequireEmployeeOrOwner({ children }: { children: JSX.Element }) {
  const { user, token } = useAuthStore()
  if (!user || !token) return <Navigate to="/login" replace />
  if (user.role === 'volunteer') return <Navigate to="/home" replace />
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
        <Route path="/signup" element={<Signup />} />
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/home" element={<HomeRedirect />} />
          <Route path="/trees" element={<TreeList />} />
          <Route path="/trees/new" element={<RequireOwner><TreeAdd /></RequireOwner>} />
          <Route path="/trees/:code" element={<TreeDetail />} />
          <Route path="/trees/:code/edit" element={<RequireOwner><TreeEdit /></RequireOwner>} />
          <Route path="/trees/:code/health" element={<RequireEmployeeOrOwner><HealthLog /></RequireEmployeeOrOwner>} />
          <Route path="/trees/:code/activity" element={<RequireEmployeeOrOwner><ActivityLog /></RequireEmployeeOrOwner>} />
          <Route path="/map" element={<RequireOwner><MapView /></RequireOwner>} />
          <Route path="/employees" element={<RequireOwner><Employees /></RequireOwner>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
