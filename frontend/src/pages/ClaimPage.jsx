import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { plantsApi } from '../services/api.js'
import { useAuthStore } from '../store/authStore.js'
import toast from 'react-hot-toast'
import Navbar from '../components/ui/Navbar.jsx'

const SPECIES_OPTIONS = [
  { value: 'kim_tien',   label: '🌿 Kim Tiền' },
  { value: 'luoi_ho',    label: '🌵 Lưỡi Hổ' },
  { value: 'sen_da',     label: '🪴 Sen Đá' },
  { value: 'trau_ba',    label: '🍃 Trầu Bà' },
  { value: 'xuong_rong', label: '🌱 Xương Rồng' },
  { value: 'khac',       label: '🌾 Khác' },
]

export default function ClaimPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [code, setCode] = useState(Array(8).fill(''))
  const [plantName, setPlantName] = useState('')
  const [species, setSpecies] = useState('')
  const [loading, setLoading] = useState(false)
  const [lockout, setLockout] = useState(0) // seconds remaining
  const [errors, setErrors] = useState({})

  const inputRefs = useRef([])
  const lockoutRef = useRef(null)

  useEffect(() => {
    inputRefs.current[0]?.focus()
    return () => clearInterval(lockoutRef.current)
  }, [])

  // Countdown for rate-limit lockout
  useEffect(() => {
    if (lockout > 0) {
      lockoutRef.current = setInterval(() => {
        setLockout(prev => {
          if (prev <= 1) { clearInterval(lockoutRef.current); return 0 }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(lockoutRef.current)
  }, [lockout > 0])

  const handleCodeChange = (index, value) => {
    const char = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1)
    const next = [...code]
    next[index] = char
    setCode(next)
    if (char && index < 7) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 7) inputRefs.current[index + 1]?.focus()
  }

  const handleCodePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)
    const next = Array(8).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setCode(next)
    const focusIdx = Math.min(pasted.length, 7)
    inputRefs.current[focusIdx]?.focus()
  }

  const validate = () => {
    const errs = {}
    const fullCode = code.join('')
    if (fullCode.length < 8) errs.code = 'Vui lòng nhập đủ 8 ký tự Plant Code'
    if (!plantName.trim()) errs.plantName = 'Vui lòng đặt tên cho cây của bạn'
    if (!species) errs.species = 'Vui lòng chọn loài cây'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (lockout > 0 || !validate()) return

    setLoading(true)
    try {
      await plantsApi.claimPlant(code.join(''), plantName.trim(), species)
      toast.success('🌱 Đã liên kết chậu cây thành công!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.message || ''

      if (status === 429) {
        setLockout(15 * 60) // 15 minutes
        toast.error('Quá nhiều lần thử. Vui lòng đợi 15 phút.')
      } else if (status === 409) {
        toast.error('Mã này đã được claim bởi tài khoản khác.')
      } else if (status === 404) {
        toast.error('Plant Code không tồn tại. Kiểm tra lại mã trên thiết bị.')
        setErrors({ code: 'Mã không hợp lệ' })
      } else if (msg.includes('already claimed') || msg.includes('1 chậu')) {
        toast.error('Tài khoản của bạn đã liên kết 1 chậu cây (giới hạn MVP).')
        navigate('/dashboard', { replace: true })
      } else {
        toast.error('Có lỗi xảy ra. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatLockout = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const codeComplete = code.every(c => c !== '')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '48px 24px',
        animation: 'fadeUp 0.4s ease both',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56,
            background: 'var(--green-50)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 3 C14 3 4 9 4 17 C4 21.4 8.6 25 14 25 C19.4 25 24 21.4 24 17 C24 9 14 3 14 3Z"
                fill="var(--green-300)" />
              <line x1="14" y1="25" x2="14" y2="13" stroke="var(--green-700)" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 6, color: 'var(--text-primary)' }}>
            Liên kết chậu cây
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
            Nhập mã <strong style={{ color: 'var(--text-secondary)' }}>Plant Code</strong> in trên thiết bị IoT
            để liên kết vào tài khoản <em>{user?.email}</em>
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Plant Code Input */}
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>
              Plant Code
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
                8 ký tự in trên thiết bị
              </span>
            </label>
            <div
              style={{
                display: 'flex', gap: 7,
                justifyContent: 'center',
              }}
              onPaste={handleCodePaste}
            >
              {code.map((char, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  value={char}
                  onChange={e => handleCodeChange(i, e.target.value)}
                  onKeyDown={e => handleCodeKeyDown(i, e)}
                  maxLength={1}
                  disabled={lockout > 0 || loading}
                  style={{
                    width: 46, height: 52,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 500,
                    fontFamily: "'Courier New', monospace",
                    letterSpacing: 1,
                    background: char ? 'var(--green-50)' : 'var(--bg-surface)',
                    border: `1.5px solid ${errors.code ? '#e74c3c' : char ? 'var(--green-400)' : 'var(--border-strong)'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'border-color 0.15s, background 0.15s',
                    textTransform: 'uppercase',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--green-600)'; e.target.style.boxShadow = '0 0 0 3px rgba(45,122,45,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = char ? 'var(--green-400)' : 'var(--border-strong)'; e.target.style.boxShadow = 'none' }}
                />
              ))}
            </div>
            {errors.code && <p style={errorStyle}>{errors.code}</p>}

            {/* Example hint */}
            <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 8 }}>
              Ví dụ: <span style={{ fontFamily: 'monospace', letterSpacing: 2, color: 'var(--text-secondary)' }}>A3K9P2XR</span>
            </p>
          </div>

          {/* Plant Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Tên cây</label>
            <input
              type="text"
              value={plantName}
              onChange={e => setPlantName(e.target.value)}
              placeholder="Ví dụ: Bé Cây Góc Bàn"
              disabled={loading}
              maxLength={50}
              style={{
                ...inputStyle,
                borderColor: errors.plantName ? '#e74c3c' : 'var(--border-strong)',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--green-600)'; e.target.style.boxShadow = '0 0 0 3px rgba(45,122,45,0.12)' }}
              onBlur={e => { e.target.style.borderColor = errors.plantName ? '#e74c3c' : 'var(--border-strong)'; e.target.style.boxShadow = 'none' }}
            />
            {errors.plantName && <p style={errorStyle}>{errors.plantName}</p>}
          </div>

          {/* Species */}
          <div style={{ marginBottom: 32 }}>
            <label style={labelStyle}>Loài cây</label>
            <select
              value={species}
              onChange={e => setSpecies(e.target.value)}
              disabled={loading}
              style={{
                ...inputStyle,
                borderColor: errors.species ? '#e74c3c' : 'var(--border-strong)',
                color: species ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--green-600)'; e.target.style.boxShadow = '0 0 0 3px rgba(45,122,45,0.12)' }}
              onBlur={e => { e.target.style.borderColor = errors.species ? '#e74c3c' : 'var(--border-strong)'; e.target.style.boxShadow = 'none' }}
            >
              <option value="">— Chọn loài cây —</option>
              {SPECIES_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.species && <p style={errorStyle}>{errors.species}</p>}
          </div>

          {/* Lockout warning */}
          {lockout > 0 && (
            <div style={{
              background: '#fff5f5',
              border: '1px solid #fcc',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13.5,
              color: '#c0392b',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1 L15 14 H1 Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <line x1="8" y1="6" x2="8" y2="10" stroke="currentColor" strokeWidth="1.4" />
                <circle cx="8" cy="12" r="0.8" fill="currentColor" />
              </svg>
              Quá nhiều lần thử. Vui lòng đợi <strong style={{ marginLeft: 4 }}>{formatLockout(lockout)}</strong>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || lockout > 0 || !codeComplete}
            style={{
              width: '100%',
              padding: '14px',
              background: (loading || lockout > 0 || !codeComplete) ? 'var(--green-200)' : 'var(--accent)',
              color: (loading || lockout > 0 || !codeComplete) ? 'var(--green-600)' : 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 15,
              fontWeight: 500,
              cursor: (loading || lockout > 0 || !codeComplete) ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => {
              if (!loading && lockout === 0 && codeComplete)
                e.currentTarget.style.background = 'var(--accent-hover)'
            }}
            onMouseLeave={e => {
              if (!loading && lockout === 0 && codeComplete)
                e.currentTarget.style.background = 'var(--accent)'
            }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" fill="none" />
                </svg>
                Đang xác minh…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2 C8 2 2 6 2 10 C2 12.8 4.8 15 8 15 C11.2 15 14 12.8 14 10 C14 6 8 2 8 2Z"
                    fill="white" opacity="0.9" />
                </svg>
                Liên kết chậu cây
              </>
            )}
          </button>
        </form>

        {/* Info note */}
        <div style={{
          marginTop: 24,
          padding: '14px 16px',
          background: 'var(--green-50)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 12.5,
          color: 'var(--text-muted)',
          lineHeight: 1.7,
        }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Lưu ý:</strong> Mỗi Plant Code chỉ được claim bởi
          1 tài khoản. Mỗi tài khoản chỉ được claim 1 chậu cây trong phiên bản MVP này.
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 13.5,
  fontWeight: 500,
  color: 'var(--text-primary)',
  marginBottom: 8,
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  fontSize: 15,
  background: 'var(--bg-surface)',
  border: '1.5px solid var(--border-strong)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

const errorStyle = {
  marginTop: 5,
  fontSize: 12,
  color: '#e74c3c',
}
