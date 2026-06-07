# NextJS SubTH - Public Refactor Plan

## สถานะปัจจุบัน (Current State)

### Architecture
- **Framework**: Next.js 14+ (App Router)
- **Auth**: Zustand + localStorage + Google OAuth
- **Guard**: Client-side `MemberAuthGuard` (ไม่มี middleware.ts)
- **Language**: Thai (default `/`) + English (`/en/`)

### Route Map

#### Public Routes (ไม่ต้อง Login)
| Route | Content |
|-------|---------|
| `/` | Landing page - Hero + รีวิว JAV 12 รายการ + FAQ (SEO) |
| `/articles` | รายการรีวิวทั้งหมด |
| `/articles/review/[slug]` | อ่านรีวิวรายละเอียด |
| `/casts` | ดารา AV directory |
| `/casts/[slug]` | รายละเอียดดารา |
| `/makers` | ค่ายผลิต directory |
| `/tags` | หมวดหมู่/แนว |
| `/reels` | คลิปสั้น TikTok-style |
| `/login` | หน้า Login (Google OAuth) |
| `/about`, `/contact`, `/terms-of-service`, `/privacy-policy` | Legal |

#### Protected Routes (ต้อง Login - MemberAuthGuard)
| Route | Content |
|-------|---------|
| `/member` | Dashboard - วิดีโอจัดกลุ่มตาม Category (6 ต่อกลุ่ม) |
| `/member/videos/[id]` | ดูวิดีโอ + comments + like |
| `/member/casts` | ดาราแบบ filtered |
| `/member/casts/[slug]` | รายละเอียดดารา + วิดีโอ |
| `/member/makers` | ค่ายผลิต |
| `/member/makers/[slug]` | รายละเอียดค่าย |
| `/member/tags` | แท็ก |
| `/member/tags/[slug]` | วิดีโอตามแท็ก |
| `/member/category/[slug]` | วิดีโอตาม category |
| `/member/search` | Full-text search |
| `/member/ai-search` | AI semantic search (CLIP) |
| `/member/profile` | โปรไฟล์ + XP + activity history |

### Auth Flow
```
User → /login → Google OAuth → Backend
  → /auth/google/callback?token=xxx
  → localStorage (auth-storage) + Zustand store
  → redirect /member
```

### Layout Structure
```
Root Layout (ThemeProvider → QueryProvider → AuthProvider → XPNotification)
├── Public: PublicLayout (Header + optional Sidebar)
└── Member: MemberAuthGuard → Sidebar + Header + Chat + SemanticSearch
```

---

## เป้าหมาย (Goal)

**เปลี่ยนให้ `/` แสดง content แบบ /member (dashboard)** — ทุกคนดูได้โดยไม่ต้อง login

- `/` → แสดงวิดีโอจัดกลุ่มตาม Category (เหมือน /member เดิม)
- ระบบ Login ยังเก็บไว้ (สำหรับ like, comment, profile, XP)
- ไม่ต้องมีหน้า Landing/Hero/FAQ อีก (หรือย้ายไป /about)

---

## สิ่งที่ต้องเปลี่ยน

### 1. Route & Page Changes

| Action | Detail |
|--------|--------|
| แก้ `/` (`src/app/page.tsx`) | เปลี่ยนจาก Landing → แสดง CategoryWithVideos grid (เหมือน /member) |
| แก้ Root Layout | ใช้ Member-style layout (Sidebar + Header) สำหรับ `/` |
| ลบ/ย้าย Landing content | Hero + FAQ → `/about` หรือลบทิ้ง |
| เปลี่ยน `/member` → optional | `/member/profile`, `/member/ai-search` ยังต้อง login |

### 2. Layout Changes

**ปัจจุบัน:**
```
/ → PublicLayout (simple header, no sidebar)
/member → MemberLayout (sidebar + header + chat)
```

**เปลี่ยนเป็น:**
```
/ → MemberLayout style (sidebar + header) แต่ไม่มี AuthGuard
/member/profile → ยังต้อง login (AuthGuard เฉพาะหน้าที่ต้องใช้ user data)
```

### 3. Auth Guard Changes

| File | Change |
|------|--------|
| `src/app/member/layout.tsx` | ลบ MemberAuthGuard wrapper |
| สร้าง `src/app/(protected)/layout.tsx` | AuthGuard เฉพาะ profile, settings |
| Video/Cast/Category pages | เข้าถึงได้ทุกคน แต่ like/comment ต้อง login |

### 4. Component Changes

