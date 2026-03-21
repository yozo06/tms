import { Router } from 'express'
import { db } from '../lib/supabase'
import { authenticate } from '../middleware/authenticate'

const r = Router()
r.use(authenticate)

r.get('/trees', async (req, res) => {
  if (!req.projectId) return res.status(400).json({ error: 'Project context required' })
  const { data, error } = await db.from('map_tree_view').select('*').eq('project_id', req.projectId)
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

r.get('/zones', async (req, res) => {
  if (!req.projectId) return res.status(400).json({ error: 'Project context required' })
  const { data, error } = await db.from('land_zones').select('*').eq('project_id', req.projectId)
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

export default r
