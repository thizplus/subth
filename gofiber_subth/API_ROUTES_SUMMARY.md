# GoFiber Subth - API Routes Summary

## ภาพรวม

**Base URL:** `/api/v1`
**Health Check:** `/health` (Public)

---

## สรุป CRUD Completion

| Resource | Create | Read | Update | Delete | List | Search | สถานะ |
|----------|--------|------|--------|--------|------|--------|-------|
| **Videos** | ✅ Admin | ✅ | ✅ Admin | ✅ Admin | ✅ | ✅ | **100%** |
| **Jobs** | ✅ Admin | ✅ Admin | ✅ Admin | ✅ Admin | ✅ Admin | ❌ | **100%** |
| **Tasks** | ✅ User | ✅ Own | ✅ Own | ✅ Own | ✅ Admin | ❌ | **100%** |
| **Files** | ✅ User | ✅ Own | ❌ | ✅ Own | ✅ Admin | ❌ | **80%** |
| **Users** | ❌ | ✅ Own | ✅ Own | ✅ Own | ✅ Admin | ❌ | **60%** |
| **Makers** | ✅ Admin | ✅ | ✅ Admin | ✅ Admin | ✅ | ✅ | **100%** |
| **Casts** | ✅ Admin | ✅ | ✅ Admin | ✅ Admin | ✅ | ✅ | **100%** |
| **Tags** | ✅ Admin | ✅ | ✅ Admin | ✅ Admin | ✅ | ✅ | **100%** |
| **Categories** | ✅ Admin | ✅ | ✅ Admin | ✅ Admin | ✅ | ❌ | **100%** |

---

## Middleware Protection Levels

| Level | Description |
|-------|-------------|
| **Public** | ไม่ต้อง authentication |
| **Protected()** | ต้องมี JWT token |
| **AdminOnly()** | ต้องมี JWT + role = admin |
| **OwnerOnly()** | ต้องเป็นเจ้าของ resource |
| **Optional()** | มี JWT หรือไม่มีก็ได้ |

---

## รายละเอียด Endpoints

### 1. Authentication `/auth` (Public)

| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| POST | `/register` | `UserHandler.Register` | สร้าง account ใหม่ |
| POST | `/login` | `UserHandler.Login` | Login รับ JWT token |

**สถานะ:** ✅ ครบ

---

### 2. Users `/users` (Protected)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/profile` | Protected | ดู profile ตัวเอง |
| PUT | `/profile` | Protected | แก้ไข profile ตัวเอง |
| DELETE | `/profile` | Protected | ลบ account ตัวเอง |
| GET | `/` | Admin | ดูรายการ users ทั้งหมด |

**ขาด (สำหรับ Admin Panel):**
- ❌ `POST /users` - Admin สร้าง user
- ❌ `GET /users/:id` - Admin ดู user คนอื่น
- ❌ `PUT /users/:id` - Admin แก้ไข user คนอื่น
- ❌ `DELETE /users/:id` - Admin ลบ user คนอื่น

---

### 3. Videos `/videos` (Mixed)

#### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | รายการ videos (pagination, filter, sort) |
| GET | `/random` | สุ่ม videos |
| GET | `/search` | ค้นหาตาม title |
| GET | `/auto-tags` | Filter ตาม AI tags |
| GET | `/maker/:maker_id` | Videos ตาม maker |
| GET | `/cast/:cast_id` | Videos ตาม cast |
| GET | `/tag/:tag_id` | Videos ตาม tag |
| GET | `/:id` | ดู video เดียว |

#### Admin Endpoints (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | สร้าง video |
| POST | `/batch` | สร้าง videos แบบ batch |
| PUT | `/:id` | แก้ไข video |
| DELETE | `/:id` | ลบ video |

**สถานะ:** ✅ ครบ 100%

---

### 4. Makers `/makers` (Mixed)

#### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | รายการ makers |
| GET | `/search` | ค้นหา makers |
| GET | `/top` | Top makers ตาม video count |
| GET | `/slug/:slug` | ดูตาม slug |
| GET | `/:id` | ดูตาม ID |

#### Admin Endpoints (Protected + Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | สร้าง maker |
| PUT | `/:id` | แก้ไข maker |
| DELETE | `/:id` | ลบ maker |

**สถานะ:** ✅ ครบ 100%

---

### 5. Casts `/casts` (Mixed)

#### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | รายการ casts |
| GET | `/search` | ค้นหา casts |
| GET | `/top` | Top casts ตาม video count |
| GET | `/slug/:slug` | ดูตาม slug |
| GET | `/:id` | ดูตาม ID |

#### Admin Endpoints (Protected + Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | สร้าง cast (รองรับ translations) |
| PUT | `/:id` | แก้ไข cast |
| DELETE | `/:id` | ลบ cast |

**สถานะ:** ✅ ครบ 100%

---

### 6. Tags `/tags` (Mixed)

#### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | รายการ tags |
| GET | `/search` | ค้นหา tags |
| GET | `/top` | Top tags ตาม video count |
| GET | `/slug/:slug` | ดูตาม slug |
| GET | `/:id` | ดูตาม ID |
| GET | `/auto` | รายการ AI auto-tags |
| GET | `/auto/by-keys` | ดู auto-tags ตาม keys |

