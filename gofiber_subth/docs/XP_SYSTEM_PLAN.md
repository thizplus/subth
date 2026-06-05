# ระบบคะแนน XP - แผนการพัฒนา

## สรุปภาพรวม

ระบบให้ XP เมื่อ user ทำกิจกรรมต่างๆ เพื่อเพิ่ม engagement และสร้าง gamification

---

## ตาราง XP ที่ได้รับ

| กิจกรรม | XP | เงื่อนไข | Cooldown |
|---------|-----|----------|----------|
| **สมัครสมาชิก** | +100 | ครั้งแรกที่สมัคร | 1 ครั้งตลอดไป |
| **ดู Video** | +5 | ดูครบ 30 วินาที หรือ 50% | 1 ครั้ง/video ตลอดไป |
| **กด Like** | +2 | กด like reel | 1 ครั้ง/reel ตลอดไป |
| **Comment** | +10 | เขียน comment | สูงสุด 10 ครั้ง/วัน |

> **หมายเหตุ**: Token ไม่หมดอายุ ดังนั้นไม่มีระบบ login รายวัน/streak

---

## Database Schema

### ตารางที่มีอยู่แล้ว
```sql
-- user_stats (มีอยู่แล้ว)
- id, user_id, xp, level, title
- total_views, total_likes, total_comments
- login_streak, last_login_at
```

### ตารางใหม่ที่ต้องสร้าง
```sql
-- xp_transactions: บันทึกประวัติการได้รับ XP
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    xp_amount INT NOT NULL,
    source VARCHAR(50) NOT NULL,  -- 'login', 'view', 'like', 'comment', 'received_like'
    reference_id UUID,             -- reel_id, comment_id, etc.
    reference_type VARCHAR(50),    -- 'reel', 'comment'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created_at ON xp_transactions(created_at);

-- video_views: บันทึกการดู video (สำหรับ cooldown และ analytics)
CREATE TABLE video_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    reel_id UUID NOT NULL REFERENCES reels(id),
    watch_duration INT DEFAULT 0,   -- วินาทีที่ดู
    watch_percent FLOAT DEFAULT 0,  -- % ที่ดู
    xp_awarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, reel_id, DATE(created_at))  -- 1 record per user per reel per day
);

CREATE INDEX idx_video_views_user_reel ON video_views(user_id, reel_id);
```

---

## API Endpoints

### 1. บันทึกการดู Video
```
POST /api/v1/reels/:id/view
Authorization: Bearer {token}

Body:
{
    "watchDuration": 45,    // วินาที
    "watchPercent": 75.5    // %
}

Response:
{
    "success": true,
    "data": {
        "xpAwarded": true,
        "xpAmount": 5,
        "totalXp": 150,
        "leveledUp": false
    }
}
```

### 2. ดูประวัติ XP
```
GET /api/v1/users/me/xp-history?page=1&limit=20

Response:
{
    "success": true,
    "data": [
        {
            "id": "...",
            "xpAmount": 5,
            "source": "view",
            "referenceType": "reel",
            "createdAt": "2024-01-15T10:30:00Z"
        }
    ],
    "meta": { ... }
}
```

---

## Implementation Plan

### Phase 1: Database & Models
1. สร้าง migration สำหรับ `xp_transactions` และ `video_views`
2. สร้าง models ใน `domain/models/`
3. สร้าง repository interfaces และ implementations

### Phase 2: XP Service
1. สร้าง `XPService` interface
2. implement methods:
   - `AwardRegistrationXP(userID)` - ให้ตอนสมัครครั้งแรก
   - `AwardViewXP(userID, reelID, duration, percent)`
   - `AwardLikeXP(userID, reelID)`
   - `AwardCommentXP(userID, reelID)`
   - `GetXPHistory(userID, page, limit)`
3. เพิ่ม cooldown/limit checks

