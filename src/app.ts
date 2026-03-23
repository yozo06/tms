import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import authModuleRoutes from './modules/auth'
import arborModuleRoutes from './modules/arbor'
import { authLimiter, apiLimiter } from './core/middleware/rateLimiter'

const app = express()

// ── CORS — must be first, before logger ─────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  process.env.APP_URL || 'http://localhost:3000',
]

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return cb(null, true)
    if (allowedOrigins.includes(origin)) return cb(null, true)

    // In production (unified deployment), automatically allow the hosting domain
    if (process.env.NODE_ENV === 'production') return cb(null, true)

    console.warn(`🚫 CORS blocked: ${origin}`)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Handle preflight for all routes
app.options('*', cors())

// ── Request logger ───────────────────────────────────────────
app.use((req, _res, next) => {
  const t = new Date().toISOString().slice(11, 23)
  console.log(`[${t}] ${req.method} ${req.path}`)
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (_req, res) => {
  console.log('✅ Health check hit')
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

// ── Rate limiting ─────────────────────────────────────────
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/signup', authLimiter)
app.use('/api', apiLimiter)

app.use('/api/auth', authModuleRoutes)
app.use('/api/arbor', arborModuleRoutes)

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'))
  })
}

app.use((_req, res) => {
  console.log('❌ 404 — route not found')
  res.status(404).json({ error: 'Route not found' })
})

// Global error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('💥 Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
