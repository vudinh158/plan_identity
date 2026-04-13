import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { plantsApi } from '../services/api.js'
import toast from 'react-hot-toast'
import Navbar from '../components/ui/Navbar.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import SensorCard from '../components/dashboard/SensorCard.jsx'
import SensorChart from '../components/dashboard/SensorChart.jsx'
import TuViBadge from '../components/plant/TuViBadge.jsx'

export default function DashboardPage() {
  const navigate = useNavigate()

  const [plant, setPlant] = useState(null)
  const [latestSensor, setLatestSensor] = useState(null)
  const [sensorLogs, setSensorLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const { plantId } = useParams()

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    try {
      // 1. Lấy danh sách cây
      const { data: plants } = await plantsApi.getMyPlants()
      const list = plants?.plants || plants || []

      if (list.length === 0) {
        navigate('/claim', { replace: true })
        return
      }

      // 2. Tìm đúng cây dựa trên plantId trên URL. Nếu URL không có plantId, lấy cây đầu tiên.
      let myPlant = list.find(p => (p.id || p.plant_code) === plantId)
      if (!myPlant) myPlant = list[0] 

      setPlant(myPlant)
      const currentId = myPlant.id || myPlant.plant_code

      // 3. Lấy thông số Sensor theo đúng ID của cây đó
      const [sensorRes, logsRes] = await Promise.allSettled([
        plantsApi.getLatestSensor(currentId),
        plantsApi.getSensorLogs(currentId),
      ])

      if (sensorRes.status === 'fulfilled') setLatestSensor(sensorRes.value.data)
      if (logsRes.status === 'fulfilled') {
        const logs = logsRes.value.data?.logs || logsRes.value.data || []
        setSensorLogs(Array.isArray(logs) ? logs.slice(-20) : [])
      }
    } catch (err) {
      if (!silent) toast.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(true), 30_000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div style={{ paddingTop: 80 }}>
        <Spinner fullscreen />
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px', animation: 'fadeUp 0.4s ease both' }}>

        {/* Plant header card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 28px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 64, height: 64,
              background: 'var(--green-50)',
              border: '1.5px solid var(--green-200)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30,
              flexShrink: 0,
            }}>
              {speciesEmoji(plant?.species)}
            </div>
            <div>
              <h1 style={{ fontSize: 26, marginBottom: 4, color: 'var(--text-primary)' }}>
                {plant?.plant_name || 'Chậu cây của tôi'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  background: 'var(--green-50)',
                  border: '1px solid var(--green-200)',
                  color: 'var(--text-secondary)',
                  borderRadius: 20,
                  padding: '2px 10px',
                  fontSize: 12.5,
                  fontWeight: 500,
                }}>
                  {speciesLabel(plant?.species)}
                </span>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  background: 'var(--bg-soft)',
                  padding: '2px 8px',
                  borderRadius: 6,
                  letterSpacing: 1.5,
                }}>
                  {plant?.plant_code}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <TuViBadge value={plant?.tu_vi || 0} />
            <button
              onClick={() => fetchData(true)}
              title="Làm mới dữ liệu"
              style={{
                width: 36, height: 36,
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green-400)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>
                <path d="M13.6 2.4A7 7 0 1 0 14.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <polyline points="10,0 14.5,2.5 12,7" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sensor cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}>
          <SensorCard
            label="Độ ẩm đất"
            value={latestSensor?.soil_moisture ?? null}
            unit="%"
            icon="💧"
            min={0} max={100}
            warnBelow={20}
            warnAbove={80}
          />
          <SensorCard
            label="Nhiệt độ"
            value={latestSensor?.temperature ?? null}
            unit="°C"
            icon="🌡️"
            min={10} max={45}
            warnBelow={15}
            warnAbove={38}
          />
          <SensorCard
            label="Ánh sáng"
            value={latestSensor?.light_level ?? null}
            unit="lux"
            icon="☀️"
            min={0} max={10000}
          />
          <SensorCard
            label="Độ ẩm KK"
            value={latestSensor?.humidity ?? null}
            unit="%"
            icon="🌫️"
            min={0} max={100}
          />
        </div>

        {/* Last updated */}
        {latestSensor?.recorded_at && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, textAlign: 'right' }}>
            Cập nhật lần cuối: {new Date(latestSensor.recorded_at).toLocaleString('vi-VN')}
          </p>
        )}

        {/* Sensor chart */}
        {sensorLogs.length > 0 && (
          <SensorChart logs={sensorLogs} />
        )}

        {!latestSensor && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-muted)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontStyle: 'italic', marginBottom: 6 }}>
              Chưa có dữ liệu cảm biến
            </p>
            <p style={{ fontSize: 13 }}>Thiết bị IoT chưa gửi dữ liệu về máy chủ</p>
          </div>
        )}

        {/* Plant info footer */}
        <div style={{
          marginTop: 24,
          padding: '16px 20px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 8,
          fontSize: 12.5, color: 'var(--text-muted)',
        }}>
          <span>Device: <code style={{ fontSize: 11 }}>{plant?.device_id || '—'}</code></span>
          <span>Đã claim: {plant?.created_at ? new Date(plant.created_at).toLocaleDateString('vi-VN') : '—'}</span>
        </div>
      </div>
    </div>
  )
}

function speciesEmoji(species) {
  const map = {
    kim_tien: '🌿', luoi_ho: '🌵', sen_da: '🪴',
    trau_ba: '🍃', xuong_rong: '🌱', khac: '🌾',
  }
  return map[species] || '🪴'
}

function speciesLabel(species) {
  const map = {
    kim_tien: 'Kim Tiền', luoi_ho: 'Lưỡi Hổ', sen_da: 'Sen Đá',
    trau_ba: 'Trầu Bà', xuong_rong: 'Xương Rồng', khac: 'Khác',
  }
  return map[species] || species || 'Không rõ loài'
}
