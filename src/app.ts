import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import arborRoutes from './modules/arbor'
import authRoutes from './modules/auth'

const app = express()

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  process.env.APP_URL      || 'http://localhost:3000',
]

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    if (allowedOrigins.includes(origin)) return cb(null, true)
    if (process.env.NODE_ENV === 'production') return cb(null, true)
    console.warn(`🚫 CORS blocked: ${origin}`)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.options('*', cors())

// ── Request logger ───────────────────────────────────────────
app.use((req, _res, next) => {
  const t = new Date().toISOString().slice(11, 23)
  console.log(`[${t}] ${req.method} ${req.path}`)
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health ───────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  console.log('✅ Health check hit')
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

// ── Routes ───────────────────────────────────────────────────
// auth module  → /api/auth/*  and  /api/users/*
// arbor module → /api/trees/*, /api/map/*, /api/species/*, /api/zones/*, /api/dashboard/*
app.use('/api', authRoutes)
app.use('/api', arborRoutes)

// ── 404 + error handlers ─────────────────────────────────────
app.use((_req, res) => {
  console.log('❌ 404 — route not found')
  res.status(404).json({ error: 'Route not found' })
})

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('💥 Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
