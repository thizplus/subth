# Private Routes Implementation Plan (Updated)

## Overview
ปรับโครงสร้าง routes ให้แบ่งเป็น Public และ Member (Protected) พร้อม Google OAuth Login

---

## Decisions Summary

| Item | Decision |
|------|----------|
| **Auth** | Google OAuth (มีอยู่แล้วใน backend) |
| **Token** | localStorage + ไม่หมดอายุ (long-lived) |
| **Reels** | มีระบบสร้าง reel แยก → เพิ่ม fields ใน Video model |
| **Feed** | ใช้ cover.jpg จาก reel worker |
| **i18n** | `/en/member/` pattern |
| **Virtual Scroll** | react-virtuoso (มีอยู่แล้ว) |

---

## Current Backend Auth (พร้อมใช้งาน)

```
GET  /api/v1/auth/google           → Redirect to Google OAuth
GET  /api/v1/auth/google/callback  → Handle callback, return token
GET  /api/v1/auth/me               → Get current user (Protected)
POST /api/v1/auth/login            → Email/password login
POST /api/v1/auth/register         → Email/password register
```

### Backend Changes Needed

#### 1. Support Multiple Frontend URLs
ปัจจุบัน `FRONTEND_URL=https://admin.subth.com` redirect ไป admin เท่านั้น

**Option A:** Environment variable แยก
```env
GOOGLE_REDIRECT_URL=https://api.subth.com/api/v1/auth/google/callback
ADMIN_FRONTEND_URL=https://admin.subth.com
MEMBER_FRONTEND_URL=https://subth.com
```

**Option B:** ส่ง `redirect_uri` param ตอน login
```
GET /api/v1/auth/google?redirect=https://subth.com/auth/callback
```

**Recommended:** Option B - ยืดหยุ่นกว่า

#### 2. JWT Token - No Expiry
แก้ไข `pkg/utils/jwt.go` ให้ token ไม่หมดอายุ (หรือ 100 ปี)

```go
// เปลี่ยนจาก
ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour))
// เป็น
ExpiresAt: jwt.NewNumericDate(time.Now().Add(100 * 365 * 24 * time.Hour))
```

#### 3. Video Model - Add Reel Fields
```go
type Video struct {
    // ... existing fields

    // Reel fields (from reel worker)
    ReelVideoURL  string `gorm:"size:500" json:"reel_video_url"`  // cdn.suekk.com/xxx/output.mp4
    ReelThumbURL  string `gorm:"size:500" json:"reel_thumb_url"`  // cdn.suekk.com/xxx/thumb.jpg
    ReelCoverURL  string `gorm:"size:500" json:"reel_cover_url"`  // cdn.suekk.com/xxx/cover.jpg
    HasReel       bool   `gorm:"default:false" json:"has_reel"`   // มี reel หรือยัง
}
```

#### 4. New API Endpoints
```go
// Public endpoints (ไม่ต้อง auth)
GET /api/v1/feed              → Videos with reel cover (for home feed)
GET /api/v1/reels             → Videos with reel video (for reels page)
```

---

## Routes Structure

### Public Routes (ไม่ต้อง Login)
```
/                       → Feed (cover images, title, hashtags)
/reels                  → Reels player (vertical video)
/login                  → Google Login button
/auth/callback          → Handle OAuth callback
/en/                    → English feed
/en/reels               → English reels
/en/login               → English login
```

### Member Routes (ต้อง Login)
```
/member                     → Video listing (current home)
/member/videos/[id]         → Video detail + player
/member/casts               → Cast listing
/member/casts/[slug]        → Videos by cast
/member/casts/[slug]/page/[page]
/member/tags                → Tag listing
/member/tags/[slug]         → Videos by tag
/member/tags/[slug]/page/[page]
/member/makers/[slug]       → Videos by maker
/member/makers/[slug]/page/[page]
/member/category/[slug]     → Videos by category
/member/category/[slug]/page/[page]
/member/search              → Search
/member/ai-search           → AI Search
/member/page/[page]         → Pagination

/en/member/...              → English versions
```

---

## Implementation Tasks

### Phase 1: Backend Changes

#### 1.1 Google OAuth Multi-Frontend Support ✅ DONE
```
File: gofiber_subth/interfaces/api/handlers/auth_handler.go
```
- [x] รับ `redirect` query param
- [x] Validate allowed redirect URLs (via ALLOWED_REDIRECT_URLS env)
- [x] Store redirect URL in cookie/state

#### 1.2 JWT No Expiry ✅ DONE
```
File: gofiber_subth/application/serviceimpl/user_service_impl.go
```
- [x] เปลี่ยน expiry เป็น 100 ปี

