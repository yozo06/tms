import { Router } from 'express'
import { db } from '../lib/supabase'
import { authenticate } from '../middleware/authenticate'

const r = Router()
r.use(authenticate)

r.get('/stats', async (req, res) => {
    try {
        if (!req.projectId) return res.status(400).json({ error: 'Project context required' })

        let q = db.from('trees').select('status, action, priority, assigned_to', { count: 'exact' }).eq('project_id', req.projectId)

        if (req.user!.role === 'employee' && req.projectRole !== 'admin') {
            q = q.eq('assigned_to', req.user!.userId)
        }

        const { data: trees, error } = await q
        if (error) return res.status(500).json({ error: error.message })

        const stats = {
            total: trees.length,
            pending: trees.filter((t: any) => t.status === 'pending').length,
            inProgress: trees.filter((t: any) => t.status === 'in_progress').length,
            completed: trees.filter((t: any) => t.status === 'completed').length,
            toCut: trees.filter((t: any) => t.action === 'cut').length,
            toTrim: trees.filter((t: any) => t.action === 'trim').length,
            urgent: trees.filter((t: any) => t.priority === 'urgent').length
        }

        // Get zone summary per project
        const { data: zones } = await db.from('land_zones').select('zone_name, description').eq('project_id', req.projectId)

        return res.json({ stats, zones })
    } catch (err: any) {
        return res.status(500).json({ error: err.message })
    }
})

export default r
