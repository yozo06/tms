import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import authRoutes from './routes/auth'
import treeRoutes from './routes/trees'
import mapRoutes from './routes/map'
import userRoutes from './routes/users'
import speciesRoutes from './routes/species'
import zoneRoutes from './routes/zones'
import dashboardRoutes from './routes/dashboard'

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

app.use('/api/auth', authRoutes)
app.use('/api/trees', treeRoutes)
app.use('/api/map', mapRoutes)
app.use('/api/users', userRoutes)
app.use('/api/species', speciesRoutes)
app.use('/api/zones', zoneRoutes)
app.use('/api/dashboard', dashboardRoutes)

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
