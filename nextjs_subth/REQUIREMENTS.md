# User Feature Requirements - SubTH

## สรุปความต้องการ

เมื่อ client เข้าสู่ระบบ ต้องการให้ระบบมีความสามารถดังนี้:

---

## 1. ข้อมูลผู้ใช้จำลอง (Privacy Protection)

| รายการ | รายละเอียด |
|--------|------------|
| **อีเมล** | ใช้ของจริง (สำหรับ auth) |
| **ชื่อที่แสดง** | ใช้ฉายา/nickname แทนชื่อจริง |
| **Avatar** | Generate จาก DiceBear API |

### Implementation

**Backend (User Model)**
```go
type User struct {
    // ... existing fields
    Nickname    string `json:"nickname"`              // ฉายาที่ตั้งเอง
    AvatarType  string `json:"avatarType"`            // "google", "dicebear", "custom"
    AvatarSeed  string `json:"avatarSeed"`            // seed สำหรับ dicebear
}
```

**Avatar URL Generation**
```
https://api.dicebear.com/7.x/adventurer-neutral/svg?seed={user_id}
```

**ความเป็นไปได้:** ✅ ทำได้ง่าย
- เพิ่ม fields ใน User model
- Frontend เรียก DiceBear API ตาม seed

---

## 2. ระบบฉายา AI-Generated (Gimmick Feature) 🎭

### แนวคิด
- **Level**: ตายตัว (1-5) ขึ้นกับ XP
- **ฉายา**: AI Generate ไม่ซ้ำกัน อิงจากพฤติกรรมของ user

### Data Points สำหรับ Generate ฉายา

| พฤติกรรม | ตัวอย่างฉายา |
|----------|-------------|
| ดูดึกๆ บ่อย (22:00-04:00) | "ราชาแห่งราตรี", "นกฮูกหื่น", "เจ้าแห่งความมืด" |
| ดูเช้าๆ (05:00-08:00) | "นกแก้วตื่นเช้า", "สายลมยามรุ่ง" |
| ดูเร็วมาก (skip บ่อย) | "จอมเร่งรีบ", "นักวิ่งมาราธอน" |
| ดูจบทุกเรื่อง | "นักดูตัวจริง", "คนอดทน" |
| Comment เยอะ | "นักวิจารณ์ตัวยง", "ปากกล้า", "ขุนพล comment" |
| Like เยอะ | "ใจบุญ", "นักแจกหัวใจ" |
| ดูหลากหลาย categories | "นักสำรวจ", "จอมกระจาย", "ไม่เลือกหน้า" |
| ดู category เดิมๆ | "คนรักแนวทาง", "ซื่อสัตย์ต่อรส" |
| Login ทุกวัน | "ขาประจำ", "ไม่มีวันหยุด" |
| ดูวนซ้ำเรื่องเดิม | "คนหลงรัก", "ติดหนึบ" |

### AI Prompt Template (Gemini)

```
สร้างฉายาภาษาไทยสำหรับผู้ใช้ โดยอิงจากข้อมูล:
- ดูวิดีโอทั้งหมด: {total_views} เรื่อง
- ดูจบ: {completed_views} เรื่อง ({completion_rate}%)
- เวลาที่ดูบ่อยสุด: {peak_hour}:00 น.
- Like ทั้งหมด: {total_likes}
- Comment ทั้งหมด: {total_comments}
- Categories ที่ชอบ: {top_categories}
- ความถี่ login: {login_frequency}

กฎ:
1. ฉายาต้องสั้น 2-4 คำ
2. ห้ามหยาบคาย
3. ต้องตลกหรือน่าจดจำ
4. ต้องสะท้อนพฤติกรรมจริง

ตอบแค่ฉายา 1 อัน ไม่ต้องอธิบาย
```

### Implementation

**Backend**
```go
type UserProfile struct {
    UserID       uuid.UUID `json:"userId"`
    Level        int       `json:"level"`           // 1-5 (ตายตัว)
    Title        string    `json:"title"`           // AI-generated ฉายา
    TitleUpdatedAt time.Time `json:"titleUpdatedAt"` // อัพเดททุก 7 วัน
}
```

