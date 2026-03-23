import { Request, Response, NextFunction } from 'express'
import { verifyToken, TokenPayload } from '../lib/auth'

declare global {
  namespace Express {
    interface Request { user?: TokenPayload }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Missing or invalid token' })
  try {
    req.user = verifyToken(header.slice(7))
    next()
  } catch {
    return res.status(401).json({ error: 'Token expired or invalid' })
  }
}

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'owner')
    return res.status(403).json({ error: 'Owner access required' })
  next()
}
