# 🌿 Plant Identity — Frontend

Hệ thống định danh & xác thực chậu cây thông minh.

## Tech stack

- **Vite** + **React 18** + **JSX** (không dùng TypeScript)
- **React Router v6** — client-side routing
- **Zustand** — state management (auth)
- **Axios** — HTTP client với auto token refresh
- **react-hot-toast** — notifications
- **lucide-react** — icons

---

## Cấu trúc dự án

```
frontend/
├── public/
│   └── leaf.svg                  # favicon
├── src/
│   ├── main.jsx                  # entry point
│   ├── App.jsx                   # router setup
│   ├── index.css                 # global styles & design tokens
│   │
│   ├── services/
│   │   └── api.js                # axios instance + auth/plants API
│   │
│   ├── store/
│   │   └── authStore.js          # Zustand auth state
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx         # Google OAuth entry
│   │   ├── CallbackPage.jsx      # OAuth redirect handler
│   │   ├── ClaimPage.jsx         # Plant Code claim form
│   │   └── DashboardPage.jsx     # Plant dashboard + sensors
│   │
│   └── components/
│       ├── auth/
│       │   └── ProtectedRoute.jsx
│       ├── ui/
│       │   ├── Navbar.jsx
│       │   └── Spinner.jsx
│       ├── plant/
│       │   └── TuViBadge.jsx
│       └── dashboard/
│           ├── SensorCard.jsx
│           └── SensorChart.jsx
│
├── .env.example
├── index.html
├── vite.config.js
└── package.json
```

---

## Luồng người dùng

```
/login
  └─► [Click "Đăng nhập bằng Google"]
        └─► GET /api/auth/google/login  →  redirect to Google
              └─► Google callback  →  /auth/callback?access_token=...
                    └─► lưu token, fetchMe()
                          ├─► có plant  →  /dashboard
                          └─► chưa có  →  /claim

/claim
  └─► Nhập Plant Code (8 ký tự OTP-style) + tên cây + loài
        └─► POST /api/plants/claims
              └─► thành công  →  /dashboard

/dashboard
  └─► GET /api/plants  →  lấy plant của user
  └─► GET /api/plants/:id/sensor-logs/latest  →  sensor hiện tại
  └─► GET /api/plants/:id/sensor-logs  →  lịch sử chart
  └─► Auto-refresh mỗi 30 giây
```

---

## Cài đặt & chạy

### 1. Cài dependencies

```bash
cd frontend
npm install
```

### 2. Cấu hình environment

```bash
cp .env.example .env
```

Nếu backend chạy ở `localhost:3000`, giữ nguyên `VITE_API_URL=/api`.  
Vite sẽ proxy `/api/*` → `http://localhost:3000/*` tự động.

Nếu backend deploy riêng:
```
VITE_API_URL=https://your-backend.com
```

### 3. Chạy dev

```bash
npm run dev
```

Frontend chạy tại **http://localhost:5173**

---

## Kết nối với Backend

Backend cần trả về `access_token` qua redirect sau Google OAuth:

```
GET /auth/google/callback
→ redirect: http://localhost:5173/auth/callback?access_token=<JWT>
```

Hoặc nếu backend trả JSON, điều chỉnh `CallbackPage.jsx` để đọc từ query params theo format của bạn.

---

## API endpoints sử dụng

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/auth/google/login` | Lấy URL đăng nhập Google |
| GET | `/auth/me` | Thông tin user đang đăng nhập |
| POST | `/auth/refresh` | Đổi Refresh Token |
| POST | `/auth/logout` | Đăng xuất |
| POST | `/plants/claims` | Claim cây bằng mã 8 ký tự |
| GET | `/plants` | Danh sách cây của user |
| GET | `/plants/:id/sensor-logs` | Lịch sử cảm biến |
| GET | `/plants/:id/sensor-logs/latest` | Bản đọc mới nhất |

---

## Bảo mật đã implement ở frontend

- **Auto token refresh**: khi nhận 401, tự động gọi `/auth/refresh` rồi retry request
- **Rate limit UI**: sau khi nhận 429, hiển thị countdown 15 phút, disable form
- **Input validation**: validate trước khi gửi request
- **Plant Code sanitize**: chỉ cho phép alphanumeric, tự động uppercase

---

## Build production

```bash
npm run build
# Output: dist/
```
# plan_identity
