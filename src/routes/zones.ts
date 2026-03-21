import { Router } from 'express'
import { db } from '../lib/supabase'
import { authenticate, requireProjectAdmin } from '../middleware/authenticate'
import { validate } from '../middleware/validate'
import { zoneCreateSchema, zoneUpdateSchema } from '../schemas'

const r = Router()
r.use(authenticate)

r.get('/', async (req, res) => {
  if (!req.projectId) return res.status(400).json({ error: 'Project context required' })
  const { data, error } = await db.from('zone_summary').select('*').eq('project_id', req.projectId)
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

r.post('/', requireProjectAdmin, validate(zoneCreateSchema), async (req, res) => {
  const { zone_code, zone_name, description, boundary_coords } = req.body
  if (!zone_code) return res.status(400).json({ error: 'zone_code required' })
  const { data, error } = await db.from('land_zones').insert({
    project_id: req.projectId, zone_code: zone_code.toUpperCase(), zone_name, description, boundary_coords
  }).select().single()
  if (error) return res.status(400).json({ error: error.message })
  return res.status(201).json(data)
})

r.patch('/:id', requireProjectAdmin, validate(zoneUpdateSchema), async (req, res) => {
  const { data, error } = await db.from('land_zones').update(req.body).eq('id', req.params.id).eq('project_id', req.projectId).select().single()
  if (error) return res.status(400).json({ error: error.message })
  return res.json(data)
})

export default r
