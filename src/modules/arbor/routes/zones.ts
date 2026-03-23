import { Router } from 'express'
import { db } from '../../../core/lib/supabase'
import { authenticate, requireOwner } from '../../../core/middleware/authenticate'
import { validate } from '../../../core/middleware/validate'
import { zoneCreateSchema, zoneUpdateSchema } from '../schemas'

const r = Router()
r.use(authenticate)

r.get('/', async (_req, res) => {
  const { data, error } = await db.from('zone_summary').select('*')
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

r.post('/', requireOwner, validate(zoneCreateSchema), async (req, res) => {
  const { zone_code, zone_name, description, boundary_coords } = req.body
  if (!zone_code) return res.status(400).json({ error: 'zone_code required' })
  const { data, error } = await db.from('land_zones').insert({
    zone_code: zone_code.toUpperCase(), zone_name, description, boundary_coords
  }).select().single()
  if (error) return res.status(400).json({ error: error.message })
  return res.status(201).json(data)
})

r.patch('/:id', requireOwner, validate(zoneUpdateSchema), async (req, res) => {
  const { data, error } = await db.from('land_zones').update(req.body).eq('id', req.params.id).select().single()
  if (error) return res.status(400).json({ error: error.message })
  return res.json(data)
})

export default r