**Trigger อัพเดทฉายา:**
- ทุก 7 วัน (cron job)
- เมื่อ level up
- เมื่อ user กดขอฉายาใหม่ (1 ครั้ง/สัปดาห์)

**API**
```
POST /api/v1/user/title/regenerate  - ขอฉายาใหม่
GET  /api/v1/user/title/preview     - ดูตัวอย่างฉายาก่อน confirm
```

### UX Flow

```
┌─────────────────────────────────────┐
│  👤 THEPTHAI                        │
│  ⭐ Level 3 - ขาประจำ              │
│  🏷️ "ราชาแห่งราตรี"                │
│                                     │
│  [🔄 ขอฉายาใหม่] (1 ครั้ง/สัปดาห์)  │
└─────────────────────────────────────┘
```

**ความเป็นไปได้:** ✅ ทำได้
- ใช้ Gemini API (มี free tier)
- เก็บ user behavior stats
- Generate ฉายาตาม pattern

---

## 3. ระบบ Level & AI ฉายา (RPG Style) 🎮

### 3.1 Level System (1-99)

**XP Formula:** `XP_required = level * 100 + (level^2 * 10)`

| Level | XP Required | Milestone |
|-------|-------------|-----------|
| 1 | 0 | เริ่มต้น |
| 10 | 2,000 | 🥉 Bronze |
| 25 | 8,750 | 🥈 Silver |
| 50 | 30,000 | 🥇 Gold |
| 75 | 63,750 | 💎 Diamond |
| 99 | 108,900 | 👑 Legend |

### 3.2 XP Sources
| Action | XP | หมายเหตุ |
|--------|-----|----------|
| ดูวิดีโอจบ | +10 | ต้องดู >80% |
| Like | +2 | - |
| Comment | +5 | - |
| Login รายวัน | +15 | - |
| Login streak 7 วัน | +50 | Bonus |
| Share | +3 | - |
| ดูครบ 10 เรื่อง/วัน | +30 | Daily bonus |

### 3.3 AI ฉายา - ได้ใหม่ทุกครั้งที่ Level Up! 🎭

**Concept:** ยิ่ง Level สูง ฉายายิ่งยาว ยิ่งแหวกแนว ยิ่งเท่!

| Level Range | ความยาวฉายา | ตัวอย่าง |
|-------------|-------------|----------|
| 1-10 | สั้น (2-3 คำ) | "ผู้เริ่มต้น", "นักดูมือใหม่" |
| 11-25 | กลาง (4-6 คำ) | "นักเดินทางยามราตรีผู้ไม่หลับ" |
| 26-50 | ยาว (6-10 คำ) | "ขุนศึกแห่งความมืดผู้พิชิตทุกค่ำคืน" |
| 51-75 | ยาวมาก (8-12 คำ) | "จอมยุทธ์ตาค้างผู้กุมชะตาจอภาพแห่งโลกเบื้องหลัง" |
| 76-99 | Epic (10-15 คำ) | "มหาเทพผู้บรรลุธรรมแห่งโลกหลังม่านที่มนุษย์ธรรมดามิอาจเอื้อมถึง" |

### 3.4 AI Prompt Template (Level-based)

```
สร้างฉายาภาษาไทยสำหรับผู้ใช้ Level {level}

ข้อมูลพฤติกรรม:
- ดูวิดีโอทั้งหมด: {total_views} เรื่อง
- เวลาที่ดูบ่อยสุด: {peak_hour}:00 น.
- Categories ที่ชอบ: {top_categories}
- สไตล์การดู: {watch_style}

กฎ:
1. Level 1-10: ฉายาสั้น 2-3 คำ (มือใหม่, กำลังเรียนรู้)
2. Level 11-25: ฉายา 4-6 คำ (เริ่มเก่ง)
3. Level 26-50: ฉายา 6-10 คำ (ขาประจำ, มีสไตล์)
4. Level 51-75: ฉายา 8-12 คำ (ผู้เชี่ยวชาญ, ทรงพลัง)
5. Level 76-99: ฉายา 10-15 คำ (ตำนาน, Epic, ยิ่งใหญ่)

สไตล์: แหวกแนว ตลกร้าย จิกกัด แต่ไม่หยาบ
ต้องสะท้อนพฤติกรรมจริงของ user

ตอบแค่ฉายา 1 อัน ไม่ต้องอธิบาย
```

