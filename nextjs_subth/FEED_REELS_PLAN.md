# Feed & Reels Implementation Plan for SubTH

## Overview

เอกสารนี้เปรียบเทียบ `nextjs-social` (suekk) กับ `nextjs_subth` และวางแผนการ implement Feed/Reels ให้เหมือน Facebook/TikTok style

---

## Current State Comparison

### nextjs_subth (ปัจจุบัน)

| Feature | Status | Description |
|---------|--------|-------------|
| Feed Page `/` | ✅ มี | Grid 3 columns, แสดง cover + title |
| Reels Page `/reels` | ✅ มี | Grid 5 columns, แสดง thumb + play icon |
| Feed API | ✅ มี | `GET /api/v1/feed` (page-based) |
| Reels API | ✅ มี | `GET /api/v1/reels` (page-based) |
| Layout | ✅ มี | `AppLayout` with sidebar |
| Video Player | ❌ ไม่มี | ยังไม่มี fullscreen player |
| Infinite Scroll | ❌ ไม่มี | ใช้ pagination แบบ manual |
| Like/Save | ❌ ไม่มี | ไม่มี engagement features |

### nextjs-social (target)

| Feature | Status | Description |
|---------|--------|-------------|
| Feed Page `/` | ✅ | Infinite scroll with PostCard |
| Reels Page `/reels` | ✅ | TikTok-style fullscreen snap scroll |
| Layout - Feed | ✅ | `AppLayout` (sidebar + header) |
| Layout - Reels | ✅ | `ReelsLayout` (fullscreen immersive) |
| Video Player | ✅ | HLS streaming, auto-play |
| Infinite Scroll | ✅ | react-virtuoso + React Query |
| Like/Save/Share | ✅ | Full engagement features |

---

## Architecture Comparison

