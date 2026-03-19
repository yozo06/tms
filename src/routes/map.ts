import { Router } from 'express'
import { db } from '../lib/supabase'
import { authenticate } from '../middleware/authenticate'

const r = Router()
r.use(authenticate)

r.get('/trees', async (_req, res) => {
  const { data, error } = await db.from('map_tree_view').select('*')
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

r.get('/zones', async (_req, res) => {
  const { data, error } = await db.from('land_zones').select('*')
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

export default r