#### 1.3 Video Model Update ✅ DONE
```
File: gofiber_subth/domain/models/video.go
```
- [x] เพิ่ม ReelVideoURL, ReelThumbURL, ReelCoverURL, HasReel

#### 1.4 Migration
```
File: gofiber_subth/cmd/migrate/main.go
```
- [ ] Run migration เพิ่ม columns (auto-migrate ทำให้อัตโนมัติเมื่อ restart server)

#### 1.5 Feed/Reels Endpoints ✅ DONE
```
Files:
- gofiber_subth/interfaces/api/routes/feed_routes.go (NEW)
- gofiber_subth/interfaces/api/handlers/feed_handler.go (NEW)
- gofiber_subth/domain/services/feed_service.go (NEW)
- gofiber_subth/application/serviceimpl/feed_service_impl.go (NEW)
- gofiber_subth/domain/dto/feed.go (NEW)
- gofiber_subth/domain/repositories/video_repository.go (EDIT - GetWithReels)
- gofiber_subth/infrastructure/postgres/video_repository_impl.go (EDIT)
- gofiber_subth/pkg/di/container.go (EDIT - FeedService)
- gofiber_subth/interfaces/api/handlers/handlers.go (EDIT - FeedHandler)
```
- [x] GET /api/v1/feed - return videos with has_reel=true, include cover
- [x] GET /api/v1/reels - return videos with has_reel=true, include reel video

---

### Phase 2: Frontend Auth System ✅ DONE

#### 2.1 Auth Feature Module ✅ DONE
```
src/features/auth/
├── components/
│   ├── google-login-button.tsx  ✅
│   ├── auth-provider.tsx        ✅
│   ├── protected-route.tsx      ✅
│   └── index.ts                 ✅
├── service.ts          ✅ getMe, getGoogleAuthUrl, parseCallbackParams
├── types.ts            ✅ User, AuthState, AuthMeResponse
├── store.ts            ✅ Zustand: user, token, isAuthenticated
├── hooks.ts            ✅ useAuth, useIsAuthenticated
└── index.ts            ✅
```

#### 2.2 Auth Store (Zustand + persist)
```typescript
// src/features/auth/store.ts
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: 'auth-storage' }  // localStorage key
  )
)
```

#### 2.3 Auth Provider
```typescript
// src/features/auth/components/auth-provider.tsx
export function AuthProvider({ children }) {
  const { token, login, logout, setLoading } = useAuthStore()

  useEffect(() => {
    if (token) {
      // Verify token with /auth/me
      authService.getMe(token)
        .then(user => login(token, user))
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  return <>{children}</>
}
```

#### 2.4 API Client with Auth
```typescript
// src/lib/api-client.ts
const apiClient = {
  async get<T>(url: string, options?: RequestInit): Promise<T> {
    const token = useAuthStore.getState().token
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
    const res = await fetch(`${API_URL}${url}`, { ...options, headers })
    if (!res.ok) throw new Error('API Error')
    return res.json()
  }
}
```

---

### Phase 3: Route Restructuring 🚧 IN PROGRESS

#### 3.1 App Directory Structure
```
src/app/
├── layout.tsx                    ✅ Root layout (AuthProvider, ThemeProvider)
├── (public)/                     ✅ Public layout group
│   ├── layout.tsx                ✅ Public layout (no auth check)
│   ├── page.tsx                  [ ] Feed home
│   ├── reels/page.tsx            [ ] Reels
│   ├── login/page.tsx            ✅ Login
│   └── auth/callback/page.tsx    ✅ OAuth callback
│
├── member/                       ✅ Protected routes
│   ├── layout.tsx                ✅ Member layout (auth check, redirect if not logged in)
│   ├── page.tsx                  ✅ Basic member home
│   ├── videos/[id]/page.tsx      [ ] Need to migrate from (main)
│   ├── casts/                    [ ] Need to migrate from (main)
│   ├── tags/                     [ ] Need to migrate from (main)
│   ├── makers/                   [ ] Need to migrate from (main)
│   ├── category/                 [ ] Need to migrate from (main)
│   ├── search/page.tsx           [ ] Need to migrate from (main)
│   ├── ai-search/page.tsx        [ ] Need to migrate from (main)
│   └── page/[page]/page.tsx      [ ] Need to migrate from (main)
│
└── en/                           [ ] English routes
    ├── (public)/...
    └── member/...
```

#### 3.2 Member Layout (Auth Check)
```typescript
// src/app/member/layout.tsx
"use client"
import { useAuthStore } from "@/features/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function MemberLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated])

  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return null

  return (
    <>
      <Header />
      <main>{children}</main>
      <BottomNav />
    </>
  )
}
```