### Feed Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    nextjs_subth (Current)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Header (PublicHeader)                                │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                      │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐                   │   │
│  │  │ Card   │ │ Card   │ │ Card   │  ← Grid Layout    │   │
│  │  │ Cover  │ │ Cover  │ │ Cover  │    3 columns      │   │
│  │  │ Title  │ │ Title  │ │ Title  │                   │   │
│  │  └────────┘ └────────┘ └────────┘                   │   │
│  │                                                      │   │
│  │  [Pagination: < 1 2 3 ... 10 >]                     │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    nextjs-social (Target)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌────────┬────────────────────────────────────────────┐   │
│  │Sidebar │ Header (breadcrumb, notifications)         │   │
│  │        ├────────────────────────────────────────────┤   │
│  │ Home   │ ┌────────────────────────────────────────┐ │   │
│  │ Reels  │ │ PostCard (full width)                  │ │   │
│  │ ...    │ │ ├─ Author avatar + name                │ │   │
│  │        │ │ ├─ Title                               │ │   │
│  │        │ │ ├─ Content                             │ │   │
│  │        │ │ ├─ Media (edge-to-edge)                │ │   │
│  │        │ │ └─ Actions (vote, comment, share)      │ │   │
│  │        │ └────────────────────────────────────────┘ │   │
│  │        │ ┌────────────────────────────────────────┐ │   │
│  │        │ │ PostCard 2...                          │ │   │
│  │        │ └────────────────────────────────────────┘ │   │
│  │        │         ↓ Infinite Scroll ↓                │   │
│  └────────┴────────────────────────────────────────────┘   │
│  [MobileBottomNav - mobile only]                           │
└─────────────────────────────────────────────────────────────┘
```

### Reels Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    nextjs_subth (Current)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Header                                               │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                  │   │
│  │ │    │ │    │ │    │ │    │ │    │  ← Grid Layout   │   │
│  │ │ ▶️  │ │ ▶️  │ │ ▶️  │ │ ▶️  │ │ ▶️  │    5 columns    │   │
│  │ │    │ │    │ │    │ │    │ │    │    9:16 ratio    │   │
│  │ └────┘ └────┘ └────┘ └────┘ └────┘                  │   │
│  │ [Pagination]                                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    nextjs-social (Target)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ← Reels          ⋮  ← Floating header (gradient)    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                              ┌─────┐│   │
│  │                                              │  ⚪ ││   │
│  │         ┌──────────────────────┐             │  ❤️ ││   │
│  │         │                      │             │ 1.2K││   │
│  │         │    VIDEO (100dvh)    │             │  💬 ││   │
│  │         │    snap scroll       │             │  89 ││   │
│  │         │    auto-play         │             │  🔗 ││   │
│  │         │                      │             │  🔖 ││   │
│  │         └──────────────────────┘             └─────┘│   │
│  │ ─────────────────────────────────────────────────── │   │
│  │ @username                                           │   │
│  │ Caption text here... #tag1 #tag2                    │   │
│  │ ═══════════════════════════════════════════════════ │   │
│  │ ↑ Progress bar                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│         ↓ Snap to next reel ↓                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Feed Page Enhancement (Priority: HIGH)

#### 1.1 สร้าง FeedCard Component ใหม่

**File**: `src/features/feed/components/feed-card-v2.tsx`

```
FeedCard Layout:
┌────────────────────────────────────────┐
│ ┌──┐ Username         12 ชม.ที่แล้ว   │ ← Header
│ └──┘ @handle                           │
├────────────────────────────────────────┤
│ Title (ถ้ามี)                          │
├────────────────────────────────────────┤
│ Description text...                    │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ │         Cover Image                │ │ ← edge-to-edge
│ │         (16:9 หรือ original)        │ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│ #tag1 #tag2 #tag3                      │ ← Tags
├────────────────────────────────────────┤
│ ❤️ 1.2K   💬 89   🔗 Share   🔖 Save   │ ← Actions (future)
└────────────────────────────────────────┘
```

**Tasks**:
- [ ] สร้าง `FeedCardV2` component
- [ ] ใช้ `next/image` สำหรับ cover (responsive)
- [ ] เพิ่ม relative time (12 ชม.ที่แล้ว)
- [ ] ออกแบบ mobile-first (single column)

#### 1.2 Implement Infinite Scroll

**Dependencies ที่มีแล้ว**: `react-virtuoso`

**Files to create**:
- `src/features/feed/components/infinite-feed.tsx`
- `src/features/feed/hooks.ts` (React Query hooks)

**Tasks**:
- [ ] ติดตั้ง `@tanstack/react-query`
- [ ] สร้าง `useFeed()` hook with infinite query
- [ ] สร้าง `InfiniteFeed` component with virtuoso
- [ ] เพิ่ม loading skeleton

#### 1.3 Update Feed Page Layout

**File**: `src/app/page.tsx`

**Tasks**:
- [ ] เปลี่ยนจาก Grid → Single column feed
- [ ] ใช้ `max-w-2xl mx-auto` เหมือน social
- [ ] เพิ่ม header section

---

### Phase 2: Reels Page - TikTok Style (Priority: HIGH)

#### 2.1 สร้าง ReelsLayout (Fullscreen)

**File**: `src/features/reels/components/reels-layout.tsx`

```tsx
// Key styles:
- fixed inset-0 (fullscreen)
- bg-black text-white
- safe-area padding for notch
- floating header with gradient
```

**Tasks**:
- [ ] สร้าง `ReelsLayout` component
- [ ] เพิ่ม CSS variables สำหรับ reels theme
- [ ] Back button + title

#### 2.2 สร้าง ReelsFeed (Snap Scroll)

**File**: `src/features/reels/components/reels-feed.tsx`

**Key Features**:
- CSS snap scroll (`snap-y snap-mandatory`)
- Intersection Observer for active detection
- Windowed rendering (render ±5 items only)

**Tasks**:
- [ ] สร้าง `ReelsFeed` component
- [ ] Implement snap scroll
- [ ] Active reel detection
- [ ] Load more on scroll

#### 2.3 สร้าง ReelItem (Single Reel View)

**File**: `src/features/reels/components/reel-item.tsx`

```
ReelItem Layout:
┌──────────────────────────────────────┐
│                              ┌─────┐ │
│                              │ ⚪  │ │ ← Author avatar
│                              │     │ │
│      VIDEO PLAYER            │ ❤️  │ │ ← Like
│      (100dvh)                │1.2K │ │
│                              │     │ │
│                              │ 💬  │ │ ← Comment
│                              │ 89  │ │
│                              │     │ │
│                              │ 🔗  │ │ ← Share
│                              │     │ │
│                              │ 🔖  │ │ ← Save
│                              └─────┘ │
│ ─────────────────────────────────────│
│ @username                            │ ← Overlay
│ Caption... #tag1 #tag2               │
│ ═════════════════════════════════════│ ← Progress
└──────────────────────────────────────┘
```

**Tasks**:
- [ ] สร้าง `ReelItem` component
- [ ] สร้าง `ReelVideoPlayer` component
- [ ] สร้าง `ReelActionBar` component
- [ ] สร้าง `ReelOverlay` component
- [ ] Double-tap to like animation

#### 2.4 Video Player Component

**File**: `src/features/reels/components/reel-video-player.tsx`

**Features**:
- Native HTML5 video (MP4 direct)
- Auto-play when active
- Mute toggle
- Progress tracking
- Tap to play/pause

**Tasks**:
- [ ] Basic video player
- [ ] Auto-play logic (isActive prop)
- [ ] Mute/unmute global state
- [ ] Progress bar

---

### Phase 3: Shared Components

#### 3.1 Action Bar Components

**Files**:
- `src/components/engagement/like-button.tsx`
- `src/components/engagement/comment-button.tsx`
- `src/components/engagement/share-button.tsx`
- `src/components/engagement/save-button.tsx`

**Note**: ตอนนี้ยังไม่มี backend support สำหรับ engagement
- Like/Save จะเป็น UI only (localStorage หรือ disabled)
- Comment จะ link ไปหน้า detail หรือ show dialog

#### 3.2 Author Info Component

**File**: `src/components/common/author-info.tsx`

```tsx
<AuthorInfo
  avatar={author.avatar}
  username={author.username}
  displayName={author.displayName}
  createdAt={createdAt}