#### Admin Endpoints (Protected + Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | สร้าง tag (รองรับ translations) |
| PUT | `/:id` | แก้ไข tag |
| DELETE | `/:id` | ลบ tag |

**สถานะ:** ✅ ครบ 100%

---

### 7. Categories `/categories` (Mixed)

#### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | รายการ categories |
| GET | `/:id` | ดู category |

#### Admin Endpoints (Protected + Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | สร้าง category (รองรับ translations) |
| PUT | `/:id` | แก้ไข category |
| DELETE | `/:id` | ลบ category |

**สถานะ:** ✅ ครบ 100%

---

### 8. Tasks `/tasks` (Protected)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Protected | สร้าง task |
| GET | `/my` | Protected | ดู tasks ของตัวเอง |
| GET | `/:id` | Protected | ดู task |
| PUT | `/:id` | Owner | แก้ไข task ของตัวเอง |
| DELETE | `/:id` | Owner | ลบ task ของตัวเอง |
| GET | `/` | Admin | ดู tasks ทั้งหมด |

**สถานะ:** ✅ ครบ

---

### 9. Files `/files` (Protected)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/upload` | Protected | Upload file |
| GET | `/my` | Protected | ดู files ของตัวเอง |
| GET | `/:id` | Protected | ดู file |
| DELETE | `/:id` | Owner | ลบ file ของตัวเอง |
| GET | `/` | Admin | ดู files ทั้งหมด |

**สถานะ:** ✅ ครบ (แต่ไม่มี update)

---

### 10. Jobs `/jobs` (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | สร้าง job |
| GET | `/` | รายการ jobs |
| GET | `/:id` | ดู job |
| PUT | `/:id` | แก้ไข job |
| DELETE | `/:id` | ลบ job |
| POST | `/:id/start` | Start job |
| POST | `/:id/stop` | Stop job |

**สถานะ:** ✅ ครบ 100%

---

### 11. Stats `/stats` (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | สถิติรวม |
| GET | `/top-makers` | Top makers |
| GET | `/top-casts` | Top casts |
| GET | `/top-tags` | Top tags |

**สถานะ:** ✅ ครบ

---

### 12. Semantic Search `/semantic` (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search` | ค้นหา semantic (query param) |
| POST | `/search` | ค้นหา semantic (body) |
| GET | `/similar/:id` | หา videos ที่คล้ายกัน |
| POST | `/hybrid` | Hybrid search (vector + text) |

**สถานะ:** ✅ ครบ

---

### 13. Chat `/chat` (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/semantic` | RAG chat with semantic search |

**สถานะ:** ✅ ครบ (basic)

---

### 14. WebSocket `/ws` (Optional Auth)

| Operation | Description |
|-----------|-------------|
| WebSocket Upgrade | Real-time communication |

**สถานะ:** ✅ ครบ

---

## สิ่งที่ต้องเพิ่มสำหรับ Admin Panel

### Priority 1: High (จำเป็นต้องมี) - ✅ เสร็จแล้ว

- ✅ Makers Admin Routes (Create, Update, Delete)
- ✅ Casts Admin Routes (Create, Update, Delete + Translations)
- ✅ Tags Admin Routes (Create, Update, Delete + Translations)
- ✅ Categories Admin Routes (Create, Update, Delete + Translations)

### Priority 2: Medium (ควรมี) - ยังไม่ทำ

#### Users Admin Routes
```go
// ต้องเพิ่มใน user_routes.go
POST   /users            → CreateUser (Admin)
GET    /users/:id        → GetUser (Admin)
PUT    /users/:id        → UpdateUser (Admin)
DELETE /users/:id        → DeleteUser (Admin)
```

---

## สรุป

| ส่วน | สถานะ | หมายเหตุ |
|------|-------|----------|
| **Videos** | ✅ พร้อมใช้ | CRUD ครบ |
| **Jobs** | ✅ พร้อมใช้ | CRUD ครบ + start/stop |
| **Tasks** | ✅ พร้อมใช้ | CRUD ครบ |
| **Files** | ✅ พร้อมใช้ | Upload/Delete ครบ |
| **Stats** | ✅ พร้อมใช้ | Read only |
| **Semantic** | ✅ พร้อมใช้ | Search ครบ |
| **Makers** | ✅ พร้อมใช้ | CRUD ครบ |
| **Casts** | ✅ พร้อมใช้ | CRUD ครบ + Translations |
| **Tags** | ✅ พร้อมใช้ | CRUD ครบ + Translations |
| **Categories** | ✅ พร้อมใช้ | CRUD ครบ + Translations |
| **Users** | ⚠️ ต้องเพิ่ม | ขาด Admin CRUD |

**Backend พร้อม ~95%** สำหรับ Admin Panel

เหลือเพิ่ม Admin CRUD สำหรับ: Users (optional - ถ้าต้องการจัดการ users จาก admin panel)

---

*Last updated: 2026-01-30 (Admin CRUD added for Makers, Casts, Tags, Categories)*
