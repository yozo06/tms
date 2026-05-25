import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword } from '../api/auth'
import { updateUser } from '../api/users'
import { useAuthStore } from '../store/auth.store'
import toast from 'react-hot-toast'
import { LogOut, Lock, Edit2, Check, ChevronRight } from 'lucide-react'

const F   = '#2A5934'
const FL  = '#EAF3DE'
const OFF = '#F7F5EE'
const NGT = '#1C2B1F'
const MUT = '#6B7B6F'

const ROLE_STYLE: Record<string, { bg: string; fg: string }> = {
  owner:     { bg: FL,        fg: F   },
  employee:  { bg: '#E8F0FE', fg: '#1A56DB' },
  volunteer: { bg: '#F0EBFE', fg: '#6C3EBF' },
}

export default function Profile() {
  const { user, logout, setUser } = useAuthStore()
  const nav = useNavigate()
  const [showPw,   setShowPw]   = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [curr, setCurr] = useState('')
  const [next, setNext] = useState('')
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name:  user?.name || '',
    phone: (user as any)?.phone || '',
    bio:   (user as any)?.bio   || '',
  })

  const doLogout = () => { logout(); nav('/login', { replace: true }) }

  const submitPw = async () => {
    if (!curr || !next) return
    setSaving(true)
    try {
      await changePassword(curr, next)
      toast.success('Password changed')
      setShowPw(false); setCurr(''); setNext('')
    } finally { setSaving(false) }
  }

  const submitEdit = async () => {
    if (!editForm.name.trim()) return toast.error('Name is required')
    setSaving(true)
    try {
      const updated = await updateUser(user!.id, editForm)
      setUser({ ...user!, ...updated })
      toast.success('Profile updated')
      setShowEdit(false)
    } catch { toast.error('Failed to update profile') }
    finally { setSaving(false) }
  }

  const role = user?.role || 'employee'
  const roleStyle = ROLE_STYLE[role] || ROLE_STYLE.employee
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    background: OFF, border: '1px solid rgba(42,89,52,0.18)',
    borderRadius: 10, padding: '10px 14px', fontSize: 14, color: NGT, outline: 'none',
  }

  const sectionCard = {
    background: '#fff', borderRadius: 16, marginBottom: 10,
    border: '1px solid rgba(42,89,52,0.08)', overflow: 'hidden' as const,
  }

  return (
    <div style={{ padding: '52px 16px 24px', background: OFF, minHeight: '100%' }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, color: NGT, marginBottom: 20 }}>Profile</h1>

      {/* Avatar card */}
      <div style={{ ...sectionCard, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: FL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 500, color: F, marginBottom: 12 }}>
          {initials}
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: NGT, marginBottom: 3 }}>{user?.name}</h2>
        <p style={{ fontSize: 13, color: MUT, marginBottom: 10 }}>{user?.email}</p>
        <span style={{ fontSize: 11, padding: '3px 12px', borderRadius: 20, background: roleStyle.bg, color: roleStyle.fg, fontWeight: 500, textTransform: 'capitalize' }}>
          {role}
        </span>
      </div>

      {/* Edit Profile */}
      <div style={sectionCard}>
        <button onClick={() => setShowEdit(f => !f)}
          style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <Edit2 size={16} color={MUT} />
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: NGT }}>Edit Profile</span>
          <ChevronRight size={16} color={MUT} style={{ transform: showEdit ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        {showEdit && (
          <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(42,89,52,0.06)' }}>
            <div style={{ marginTop: 16, marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 500, color: MUT, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Name</label>
              <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 500, color: MUT, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Phone</label>
              <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, fontWeight: 500, color: MUT, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Bio</label>
              <textarea value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} rows={2}
                placeholder="Brief description…" style={{ ...inputStyle, resize: 'none' }} />
            </div>
            <button onClick={submitEdit} disabled={saving}
              style={{ width: '100%', background: F, color: OFF, border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.65 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Check size={15} />{saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div style={sectionCard}>
        <button onClick={() => setShowPw(f => !f)}
          style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <Lock size={16} color={MUT} />
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: NGT }}>Change Password</span>
          <ChevronRight size={16} color={MUT} style={{ transform: showPw ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        {showPw && (
          <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(42,89,52,0.06)' }}>
            <div style={{ marginTop: 16, marginBottom: 12 }}>
              <input type="password" value={curr} onChange={e => setCurr(e.target.value)} placeholder="Current password" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <input type="password" value={next} onChange={e => setNext(e.target.value)} placeholder="New password" style={inputStyle} />
            </div>
            <button onClick={submitPw} disabled={saving}
              style={{ width: '100%', background: F, color: OFF, border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.65 : 1 }}>
              {saving ? 'Saving…' : 'Update Password'}
            </button>
          </div>
        )}
      </div>

      {/* Sign out */}
      <button onClick={doLogout}
        style={{ width: '100%', background: '#FCEBEB', border: '1px solid rgba(226,75,74,0.18)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, color: '#E24B4A', fontSize: 14, fontWeight: 500, cursor: 'pointer', marginTop: 4 }}>
        <LogOut size={16} />Sign Out
      </button>
    </div>
  )
}