---

### Phase 4: New Public Pages 🚧 IN PROGRESS

#### 4.1 Feed Feature ✅ DONE
```
src/features/feed/
├── components/
│   ├── feed-card.tsx           ✅ Cover image, title, hashtags
│   ├── feed-list.tsx           ✅ Grid list
│   └── index.ts                ✅
├── service.ts                  ✅ getFeed(), getReels()
├── types.ts                    ✅ FeedItem, ReelItem
└── index.ts
```

**FeedCard Design:**
```
┌─────────────────────────┐
│  [Cover Image]          │  ← cover.jpg from reel worker
│                         │
├─────────────────────────┤
│  Title                  │
│  Description excerpt... │
│  #tag1 #tag2 #tag3      │
│                         │
│  [Login to watch]       │  ← CTA button
└─────────────────────────┘
```

#### 4.2 Reels Feature
```
src/features/reels/
├── components/
│   ├── reel-player.tsx         # Vertical video player
│   ├── reel-feed.tsx           # Swipe navigation (Virtuoso)
│   ├── reel-overlay.tsx        # Title, hashtags overlay
│   └── index.ts
├── service.ts                  # getReels()
├── types.ts                    # ReelItem
└── index.ts
```

**Reel Player Design:**
```
┌─────────────────────────┐
│                         │
│    [Vertical Video]     │  ← output.mp4 from reel worker
│                         │
│  ┌───────────────────┐  │
│  │ Title             │  │
│  │ #tag1 #tag2       │  │
│  │                   │  │
│  │ [Login for more]  │  │
│  └───────────────────┘  │
└─────────────────────────┘
     Swipe up/down
```

---

## File Changes Summary

### Backend (gofiber_subth)
| File | Action | Description |
|------|--------|-------------|
| `pkg/utils/jwt.go` | EDIT | No expiry token |
| `domain/models/video.go` | EDIT | Add reel fields |
| `interfaces/api/handlers/auth_handler.go` | EDIT | Multi-frontend redirect |
| `interfaces/api/routes/feed_routes.go` | NEW | Feed/Reels routes |
| `interfaces/api/handlers/feed_handler.go` | NEW | Feed/Reels handlers |
| `domain/services/feed_service.go` | NEW | Feed service interface |
| `application/serviceimpl/feed_service_impl.go` | NEW | Feed service impl |

### Frontend (nextjs_subth)
| File | Action | Description |
|------|--------|-------------|
| `src/features/auth/*` | NEW | Auth feature module |
| `src/lib/api-client.ts` | NEW | API client with auth |
| `src/app/(public)/*` | NEW | Public pages |
| `src/app/member/*` | NEW | Member pages (move from (main)) |
| `src/features/feed/*` | NEW | Feed feature |
| `src/features/reels/*` | NEW | Reels feature |

---

## Priority Order

| # | Task | Files | Effort |
|---|------|-------|--------|
| 1 | Backend: JWT no expiry | 1 | Low |
| 2 | Backend: Video model + migration | 2 | Low |
| 3 | Backend: Multi-frontend OAuth | 1 | Medium |
| 4 | Backend: Feed/Reels API | 4 | Medium |
| 5 | Frontend: Auth feature | 6 | Medium |
| 6 | Frontend: Move routes to /member | 20+ | Medium |
| 7 | Frontend: Login page | 1 | Low |
| 8 | Frontend: OAuth callback | 1 | Low |
| 9 | Frontend: Feed page | 4 | Medium |
| 10 | Frontend: Reels page | 4 | High |

---

## CDN URLs

| Type | URL Pattern |
|------|-------------|
| Video Thumbnail | `https://files.subth.com/thumbnails/{code}.jpg` |
| Reel Video | `https://cdn.suekk.com/{video_id}/output.mp4` |
| Reel Thumb | `https://cdn.suekk.com/{video_id}/thumb.jpg` |
| Reel Cover | `https://cdn.suekk.com/{video_id}/cover.jpg` |
| Video Player | `https://player.suekk.com/embed/{id}` |

---

## Notes

- ใช้ `react-virtuoso` สำหรับ virtual scroll (มีใน package.json แล้ว)
- ยึดตาม global rules ใน CLAUDE.md
- Token เก็บใน localStorage ผ่าน Zustand persist
- ไม่มี refresh token (login ครั้งเดียว อยู่ตลอด)
- ใช้ shadcn ui เท่านั้นนะครับ เพื่อความสวยงาม นี่คือที่รวม component  https://ui.shadcn.com/docs/components
---

*Updated: 2026-02-05*
