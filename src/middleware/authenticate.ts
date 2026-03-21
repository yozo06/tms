import { Request, Response, NextFunction } from 'express'
import { verifyToken, TokenPayload } from '../lib/auth'
import { db } from '../lib/supabase'

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
      projectId?: string
      projectRole?: 'admin' | 'editor' | 'contributor' | 'viewer'
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing or invalid token' })
  try {
    req.user = verifyToken(header.slice(7))
    const pId = req.headers['x-project-id'] as string
    // Allow service bypass dynamically if needed, else fetch actual project access
    if (pId && pId !== 'undefined' && pId !== 'null') {
      const { data } = await db.from('project_members').select('role').eq('project_id', pId).eq('user_id', req.user.userId).single()
      if (data) { req.projectId = pId; req.projectRole = data.role }
      else if (req.user.role === 'owner') { req.projectId = pId; req.projectRole = 'admin' } // implicit owner bypass
    }
    next()
  } catch {
    return res.status(401).json({ error: 'Token expired or invalid' })
  }
}

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'owner') return res.status(403).json({ error: 'Owner access required' })
  next()
}

export function requireProjectAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === 'owner') return next()
  if (!req.projectId || req.projectRole !== 'admin') return res.status(403).json({ error: 'Project Admin access required' })
  next()
}

export function requireProjectEditor(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === 'owner') return next()
  if (!req.projectId || !['admin', 'editor'].includes(req.projectRole!)) return res.status(403).json({ error: 'Project Editor access required' })
  next()
}

export function requireProjectContributor(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === 'owner') return next()
  if (!req.projectId || !['admin', 'editor', 'contributor'].includes(req.projectRole!)) return res.status(403).json({ error: 'Project Contributor access required' })
  next()
}
