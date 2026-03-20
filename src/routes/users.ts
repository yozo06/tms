import { Router } from 'express'
import { db } from '../lib/supabase'
import { hashPassword } from '../lib/auth'
import { authenticate, requireOwner } from '../middleware/authenticate'

const r = Router()
r.use(authenticate)

r.get('/', async (req, res) => {
  if (req.user!.role === 'employee') {
    const { data } = await db.from('users').select('id, name, email, role, phone, bio, created_at').eq('id', req.user!.userId).single()
    return res.json([data])
  }
  const { data, error } = await db.from('users').select('id, name, email, role, phone, bio, is_active, created_at').order('name')
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

r.get('/me', async (req, res) => {
  const { data, error } = await db.from('users').select('id, name, email, role, phone, bio, profile_photo, is_active, created_at').eq('id', req.user!.userId).single()
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

r.post('/', requireOwner, async (req, res) => {
  const { name, email, password, role, phone, bio } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' })
  const hash = await hashPassword(password)
  const { data, error } = await db.from('users').insert({
    name, email: email.toLowerCase(), password_hash: hash, role: role || 'employee', phone, bio
  }).select('id, name, email, role, phone, is_active, created_at').single()
  if (error) return res.status(400).json({ error: error.message })
  return res.status(201).json(data)
})

r.patch('/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  if (req.user!.role !== 'owner' && req.user!.userId !== id)
    return res.status(403).json({ error: 'Cannot update another user' })
  const { name, phone, bio } = req.body
  const patch: Record<string, any> = {}
  if (name) patch.name = name
  if (phone) patch.phone = phone
  if (bio) patch.bio = bio
  if (req.user!.role === 'owner') {
    if (req.body.role) patch.role = req.body.role
    if (req.body.is_active !== undefined) patch.is_active = req.body.is_active
  }
  const { data, error } = await db.from('users').update(patch).eq('id', id).select('id, name, email, role, phone, bio, is_active').single()
  if (error) return res.status(400).json({ error: error.message })
  return res.json(data)
})

r.delete('/:id', requireOwner, async (req, res) => {
  const { error } = await db.from('users').update({ is_active: false }).eq('id', req.params.id)
  if (error) return res.status(400).json({ error: error.message })
  return res.json({ success: true })
})

export default r
