import { Router } from 'express'
import { db } from '../lib/supabase'
import { hashPassword } from '../lib/auth'
import { authenticate, requireProjectAdmin } from '../middleware/authenticate'

const r = Router()
r.use(authenticate)

r.get('/', async (req, res) => {
  if (!req.projectId) return res.status(400).json({ error: 'Project context required' })
  const { data, error } = await db.from('project_members')
    .select('role, users(id, name, email, phone, bio, is_active, created_at)')
    .eq('project_id', req.projectId)
  if (error) return res.status(500).json({ error: error.message })

  // Flatten for frontend
  const mapped = data.map((d: any) => ({
    ...(Array.isArray(d.users) ? d.users[0] : d.users),
    role: d.role // map project role instead of global role
  })).sort((a: any, b: any) => a.name.localeCompare(b.name))

  return res.json(mapped)
})

r.get('/me', async (req, res) => {
  const { data, error } = await db.from('users').select('id, name, email, role, phone, bio, profile_photo, is_active, created_at').eq('id', req.user!.userId).single()
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

r.post('/', requireProjectAdmin, async (req, res) => {
  const { name, email, password, role, phone, bio } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' })
  if (!req.projectId) return res.status(400).json({ error: 'Project context required' })

  // Check if user exists globally first
  let { data: user } = await db.from('users').select('id').eq('email', email.toLowerCase()).single()
  if (!user) {
    const hash = await hashPassword(password)
    const { data: newUser, error } = await db.from('users').insert({
      name, email: email.toLowerCase(), password_hash: hash, role: 'volunteer', phone, bio
    }).select('id, name, email, role, phone, is_active, created_at').single()
    if (error) return res.status(400).json({ error: error.message })
    user = newUser
  }

  // Add to project
  await db.from('project_members').insert({
    project_id: req.projectId, user_id: user.id, role: role || 'viewer'
  })

  return res.status(201).json({ ...user, role })
})

r.patch('/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  if (req.projectRole !== 'admin' && req.user!.userId !== id)
    return res.status(403).json({ error: 'Cannot update another user' })
  const { name, phone, bio } = req.body
  const patch: Record<string, any> = {}
  if (name) patch.name = name
  if (phone) patch.phone = phone
  if (bio) patch.bio = bio
  if (req.projectRole === 'admin') {
    if (req.body.is_active !== undefined) patch.is_active = req.body.is_active
    // If Admin changes role, we must patch project_members, not global users table
    if (req.body.role) {
      await db.from('project_members').update({ role: req.body.role }).eq('project_id', req.projectId).eq('user_id', id)
    }
  }
  const { data, error } = await db.from('users').update(patch).eq('id', id).select('id, name, email, role, phone, bio, is_active').single()
  if (error) return res.status(400).json({ error: error.message })
  return res.json(data)
})

r.delete('/:id', requireProjectAdmin, async (req, res) => {
  const { error } = await db.from('project_members').delete().eq('project_id', req.projectId).eq('user_id', req.params.id)
  if (error) return res.status(400).json({ error: error.message })
  return res.json({ success: true })
})

export default r
