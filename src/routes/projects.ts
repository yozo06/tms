import { Router } from 'express'
import { db } from '../lib/supabase'
import { authenticate } from '../middleware/authenticate'

const r = Router()
r.use(authenticate)

r.get('/', async (req, res) => {
    // If global owner, fetch all projects. Otherwise, fetch projects they are a member of.
    if (req.user?.role === 'owner') {
        const { data, error } = await db.from('projects').select('*').order('created_at', { ascending: false })
        if (error) return res.status(500).json({ error: error.message })
        return res.json(data.map(p => ({ ...p, user_role: 'admin' })))
    } else {
        const { data, error } = await db.from('project_members')
            .select('role, projects(*)')
            .eq('user_id', req.user!.userId)

        if (error) return res.status(500).json({ error: error.message })

        // map the nested project data flat for the frontend
        const mapped = data.map(d => ({
            ...Array.isArray(d.projects) ? d.projects[0] : d.projects,
            user_role: d.role
        }))

        return res.json(mapped)
    }
})

export default r