| Component | Current | New |
|-----------|---------|-----|
| MemberHeader | แสดง user info เสมอ | แสดง "Login" button ถ้าไม่ login |
| MemberSidebar | แสดง XP/Level | ซ่อน XP section ถ้าไม่ login |
| Like/Comment buttons | ทำงานตรง | เช็ค auth → redirect login ถ้ายังไม่ login |
| ChatFab | แสดงเสมอ | ซ่อน/แสดง Login prompt ถ้าไม่ login |
| VideoCard | Link ไป /member/videos/[id] | Link ไป /videos/[id] (public) |

### 5. API Changes (Backend)

| Endpoint | Current | New |
|----------|---------|-----|
| GET /videos | ต้อง token | Public (ไม่ต้อง token) |
| GET /videos/:id | ต้อง token | Public |
| GET /categories | ต้อง token | Public |
| POST /videos/:id/like | ต้อง token | ยังต้อง token (OK) |
| POST /comments | ต้อง token | ยังต้อง token (OK) |
| GET /profile | ต้อง token | ยังต้อง token (OK) |

**ต้องเช็ค Backend**: endpoint ไหนบ้างที่ require auth แต่ควรเป็น public

### 6. URL Structure ใหม่

| Old Route | New Route | Auth Required |
|-----------|-----------|---------------|
| `/` (landing) | `/about` หรือลบ | No |
| `/member` (dashboard) | `/` | **No** |
| `/member/videos/[id]` | `/videos/[id]` | **No** (view), Yes (interact) |
| `/member/casts` | `/casts` (มีอยู่แล้ว) | No |
| `/member/search` | `/search` | No |
| `/member/ai-search` | `/ai-search` | No (or Yes) |
| `/member/profile` | `/profile` | **Yes** |
| `/member/category/[slug]` | `/category/[slug]` | No |

### 7. SEO Considerations

- หน้า `/` ใหม่ต้องมี metadata ดีๆ (title, description, structured data)
- Video pages ที่เป็น public → เพิ่ม VideoObject schema
- Sitemap ต้อง update ให้รวม video pages
- ระวัง: ถ้าเปลี่ยน URL structure ต้องทำ redirects (301) จาก `/member/*` → ใหม่

---

## Key Files ที่ต้องแก้

| File | What to Change |
|------|---------------|
| `src/app/page.tsx` | เปลี่ยนจาก Landing → Dashboard content |
| `src/app/layout.tsx` | อาจต้องเพิ่ม Sidebar + Header สำหรับทุกหน้า |
| `src/app/member/layout.tsx` | ลบ AuthGuard, ย้าย layout ไป root |
| `src/app/member/page.tsx` | ย้าย content ไป `/` |
| `src/features/auth/components/auth-guard.tsx` | ใช้เฉพาะ /profile |
| `src/components/layout/member-header.tsx` | เพิ่ม conditional: Login btn vs User menu |
| `src/components/layout/member-sidebar.tsx` | ซ่อน XP/Level ถ้าไม่ login |
| `src/lib/api-client.ts` | แยก publicGet vs authGet |
| `src/features/video/components/*` | Like/Comment → check auth |

---

## Estimated Scope

| Category | Files | Effort |
|----------|-------|--------|
| Route restructure | ~15-20 pages | High |
| Layout refactor | ~5 layout files | Medium |
| Component auth-aware | ~10 components | Medium |
| Backend API (public endpoints) | ~5-10 handlers | Medium |
| SEO & Redirects | ~5 files | Low |
| **Total** | ~40-50 files | **Large** |

---

## Suggested Phase Plan

### Phase 1: Make Video Content Public
- เปลี่ยน API endpoints ให้ public (GET videos, categories)
- สร้าง `/videos/[id]` public route
- สร้าง `/category/[slug]` public route

### Phase 2: Refactor Layout
- ย้าย MemberLayout → เป็น default layout (ไม่มี guard)
- Header: conditional login button vs user menu
- Sidebar: ซ่อน XP section ถ้าไม่ login

### Phase 3: Change Home Page
- เปลี่ยน `/` → Dashboard (CategoryWithVideos)
- ย้าย/ลบ Landing content
- Update navigation links

### Phase 4: Protected-only Pages
- `/profile` → ยังต้อง AuthGuard
- Like/Comment → prompt login modal
- Chat → ต้อง login

### Phase 5: Cleanup & SEO
- ลบ `/member` routes เก่า (หรือ redirect 301)
- Update sitemap
- Update structured data