/>
```

---

### Phase 4: API & State Management

#### 4.1 React Query Setup

**Files**:
- `src/lib/query-client.ts`
- `src/providers/query-provider.tsx`

**Tasks**:
- [ ] Install `@tanstack/react-query`
- [ ] Create QueryClient with defaults
- [ ] Add QueryClientProvider to layout

#### 4.2 Feed/Reels Hooks

**File**: `src/features/feed/hooks.ts`

```typescript
// Hooks to create:
export function useFeed(options?: FeedOptions)
export function useReels(options?: ReelsOptions)
export function useReel(id: string) // single reel detail
```

#### 4.3 Update Types

**File**: `src/features/feed/types.ts`

```typescript
// Add fields for engagement:
interface FeedItem {
  // ... existing
  author?: {
    id: string
    username: string
    displayName: string
    avatar?: string
  }
  likeCount?: number
  commentCount?: number
  isLiked?: boolean
  isSaved?: boolean
}
```

---

## File Structure (After Implementation)

```
src/features/
├── feed/
│   ├── components/
│   │   ├── feed-card.tsx          # Legacy (grid view)
│   │   ├── feed-card-v2.tsx       # NEW: Social-style card
│   │   ├── feed-list.tsx          # Legacy (grid view)
│   │   ├── infinite-feed.tsx      # NEW: Infinite scroll
│   │   └── index.ts
│   ├── hooks.ts                   # NEW: React Query hooks
│   ├── service.ts                 # Existing
│   ├── types.ts                   # Update with engagement fields
│   └── index.ts
│
├── reels/
│   ├── components/
│   │   ├── reels-layout.tsx       # NEW: Fullscreen layout
│   │   ├── reels-feed.tsx         # NEW: Snap scroll container
│   │   ├── reel-item.tsx          # NEW: Single reel view
│   │   ├── reel-video-player.tsx  # NEW: Video player
│   │   ├── reel-action-bar.tsx    # NEW: Right-side actions
│   │   ├── reel-overlay.tsx       # NEW: Bottom info
│   │   ├── double-tap-heart.tsx   # NEW: Like animation
│   │   └── index.ts
│   ├── hooks.ts                   # NEW: React Query hooks
│   ├── utils/
│   │   ├── haptics.ts             # Haptic feedback
│   │   └── performance.ts         # Preload priority
│   └── index.ts
│
└── ...existing features
```

---

## CSS Variables for Reels Theme

**File**: `src/app/globals.css`

```css
:root {
  /* Reels Theme */
  --reels-bg: 0 0% 0%;                    /* Pure black */
  --reels-text: 0 0% 100%;                /* Pure white */
  --reels-text-muted: 0 0% 70%;
  --reels-text-subtle: 0 0% 50%;
  --reels-gradient-start: 0 0% 0% / 70%;
  --reels-gradient-mid: 0 0% 0% / 30%;
  --reels-action-active: 0 84% 60%;       /* Red for like */
}
```

---

## Implementation Status

### Completed

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 4 | ✅ Done | React Query setup (`@tanstack/react-query`) |
| Phase 1 | ✅ Done | Feed enhancement (social style + infinite scroll) |
| Phase 2 | ✅ Done | Reels TikTok-style (fullscreen + snap + video player) |

### Files Created/Updated

**React Query Setup:**
- `src/providers/query-provider.tsx` ✅
- `src/app/layout.tsx` - Added QueryProvider ✅

**Feed Feature (Social Style):**
- `src/features/feed/hooks.ts` ✅ - useInfiniteFeed hook
- `src/features/feed/components/feed-card-social.tsx` ✅ - Facebook/IG style card
- `src/features/feed/components/infinite-feed.tsx` ✅ - Infinite scroll container
- `src/features/feed/components/feed-page-client.tsx` ✅ - Client wrapper
- `src/app/page.tsx` ✅ - Updated home page
- `src/app/en/page.tsx` ✅ - Updated English page

**Reels Feature (TikTok Style):**
- `src/features/reels/types.ts` ✅
- `src/features/reels/hooks.ts` ✅ - useInfiniteReels hook
- `src/features/reels/components/reels-layout.tsx` ✅ - Fullscreen layout
- `src/features/reels/components/reels-feed.tsx` ✅ - Snap scroll container
- `src/features/reels/components/reel-item.tsx` ✅ - Single reel view
- `src/features/reels/components/reel-video-player.tsx` ✅ - Video player
- `src/features/reels/components/reel-action-bar.tsx` ✅ - Like/Comment/Share
- `src/features/reels/components/reel-overlay.tsx` ✅ - Bottom info
- `src/features/reels/components/double-tap-heart.tsx` ✅ - Heart animation
- `src/features/reels/components/reels-page-client.tsx` ✅ - Client wrapper
- `src/app/reels/page.tsx` ✅ - Updated reels page
- `src/app/en/reels/page.tsx` ✅ - Updated English reels page

**CSS:**
- `src/app/globals.css` ✅ - Added reels theme variables

### Pending

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 3 | ⏳ Optional | Shared engagement components (if backend API added) |

---

## Backend Requirements

### Current API Response (Feed)
```json
{
  "success": true,
  "data": [{
    "id": "uuid",
    "title": "string",
    "description": "string",
    "coverUrl": "https://files.subth.com/...",
    "tags": ["tag1", "tag2"],
    "createdAt": "2026-02-05T..."
  }],
  "meta": { "total": 100, "page": 1, "limit": 20, ... }
}
```

### Future API Enhancement (Optional)
```json
{
  "data": [{
    // ... existing
    "author": {
      "id": "uuid",
      "username": "john",
      "displayName": "John Doe",
      "avatar": "https://..."
    },
    "likeCount": 1234,
    "commentCount": 56,
    "viewCount": 10000,
    "isLiked": false,
    "isSaved": true
  }]
}
```

---

## Notes

1. **ไม่ต้องทำ engagement backend ตอนนี้** - UI สามารถทำก่อนได้ แล้วค่อยเพิ่ม API ทีหลัง
2. **Mobile-first** - ออกแบบสำหรับ mobile ก่อน แล้ว scale up
3. **Performance** - ใช้ virtuoso สำหรับ feed, windowed rendering สำหรับ reels
4. **R2 URLs** - ไฟล์ทั้งหมดอยู่ที่ `files.subth.com` แล้ว (synced จาก iDrive)

---

## Reference Files (nextjs-social)

Copy/adapt จาก:
- `nextjs-social/src/features/reels/` - ทั้ง folder
- `nextjs-social/src/features/posts/components/InfinitePostFeed.tsx`
- `nextjs-social/src/features/posts/components/PostCard.tsx`
- `nextjs-social/src/shared/components/layouts/AppLayout.tsx`
- `nextjs-social/app/globals.css` - CSS variables

---

*Last updated: 2026-02-05*
