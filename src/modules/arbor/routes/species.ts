import { Router } from 'express'
import { db } from '../../../core/lib/supabase'
import { authenticate, requireOwner } from '../../../core/middleware/authenticate'
import { validate } from '../../../core/middleware/validate'
import { speciesCreateSchema, speciesUpdateSchema } from '../schemas'

const r = Router()
r.use(authenticate)

r.get('/', async (_req, res) => {
  const { data, error } = await db.from('species').select('*').order('common_name')
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

r.get('/roles', async (_req, res) => {
  const { data, error } = await db.from('ecosystem_roles').select('*').order('category')
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

r.get('/:id', async (req, res) => {
  const { data, error } = await db.from('species').select('*').eq('id', req.params.id).single()
  if (error || !data) return res.status(404).json({ error: 'Species not found' })
  return res.json(data)
})

r.post('/', requireOwner, validate(speciesCreateSchema), async (req, res) => {
  const { data, error } = await db.from('species').insert(req.body).select().single()
  if (error) return res.status(400).json({ error: error.message })
  return res.status(201).json(data)
})

r.patch('/:id', requireOwner, validate(speciesUpdateSchema), async (req, res) => {
  const { data, error } = await db.from('species').update(req.body).eq('id', req.params.id).select().single()
  if (error) return res.status(400).json({ error: error.message })
  return res.json(data)
})

export default r