### Phase 3: Integration
1. เรียก `AwardLikeXP` ใน `ToggleLike` handler (เฉพาะตอน like ไม่ใช่ unlike)
2. เรียก `AwardCommentXP` ใน `CreateComment` handler
3. สร้าง `RecordView` endpoint และเรียก `AwardViewXP`

### Phase 4: Frontend
1. สร้าง hook `useRecordView(reelId)` ที่ track watch time
2. เรียก API เมื่อดูครบ 30 วินาที หรือ 50%
3. แสดง notification เมื่อได้รับ XP (optional)

---

## Anti-Abuse Measures

### Cooldowns
- Registration: 1 ครั้งตลอดไป
- View: 1 ครั้ง/video ตลอดไป (ป้องกัน refresh spam)
- Like: 1 ครั้ง/reel ตลอดไป (unlike แล้ว like ใหม่ไม่ได้ XP)
- Comment: สูงสุด 10 ครั้ง/วัน (ป้องกัน spam)

### Validation
- View ต้องดูจริง 30+ วินาที หรือ 50%+
- Comment ต้องมีความยาวอย่างน้อย 5 ตัวอักษร

### Rate Limiting
- API rate limit ปกติ
- ตรวจจับ pattern ผิดปกติ (future)

---

## Level Calculation (มีอยู่แล้ว)

```go
// XP required = level * 100 + (level² * 10)
// Level 1→2: 110 XP
// Level 2→3: 240 XP
// Level 3→4: 390 XP
// ...
```

### Level Badges
| Level | Badge | ชื่อ |
|-------|-------|------|
| 1-9 | ⭐ | Starter |
| 10-24 | 🥉 | Bronze |
| 25-49 | 🥈 | Silver |
| 50-74 | 🥇 | Gold |
| 75-98 | 💎 | Diamond |
| 99 | 👑 | Legend |

---

## Files ที่ต้องสร้าง/แก้ไข

### Backend (gofiber_subth)
```
domain/
├── models/
│   ├── xp_transaction.go       # NEW
│   └── video_view.go           # NEW
├── repositories/
│   ├── xp_transaction_repository.go    # NEW
│   └── video_view_repository.go        # NEW
├── services/
│   └── xp_service.go           # NEW
├── dto/
│   └── xp.go                   # NEW

application/serviceimpl/
└── xp_service_impl.go          # NEW

infrastructure/postgres/
├── xp_transaction_repository_impl.go   # NEW
└── video_view_repository_impl.go       # NEW

interfaces/api/
├── handlers/
│   └── xp_handler.go           # NEW (or extend user_stats_handler)
└── routes/
    └── xp_routes.go            # NEW

cmd/migrate/
└── migrations/
    └── 00X_create_xp_tables.sql    # NEW
```

### Frontend (nextjs_subth)
```
src/features/
├── engagement/
│   ├── hooks.ts                # UPDATE: add useRecordView
│   └── service.ts              # UPDATE: add recordView API
└── user-stats/
    ├── hooks.ts                # UPDATE: add useXPHistory
    └── types.ts                # UPDATE: add XPTransaction type
```

---

## Timeline (ประมาณการ)

| Phase | งาน | Priority |
|-------|-----|----------|
| 1 | Database migration + Models | High |
| 2 | XP Service + Repository | High |
| 3 | Like/Comment XP integration | High |
| 4 | View tracking + XP | Medium |
| 5 | Frontend notifications | Low |
| 6 | XP History page | Low |

---

## คำถามที่ต้องตัดสินใจ

1. **Unlike แล้ว like ใหม่** - ให้ XP ซ้ำไหม? (แนะนำ: ไม่ให้)
2. **ลบ comment** - หัก XP คืนไหม? (แนะนำ: ไม่หัก)
3. **Daily cap** - จำกัด XP รวมต่อวันไหม? (แนะนำ: ไม่จำกัด แต่จำกัดต่อ action)
4. **XP decay** - XP หมดอายุไหม? (แนะนำ: ไม่หมดอายุ)

---

*สร้างเมื่อ: 2026-02-05*
