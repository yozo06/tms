import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export const validate = (schema: ZodSchema<any>) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = await schema.parseAsync(req.body)
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const zErr = error as any;
                return res.status(400).json({
                    error: 'Validation failed',
                    details: zErr.errors.map((e: any) => ({ path: e.path.join('.'), message: e.message }))
                })
            }
            return res.status(400).json({ error: 'Internal validation error' })
        }
    }
