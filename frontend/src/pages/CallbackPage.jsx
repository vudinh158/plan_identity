import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import { plantsApi } from '../services/api.js'
import toast from 'react-hot-toast'

export default function CallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setToken, fetchMe } = useAuthStore()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const accessToken = searchParams.get('access_token')
    const error = searchParams.get('error')

    if (error || !accessToken) {
      toast.error('Đăng nhập thất bại. Vui lòng thử lại.')
      navigate('/login', { replace: true })
      return
    }

    const init = async () => {
      setToken(accessToken)
      await fetchMe()

      const { user } = useAuthStore.getState()
      if (!user) {
        toast.error('Không thể lấy thông tin tài khoản.')
        navigate('/login', { replace: true })
        return
      }

      // Check if user already has a plant
      try {
        const { data } = await plantsApi.getMyPlants()
        const plants = data?.plants || data || []
        if (plants.length > 0) {
          toast.success(`Chào mừng trở lại, ${user.display_name}!`)
          navigate('/dashboard', { replace: true })
        } else {
          toast.success(`Xin chào ${user.display_name}! Hãy liên kết chậu cây của bạn.`)
          navigate('/claim', { replace: true })
        }
      } catch {
        // If fetching plants fails, go to claim page
        navigate('/claim', { replace: true })
      }
    }

    init()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      gap: 20,
    }}>
      <AnimatedPlant />
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: 22,
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
      }}>
        Đang xác thực…
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        Vui lòng đợi trong giây lát
      </p>
    </div>
  )
}

function AnimatedPlant() {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
      <circle cx="45" cy="45" r="42" fill="var(--green-50)" stroke="var(--green-200)" strokeWidth="1" />
      <line x1="45" y1="72" x2="45" y2="30" stroke="var(--green-600)" strokeWidth="3"
        strokeLinecap="round"
        style={{
          strokeDasharray: 60,
          strokeDashoffset: 60,
          animation: 'growStem 1s ease 0.2s forwards',
        }}
      />
      <path d="M45 50 C45 50 28 42 26 24 C26 24 42 25 45 44"
        fill="var(--green-300)"
        style={{ animation: 'leafPop 0.5s ease 0.8s both' }}
      />
      <path d="M45 40 C45 40 62 32 64 14 C64 14 48 18 45 36"
        fill="var(--green-500)"
        style={{ animation: 'leafPop 0.5s ease 1.1s both' }}
      />
      <ellipse cx="45" cy="73" rx="12" ry="3.5" fill="var(--earth-200)" opacity="0.4" />
    </svg>
  )
}
