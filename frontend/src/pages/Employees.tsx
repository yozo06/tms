import { useEffect, useState } from 'react'
import { getUsers, createUser, deactivateUser, updateUser } from '../api/users'
import toast from 'react-hot-toast'
import { Plus, UserX, Edit2, Check, X, UserCheck } from 'lucide-react'

export default function Employees() {
  const [users, setUsers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', role: '' })
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', phone: '' })
  const set = (k: string) => (e: React.ChangeEvent<any>) => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => { getUsers().then(setUsers) }, [])

  const submit = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('Name, email, password required')
    setSaving(true)
    try {
      const u = await createUser(form)
      setUsers(prev => [...prev, u]); setShowForm(false)
      setForm({ name: '', email: '', password: '', role: 'employee', phone: '' })
      toast.success(`${u.name} added`)
    } finally { setSaving(false) }
  }

  const deactivate = async (id: number, name: string) => {
    if (!confirm(`Deactivate ${name}?`)) return
    await deactivateUser(id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: false } : u))
    toast.success(`${name} deactivated`)
  }

  const reactivate = async (id: number, name: string) => {
    try {
      await updateUser(id, { is_active: true })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: true } : u))
      toast.success(`${name} reactivated`)
    } catch { toast.error('Failed to reactivate') }
  }

  const startEdit = (u: any) => {
    setEditingId(u.id)
    setEditForm({ name: u.name, phone: u.phone || '', role: u.role })
  }

  const saveEdit = async (id: number) => {
    try {
      const updated = await updateUser(id, editForm)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u))
      setEditingId(null)
      toast.success('Updated')
    } catch { toast.error('Failed to update') }
  }

  const ROLE_COLORS: Record<string, string> = { owner: 'bg-forest-100 text-forest-700', employee: 'bg-blue-100 text-blue-700', volunteer: 'bg-purple-100 text-purple-700' }

  return (
    <div className="px-4 pt-12 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Team</h1>
        <button onClick={() => setShowForm(f => !f)} className="w-9 h-9 bg-forest-600 rounded-xl flex items-center justify-center text-white"><Plus size={18} /></button>
      </div>
      {showForm && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 space-y-3">
          <p className="font-semibold text-gray-700">Add Team Member</p>
          {[['Name', 'name', 'text'], ['Email', 'email', 'email'], ['Password', 'password', 'password'], ['Phone', 'phone', 'tel']].map(([l, k, t]) => (
            <div key={k}><label className="text-xs text-gray-500">{l}</label>
              <input type={t} value={(form as any)[k]} onChange={set(k)} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" /></div>
          ))}
          <div><label className="text-xs text-gray-500">Role</label>
            <select value={form.role} onChange={set('role')} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
              <option value="employee">Employee</option><option value="volunteer">Volunteer</option>
            </select>
          </div>
          <button onClick={submit} disabled={saving} className="w-full bg-forest-600 text-white font-semibold py-3 rounded-xl disabled:opacity-60">{saving ? 'Adding…' : 'Add Member'}</button>
        </div>
      )}
      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className={`bg-white rounded-2xl p-4 shadow-sm ${!u.is_active ? 'opacity-60' : ''}`}>
            {editingId === u.id ? (
              <div className="space-y-2">
                <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" placeholder="Name" />
                <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" placeholder="Phone" />
                <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                  <option value="employee">Employee</option><option value="volunteer">Volunteer</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(u.id)} className="flex-1 bg-forest-600 text-white text-sm font-medium py-2 rounded-xl flex items-center justify-center gap-1"><Check size={14} /> Save</button>
                  <button onClick={() => setEditingId(null)} className="w-10 border border-gray-200 rounded-xl text-gray-400 flex items-center justify-center"><X size={14} /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-bold flex-shrink-0">{u.name[0]}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                  {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                  {!u.is_active && <span className="text-xs text-red-400">Inactive</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  {u.role !== 'owner' && (
                    <button onClick={() => startEdit(u)} className="text-gray-300 hover:text-blue-400 transition-colors"><Edit2 size={15} /></button>
                  )}
                  {u.is_active && u.role !== 'owner' && (
                    <button onClick={() => deactivate(u.id, u.name)} className="text-gray-300 hover:text-red-400 transition-colors"><UserX size={15} /></button>
                  )}
                  {!u.is_active && (
                    <button onClick={() => reactivate(u.id, u.name)} className="text-gray-300 hover:text-green-500 transition-colors"><UserCheck size={15} /></button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
