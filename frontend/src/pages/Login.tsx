import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuthStore } from '../store/auth.store'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, setAuth } = useAuthStore()
  const nav = useNavigate()

  useEffect(() => { if (user) nav('/home', { replace: true }) }, [user, nav])

  const submit = async () => {
    if (!email || !pass) return
    setLoading(true)
    try {
      const d = await login(email, pass)
      setAuth(d.user, d.token, d.refreshToken)
    } catch { toast.error('Invalid credentials') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-end relative overflow-hidden"
      style={{ background: '#1C2B1F' }}>

      {/* ── Night sky art ── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
        <svg viewBox="0 0 390 700" width="100%" height="100%"
          preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">

          {/* Stars */}
          {[
            [42,38,1.4,0.6],[112,22,1.0,0.45],[198,50,1.5,0.5],[248,26,1.0,0.7],
            [72,68,1.0,0.32],[185,16,1.4,0.42],[310,42,1.2,0.55],[340,85,0.9,0.38],
            [60,110,1.0,0.28],[270,100,1.3,0.5],[150,80,0.8,0.4],[20,130,1.1,0.35],
            [360,120,1.0,0.45],[90,48,0.7,0.3],[220,90,0.9,0.4],
          ].map(([cx,cy,r,op],i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="#F7F5EE" opacity={op}/>
          ))}

          {/* Moon glow + crescent */}
          <circle cx="305" cy="72" r="32" fill="#639922" opacity="0.12"/>
          <circle cx="305" cy="72" r="24" fill="#D8A419" opacity="0.18"/>
          <circle cx="313" cy="66" r="20" fill="#1C2B1F"/>

          {/* Tree silhouettes — back layer */}
          <polygon points="0,700 38,460 76,700"   fill="#2A5934" opacity="0.55"/>
          <polygon points="55,700 100,380 145,700" fill="#2A5934" opacity="0.65"/>
          <polygon points="230,700 278,350 326,700" fill="#2A5934" opacity="0.65"/>
          <polygon points="300,700 345,430 390,700" fill="#2A5934" opacity="0.55"/>

          {/* Tree silhouettes — front layer (darker) */}
          <polygon points="120,700 168,410 216,700" fill="#1a3d21" opacity="0.85"/>
          <polygon points="160,700 210,370 260,700" fill="#1C2B1F" opacity="0.9"/>
          <polygon points="-10,700 30,500 70,700"  fill="#163120" opacity="0.7"/>
          <polygon points="330,700 365,490 390,700" fill="#163120" opacity="0.7"/>

          {/* Ground strip */}
          <rect x="0" y="660" width="390" height="50" fill="#2A5934" opacity="0.55"/>
          <rect x="0" y="675" width="390" height="35" fill="#1C2B1F" opacity="0.8"/>
        </svg>
      </div>

      {/* ── Bottom sheet ── */}
      <div className="relative z-10 w-full max-w-md rounded-t-[28px] px-6 pt-7 pb-10"
        style={{ background: '#F7F5EE' }}>

        {/* Logo badge */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: '#2A5934' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M17 8C8 10 5.9 16.17 3.82 19C9 19 14 17 17 8Z" fill="#F7F5EE"/>
              <path d="M17 8C17 8 21 12 20 19C20 19 15 19 12 15"
                stroke="#F7F5EE" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <h1 className="text-xl font-medium text-center mb-0.5"
          style={{ color: '#1C2B1F' }}>Welcome back</h1>
        <p className="text-xs text-center mb-6"
          style={{ color: '#6B7B6F' }}>Sign in to your WildArc grove</p>

        {/* Email */}
        <div className="mb-3">
          <label className="block text-[10px] font-medium uppercase tracking-widest mb-1.5"
            style={{ color: '#6B7B6F' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="your@email.com"
            autoComplete="email"
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
            style={{
              background: '#fff',
              border: '1px solid rgba(42,89,52,0.18)',
              color: '#1C2B1F',
            }}
            onFocus={e => (e.target.style.border = '1.5px solid #2A5934')}
            onBlur={e => (e.target.style.border = '1px solid rgba(42,89,52,0.18)')}
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block text-[10px] font-medium uppercase tracking-widest mb-1.5"
            style={{ color: '#6B7B6F' }}>Password</label>
          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
            style={{
              background: '#fff',
              border: '1px solid rgba(42,89,52,0.18)',
              color: '#1C2B1F',
            }}
            onFocus={e => (e.target.style.border = '1.5px solid #2A5934')}
            onBlur={e => (e.target.style.border = '1px solid rgba(42,89,52,0.18)')}
          />
        </div>

        {/* Sign in button */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full font-medium py-3.5 rounded-xl text-sm transition-opacity active:scale-[0.98] disabled:opacity-60"
          style={{ background: '#2A5934', color: '#F7F5EE' }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        {/* Forgot / signup */}
        <p className="text-center text-xs mt-4" style={{ color: '#6B7B6F' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium" style={{ color: '#2A5934' }}>
            Sign up
          </Link>
        </p>

        {/* Tagline */}
        <div className="mt-7 pt-5 border-t" style={{ borderColor: 'rgba(42,89,52,0.12)' }}>
          <p className="text-center text-[11px] font-medium" style={{ color: '#2A5934' }}>
            WildArc · Coorg Regenerative Forest
          </p>
          <p className="text-center text-[10px] mt-0.5" style={{ color: '#6B7B6F' }}>
            Planting, tracking, growing — one tree at a time
          </p>
        </div>
      </div>
    </div>
  )
}
