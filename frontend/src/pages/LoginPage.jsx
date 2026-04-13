import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import { authApi } from '../services/api.js'
import toast from 'react-hot-toast'

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-base)',
    position: 'relative',
    overflow: 'hidden',
    padding: '24px',
  },
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '48px 40px 40px',
    width: '100%',
    maxWidth: 380,
    boxShadow: 'var(--shadow-md)',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeUp 0.5s ease both',
  },
  logoWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    fontSize: 32,
    color: 'var(--text-primary)',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 15,
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginBottom: 32,
  },
  divider: {
    height: 1,
    background: 'var(--border)',
    marginBottom: 28,
  },
  googleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '13px 20px',
    background: 'var(--bg-surface)',
    border: '1.5px solid var(--border-strong)',
    borderRadius: 'var(--radius-md)',
    fontSize: 15,
    fontWeight: 500,
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  hint: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 12.5,
    color: 'var(--text-muted)',
    lineHeight: 1.7,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    color: 'var(--text-muted)',
    opacity: 0.6,
  },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated])

  const handleLogin = async () => {
    try {
      // Gọi API lấy JSON chứa auth_url
      const { data } = await authApi.getGoogleLoginUrl()
      
      // Kiểm tra và chuyển hướng trình duyệt sang trang đăng nhập của Google
      if (data && data.auth_url) {
        window.location.href = data.auth_url
      } else {
        toast.error('Dữ liệu trả về không hợp lệ. Vui lòng thử lại.')
      }
    } catch {
      toast.error('Không thể kết nối máy chủ. Vui lòng thử lại.')
    }
  }

  return (
    <div style={styles.root}>
      <LeafBackground />

      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <PlantLogo />
        </div>

        <h1 style={styles.title}>Plant Identity</h1>
        <p style={styles.subtitle}>
          Hệ thống định danh &amp; xác thực<br />
          <em style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            chậu cây thông minh
          </em>
        </p>

        <div style={styles.divider} />

        <button
          style={styles.googleBtn}
          onClick={handleLogin}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--bg-soft)'
            e.currentTarget.style.borderColor = 'var(--green-400)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--bg-surface)'
            e.currentTarget.style.borderColor = 'var(--border-strong)'
          }}
        >
          <GoogleIcon />
          <span>Đăng nhập bằng Google</span>
        </button>

        <p style={styles.hint}>
          Sau khi đăng nhập, bạn sẽ nhập <strong>Plant Code</strong> in trên<br />
          thiết bị để liên kết chậu cây vào tài khoản.
        </p>
      </div>

      <footer style={styles.footer}>Plant Identity MVP · 2025</footer>
    </div>
  )
}

function PlantLogo() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="34" fill="var(--green-50)" stroke="var(--green-200)" strokeWidth="1" />
      {/* Stem */}
      <line x1="36" y1="58" x2="36" y2="28" stroke="var(--green-600)" strokeWidth="2.5" strokeLinecap="round"
        style={{ animation: 'growStem 1.2s ease both', strokeDasharray: 200 }} />
      {/* Left leaf */}
      <path d="M36 42 C36 42 22 34 20 18 C20 18 34 20 36 36"
        fill="var(--green-300)" opacity="0.85"
        style={{ animation: 'leafPop 0.6s ease 0.5s both' }} />
      {/* Right leaf */}
      <path d="M36 34 C36 34 50 26 52 10 C52 10 38 14 36 28"
        fill="var(--green-500)" opacity="0.9"
        style={{ animation: 'leafPop 0.6s ease 0.8s both' }} />
      {/* Small soil */}
      <ellipse cx="36" cy="59" rx="10" ry="3" fill="var(--earth-200)" opacity="0.5" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function LeafBackground() {
  const leaves = [
    { top: '6%',  left: '4%',   size: 90,  rotate: -25, opacity: 0.10 },
    { top: '12%', right: '6%',  size: 65,  rotate: 35,  opacity: 0.08 },
    { top: '45%', left: '2%',   size: 110, rotate: -50, opacity: 0.06 },
    { bottom: '18%', right: '4%', size: 95, rotate: 18, opacity: 0.09 },
    { bottom: '6%', left: '12%', size: 60, rotate: -8,  opacity: 0.07 },
    { top: '30%', right: '2%',  size: 75,  rotate: 55,  opacity: 0.06 },
  ]
  return (
    <>
      {leaves.map((l, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: l.top, left: l.left, right: l.right, bottom: l.bottom,
          width: l.size, height: l.size,
          opacity: l.opacity,
          transform: `rotate(${l.rotate}deg)`,
          pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 100 120" fill="var(--green-600)">
            <path d="M50 5 C50 5 8 30 8 65 C8 88 26 108 50 108 C74 108 92 88 92 65 C92 30 50 5 50 5Z" />
            <line x1="50" y1="108" x2="50" y2="55" stroke="var(--green-800)" strokeWidth="2.5" />
            <line x1="50" y1="80" x2="30" y2="60" stroke="var(--green-800)" strokeWidth="1.5" />
            <line x1="50" y1="65" x2="68" y2="48" stroke="var(--green-800)" strokeWidth="1.5" />
          </svg>
        </div>
      ))}
    </>
  )
}