### 3.5 ตัวอย่างฉายาตาม Level

**Level 1-10 (Newbie)**
- "ผู้แสวงหา"
- "นักดูมือใหม่"
- "ผู้เริ่มต้นบนเส้นทาง"

**Level 11-25 (Rookie)**
- "นักเดินทางยามราตรีผู้ไม่เคยหลับ"
- "ผู้บูชาจอภาพในยามวิกาล"
- "นักสำรวจโลกใต้ผ้าห่ม"

**Level 26-50 (Veteran)**
- "ขุนศึกแห่งความมืดผู้พิชิตทุกค่ำคืน"
- "จอมยุทธ์ตาค้างผู้ไม่เคยพลาดตอนสำคัญ"
- "ผู้พิทักษ์แห่งหน้าจอที่ไม่มีวันดับ"

**Level 51-75 (Master)**
- "มหาเทพแห่งสายตาที่มองเห็นทุกสรรพสิ่งในโลกมืด"
- "จักรพรรดิแห่งราตรีผู้กุมชะตาปุ่มกดทุกดวง"
- "ผู้บรรลุธรรมแห่งศาสตร์การดูที่ไม่มีใครเทียบได้"

**Level 76-99 (Legend)**
- "ตำนานผู้บรรลุธรรมแห่งโลกหลังม่านที่มนุษย์ธรรมดามิอาจเอื้อมถึง"
- "จอมจักรวาลผู้พิชิตทุกมิติแห่งความบันเทิงที่ซ่อนเร้น"
- "มหาเทพแห่งดวงตาพันดวงผู้เฝ้ามองโลกตั้งแต่รุ่งอรุณจนสิ้นแสง"

### 3.6 Level Up Celebration 🎉

เมื่อ Level Up:
1. แสดง Animation พิเศษ
2. Reveal ฉายาใหม่แบบค่อยๆ พิมพ์ (typewriter effect)
3. เก็บประวัติฉายาเก่าทั้งหมด (Collection)

```
┌─────────────────────────────────────────┐
│  🎉 LEVEL UP!                           │
│                                         │
│  Level 25 → Level 26                    │
│                                         │
│  ฉายาใหม่ของคุณคือ:                      │
│  ✨ "ขุนศึกแห่งความมืดผู้พิชิตทุกค่ำคืน" ✨ │
│                                         │
│  [ดูคอลเลคชันฉายา] [แชร์]               │
└─────────────────────────────────────────┘
```

### 3.7 Implementation

**Backend**
```go
type UserStats struct {
    UserID        uuid.UUID `json:"userId"`
    XP            int       `json:"xp"`
    Level         int       `json:"level"`         // 1-99
    CurrentTitle  string    `json:"currentTitle"`  // ฉายาปัจจุบัน
    TotalViews    int       `json:"totalViews"`
    TotalLikes    int       `json:"totalLikes"`
    TotalComments int       `json:"totalComments"`
    LoginStreak   int       `json:"loginStreak"`
    PeakHour      int       `json:"peakHour"`      // ชั่วโมงที่ดูบ่อยสุด
}

type TitleHistory struct {
    ID        uuid.UUID `json:"id"`
    UserID    uuid.UUID `json:"userId"`
    Level     int       `json:"level"`
    Title     string    `json:"title"`
    EarnedAt  time.Time `json:"earnedAt"`
}
```

**API**
```
GET  /api/v1/user/stats           - ดู XP, Level, ฉายา
GET  /api/v1/user/titles          - ดูคอลเลคชันฉายาทั้งหมด
POST /api/v1/user/xp              - เพิ่ม XP (internal)
```

