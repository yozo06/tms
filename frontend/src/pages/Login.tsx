import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuthStore } from '../store/auth.store'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
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
    /* Scrollable page — sky art is position:absolute so it never clips the form */
    <div style={{ minHeight: '100dvh', background: '#1C2B1F', position: 'relative', overflowY: 'auto' }}>

      {/* ── Night sky illustration ── */}
      <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '62%', pointerEvents: 'none', zIndex: 0 }}>
        <svg viewBox="0 0 390 480" width="100%" height="100%"
          preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">

          {/* Stars */}
          {([
            [42,38,1.4,.6],[112,22,1.0,.45],[198,50,1.5,.5],[248,26,1.0,.7],
            [72,68,1.0,.32],[185,16,1.4,.42],[310,42,1.2,.55],[340,85,.9,.38],
            [60,110,1.0,.28],[270,100,1.3,.5],[150,80,.8,.4],[20,130,1.1,.35],
            [360,120,1.0,.45],[90,48,.7,.3],[220,90,.9,.4],
          ] as [number,number,number,number][]).map(([cx,cy,r,op],i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="#F7F5EE" opacity={op}/>
          ))}

          {/* Moon glow + crescent */}
          <circle cx="305" cy="72" r="32" fill="#639922" opacity="0.12"/>
          <circle cx="305" cy="72" r="24" fill="#D8A419" opacity="0.16"/>
          <circle cx="314" cy="65" r="20" fill="#1C2B1F"/>

          {/* Tree silhouettes — back */}
          <polygon points="0,480 38,280 76,480"    fill="#2A5934" opacity="0.55"/>
          <polygon points="55,480 100,210 145,480"  fill="#2A5934" opacity="0.65"/>
          <polygon points="230,480 278,180 326,480" fill="#2A5934" opacity="0.65"/>
          <polygon points="300,480 345,260 390,480" fill="#2A5934" opacity="0.55"/>

          {/* Tree silhouettes — front */}
          <polygon points="120,480 168,230 216,480" fill="#1a3d21" opacity="0.85"/>
          <polygon points="155,480 205,200 255,480" fill="#1C2B1F" opacity="0.9"/>
          <polygon points="-10,480 32,310 74,480"  fill="#163120" opacity="0.7"/>
          <polygon points="330,480 366,300 390,480" fill="#163120" opacity="0.7"/>

          {/* Ground */}
          <rect x="0" y="450" width="390" height="30" fill="#2A5934" opacity="0.5"/>
          <rect x="0" y="465" width="390" height="20" fill="#1C2B1F" opacity="0.8"/>
        </svg>
      </div>

      {/* Spacer — lets the sky breathe */}
      <div style={{ height: 'max(160px, 34dvh)' }} />

      {/* ── Bottom sheet — natural flow, never clipped ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: '#F7F5EE',
        borderRadius: '28px 28px 0 0',
        padding: '28px 24px 44px',
      }}>
        {/* Logo badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#2A5934', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M17 8C8 10 5.9 16.17 3.82 19C9 19 14 17 17 8Z" fill="#F7F5EE"/>
              <path d="M17 8C17 8 21 12 20 19C20 19 15 19 12 15" stroke="#F7F5EE" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 500, textAlign: 'center', color: '#1C2B1F', marginBottom: 4 }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 12, textAlign: 'center', color: '#6B7B6F', marginBottom: 24 }}>
          Sign in to your WildArc grove
        </p>

        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B7B6F', marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email" value={email} autoComplete="email"
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="your@email.com"
            style={{ width: '100%', background: '#fff', border: '1px solid rgba(42,89,52,0.18)', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#1C2B1F', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.border = '1.5px solid #2A5934' }}
            onBlur={e => { e.target.style.border = '1px solid rgba(42,89,52,0.18)' }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B7B6F', marginBottom: 6 }}>
            Password
          </label>
          <input
            type="password" value={pass} autoComplete="current-password"
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="••••••••"
            style={{ width: '100%', background: '#fff', border: '1px solid rgba(42,89,52,0.18)', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#1C2B1F', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.border = '1.5px solid #2A5934' }}
            onBlur={e => { e.target.style.border = '1px solid rgba(42,89,52,0.18)' }}
          />
        </div>

        {/* Sign in */}
        <button
          onClick={submit} disabled={loading}
          style={{ width: '100%', background: '#2A5934', color: '#F7F5EE', border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.65 : 1 }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#6B7B6F', marginTop: 14 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#2A5934', fontWeight: 500 }}>Sign up</Link>
        </p>

        {/* Footer tagline */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(42,89,52,0.12)' }}>
          <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 500, color: '#2A5934' }}>
            WildArc · Coorg Regenerative Forest
          </p>
          <p style={{ textAlign: 'center', fontSize: 10, color: '#6B7B6F', marginTop: 3 }}>
            Planting, tracking, growing — one tree at a time
          </p>
        </div>
      </div>
    </div>
  )
}
