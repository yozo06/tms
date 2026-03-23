import { Request, Response, NextFunction } from 'express'
import { filterXSS } from 'xss'

/** Recursively sanitize all string values in an object against XSS. */
function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === 'string') return filterXSS(obj)
  if (Array.isArray(obj)) return obj.map(sanitizeObject)
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = sanitizeObject(value)
    }
    return result
  }
  return obj
}

/**
 * Global XSS sanitization middleware.
 * Strips HTML tags and dangerous attributes from all text fields in req.body.
 * Apply after express.json() / express.urlencoded().
 */
export function sanitize(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body)
  }
  next()
}
