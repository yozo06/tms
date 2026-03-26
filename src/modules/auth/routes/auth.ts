import { Router } from 'express'
import { db } from '../../../core/lib/supabase'
import { comparePassword, signToken, signRefreshToken, verifyToken, hashPassword } from '../../../core/lib/auth'
import { authenticate } from '../../../core/middleware/authenticate'

const r = Router()

r.post('/login', async (req, res) => {
  const { email, password } = req.body
  console.log(`🔐 Login attempt: ${email}`)
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  const { data: user, error } = await db
    .from('users').select('id, name, email, password_hash, role, is_active')
    .eq('email', email.toLowerCase()).single()
  if (error || !user) {
    console.log(`❌ Login failed — user not found: ${email}`, error?.message)
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  if (!user.is_active) {
    console.log(`❌ Login failed — account deactivated: ${email}`)
    return res.status(403).json({ error: 'Account deactivated' })
  }
  const valid = await comparePassword(password, user.password_hash)
  if (!valid) {
    console.log(`❌ Login failed — wrong password: ${email}`)
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  console.log(`✅ Login success: ${email} (${user.role})`)
  const payload = { userId: user.id, email: user.email, role: user.role }
  return res.json({
    token: signToken(payload),
    refreshToken: signRefreshToken(payload),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  })
})

r.post('/signup', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' })

  const existing = await db.from('users').select('id').eq('email', email.toLowerCase()).single()
  if (existing.data) return res.status(400).json({ error: 'Email already in use' })

  const hash = await hashPassword(password)
  const { data: user, error } = await db.from('users').insert({
    name, email: email.toLowerCase(), password_hash: hash, role: 'volunteer', is_active: true
  }).select('id, name, email, role').single()

  if (error || !user) return res.status(500).json({ error: error ? error.message : 'Failed to create user' })

  const payload = { userId: user.id, email: user.email, role: user.role }
  return res.status(201).json({
    token: signToken(payload),
    refreshToken: signRefreshToken(payload),
    user
  })
})

r.post('/refresh', (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' })
  try {
    const payload = verifyToken(refreshToken)
    const { userId, email, role } = payload
    return res.json({ token: signToken({ userId, email, role }) })
  } catch { return res.status(401).json({ error: 'Invalid or expired refresh token' }) }
})

r.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' })
  const { data: user } = await db.from('users').select('password_hash').eq('id', req.user!.userId).single()
  if (!user) return res.status(404).json({ error: 'User not found' })
  const valid = await comparePassword(currentPassword, user.password_hash)
  if (!valid) return res.status(401).json({ error: 'Current password incorrect' })
  const hash = await hashPassword(newPassword)
  await db.from('users').update({ password_hash: hash }).eq('id', req.user!.userId)
  return res.json({ success: true })
})

export default r
