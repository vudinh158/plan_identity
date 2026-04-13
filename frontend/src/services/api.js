import axios from 'axios'

// const BASE_URL = import.meta.env.VITE_API_URL || '/api'

// export const api = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
// })

// // Attach access token to every request
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('access_token')
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

// // Auto-refresh on 401
// api.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const original = error.config
//     if (error.response?.status === 401 && !original._retry) {
//       original._retry = true
//       try {
//         const { data } = await axios.post(
//           `${BASE_URL}/auth/refresh`,
//           {},
//           { withCredentials: true }
//         )
//         localStorage.setItem('access_token', data.access_token)
//         original.headers.Authorization = `Bearer ${data.access_token}`
//         return api(original)
//       } catch {
//         localStorage.removeItem('access_token')
//         window.location.href = '/login'
//       }
//     }
//     return Promise.reject(error)
//   }
// )

// // ─── Auth ────────────────────────────────────────────────────────────────────
// export const authApi = {
//   getGoogleLoginUrl: () => api.get('/auth/google/login'),
//   getMe:             () => api.get('/auth/me'),
//   refresh:           () => api.post('/auth/refresh'),
//   logout:            () => api.post('/auth/logout'),
//   logoutAll:         () => api.post('/auth/logout/all'),
// }

// // ─── Plants ──────────────────────────────────────────────────────────────────
// export const plantsApi = {
//   claimPlant:        (plant_code, plant_name, species) =>
//                        api.post('/plants/claims', { plant_code, plant_name, species }),
//   getMyPlants:       () => api.get('/plants'),
//   getPlant:          (id) => api.get(`/plants/${id}`),
//   getSensorLogs:     (id) => api.get(`/plants/${id}/sensor-logs`),
//   getLatestSensor:   (id) => api.get(`/plants/${id}/sensor-logs/latest`),
// }

export const api = axios.create() // Chỉ để không báo lỗi cú pháp nếu có file nào lỡ import

export const authApi = {
  // Trả về thẳng link callback của Frontend kèm theo 1 token giả
  getGoogleLoginUrl: async () => ({ data: { auth_url: "/auth/callback?access_token=dev-token-sieucapvippro-123" } }),
  
  // Trả về thông tin user giả
  getMe: async () => ({ 
    data: { 
      email: "dev@plant.local",
      display_name: "Nhà Phát Triển", 
      avatar_url: "",
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      tu_vi: "2500",
      created_at: new Date().toISOString()
    } 
  }),
  
  refresh: async () => ({ data: { access_token: "dev-token-sieucapvippro-123" } }),
  logout: async () => ({ data: { message: "Đã đăng xuất" } }),
  logoutAll: async () => ({ data: {} }),
}

export const plantsApi = {
  // Giả lập claim cây thành công
  claimPlant: async (code, name, species) => ({ data: { success: true } }),
  
  // Tạo sẵn 1 chậu cây giả để khi vào /dashboard nó hiện ra luôn
  getMyPlants: async () => ({
    data: {
      plants: [
        {
          id: "plant-01",
          plant_code: "A3K9P2XR",
          plant_name: "Bé Cây Trạng Nguyên",
          species: "trau_ba",
          tu_vi: 2500, // Cấp độ "Thiên Mộc"
          device_id: "IOT-DEV-001",
          created_at: new Date().toISOString()
        }
      ]
    }
  }),
  getPlant: async (id) => ({ data: {} }),
  
  // Trả về 1 mảng dữ liệu lịch sử để vẽ Chart
  getSensorLogs: async (id) => ({
    data: {
      logs: [
        { soil_moisture: 45, temperature: 26, light_level: 3000, humidity: 70, recorded_at: new Date(Date.now() - 3600000 * 2).toISOString() },
        { soil_moisture: 52, temperature: 27, light_level: 4500, humidity: 65, recorded_at: new Date(Date.now() - 1800000).toISOString() },
        { soil_moisture: 58, temperature: 29, light_level: 5500, humidity: 55, recorded_at: new Date(Date.now() - 900000).toISOString() },
        { soil_moisture: 55, temperature: 28, light_level: 5000, humidity: 60, recorded_at: new Date().toISOString() },
      ]
    }
  }),
  
  // Trả về dữ liệu hiện tại để hiển thị trên 4 cái Card thông số
  getLatestSensor: async (id) => ({
    data: {
      soil_moisture: 55,
      temperature: 28,
      light_level: 5000,
      humidity: 60,
      recorded_at: new Date().toISOString()
    }
  }),
}