**ความเป็นไปได้:** ✅ ทำได้
- Level 1-99 + XP formula
- Gemini generate ฉายาตาม level
- เก็บประวัติฉายาทุก level

---

## 4. ประวัติการดู (View History)

### 4.1 เก็บข้อมูล
| Field | Description |
|-------|-------------|
| user_id | ผู้ใช้ |
| reel_id / video_id | เนื้อหาที่ดู |
| watched_at | เวลาที่ดู |
| watch_duration | ดูนานเท่าไหร่ (วินาที) |
| watch_percentage | ดูกี่ % |
| source | มาจากไหน (feed, search, recommend) |

### 4.2 ใช้ทำ Recommendation

**Collaborative Filtering**
- ถ้า User A ดู Video 1, 2, 3
- และ User B ดู Video 1, 2
- แนะนำ Video 3 ให้ User B

**Content-Based**
- ดูจาก tags ที่ user ชอบ
- ดูจาก categories ที่ดูบ่อย
- ดูจาก casts ที่ชอบ

### Implementation

**Backend**
```go
type ViewHistory struct {
    ID              uuid.UUID `json:"id"`
    UserID          uuid.UUID `json:"userId"`
    ReelID          *uuid.UUID `json:"reelId,omitempty"`
    VideoID         *uuid.UUID `json:"videoId,omitempty"`
    WatchedAt       time.Time `json:"watchedAt"`
    WatchDuration   int       `json:"watchDuration"`   // seconds
    WatchPercentage float64   `json:"watchPercentage"` // 0-100
    Source          string    `json:"source"`          // feed, search, recommend
}

type UserPreference struct {
    UserID      uuid.UUID         `json:"userId"`
    TopTags     []TagScore        `json:"topTags"`
    TopCasts    []CastScore       `json:"topCasts"`
    TopMakers   []MakerScore      `json:"topMakers"`
}
```

**API Endpoints**
```
POST /api/v1/history          - บันทึกประวัติ
GET  /api/v1/history          - ดูประวัติของตัวเอง
GET  /api/v1/recommend        - ดึง recommendation
GET  /api/v1/recommend/tags   - แนะนำตาม tags ที่ชอบ
```

**ความเป็นไปได้:** ✅ ทำได้
- Simple recommendation ทำได้เลย
- Advanced ML recommendation ต้องใช้ python service เพิ่ม

---

## สรุปความเป็นไปได้

| Feature | Difficulty | Priority | Estimate |
|---------|------------|----------|----------|
| DiceBear Avatar | 🟢 Easy | High | 0.5 day |
| Ranking/XP System | 🟡 Medium | High | 2-3 days |
| View History | 🟡 Medium | High | 1-2 days |
| **AI ฉายา (Gemini)** | 🟡 Medium | High | 2 days |
| Simple Recommend | 🟡 Medium | Medium | 2-3 days |
| ML Recommend | 🔴 Hard | Low | 1-2 weeks |

---

## Recommended Implementation Order

1. **Phase 1: View History** (2 days) ⭐ ต้องทำก่อน
   - [ ] สร้าง `view_history` table
   - [ ] API บันทึกประวัติ
   - [ ] Frontend track watch events
   - **เหตุผล:** เป็น data source สำหรับ AI ฉายา และ Recommend

2. **Phase 2: User Stats & Ranking** (2 days)
   - [ ] สร้าง `user_stats` table (XP, views, likes, comments)
   - [ ] XP calculation logic
   - [ ] Level badges UI

3. **Phase 3: AI ฉายา (Gemini)** (2 days) 🎭
   - [ ] Setup Gemini API
   - [ ] Prompt engineering
   - [ ] ฉายา generation service
   - [ ] UI แสดงฉายา + ขอใหม่

4. **Phase 4: User Profile** (1 day)
   - [ ] DiceBear avatar integration
   - [ ] Profile edit UI
   - [ ] Privacy settings

5. **Phase 5: Recommendation** (3-5 days)
   - [ ] Simple tag-based recommend
   - [ ] "คนที่ดูเรื่องนี้ ยังดู..." feature
   - [ ] Personalized feed

---

*Created: 2026-02-05*
