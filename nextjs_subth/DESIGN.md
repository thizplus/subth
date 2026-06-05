# SubTH Client - Design Document

## Overview

เว็บไซต์สำหรับ client ดูข้อมูล video (Public) ใช้ Next.js + SSR เพื่อซ่อน API จริงจาก client

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | Framework (App Router) |
| React | 19.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | latest | UI Components |
| next-intl | latest | i18n (th/en) |
| next-themes | latest | Dark/Light mode |
| Zustand | latest | State (Semantic Search modal) |
| use-debounce | latest | Debounce for semantic search |
| Framer Motion | latest | Chat bubble animations |

### RAG/LLM Stack (ดู [DESIGN-RAG.md](./DESIGN-RAG.md))
| Technology | Options | Purpose |
|------------|---------|---------|
| LLM Engine | Ollama / Groq API | สมองที่เอาไว้คุย |
| Model | Llama 3 / Typhoon (Thai) | Natural language generation |
| Framework | LangChain / LlamaIndex | เชื่อม LLM กับ Vector DB |

## Technical Considerations ⚠️

### 1. Image Optimization (Thumbnail เยอะมาก)
```tsx
// ใช้ <Image /> component เสมอ
import Image from 'next/image'

<Image
  src={video.thumbnail}
  alt={video.title}
  width={320}
  height={180}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."  // Blur-up placeholder
/>
```

```ts
// next.config.ts - config R2 domain
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.subth.com',  // Cloudflare R2
      },
    ],
  },
}
```

**Image URL Pattern**: `https://files.subth.com/{path}`

### 2. API Proxy - Body Size Limit
```ts
// app/api/semantic/route.ts
// Default body size = 4MB, ต้องเพิ่มสำหรับ image upload

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',  // เพิ่มสำหรับ image semantic search
    },
  },
}

// หรือใช้ Route Segment Config (App Router)
export const runtime = 'nodejs'
export const maxDuration = 30  // seconds
```

### 3. Semantic Search UX
- **Debounce 500ms**: ก่อนส่งไป CLIP เพื่อประหยัด resource
- **Skeleton Loading**: AI search ใช้เวลา 1-2 วินาที ต้องมี pulse effect

```tsx
// features/semantic-search/hooks.ts
import { useDebouncedCallback } from 'use-debounce'

export function useSemanticSearch() {
  const debouncedSearch = useDebouncedCallback(
    (query: string) => searchMutation.mutate(query),
    500  // 500ms debounce
  )
}
```

### 4. Potential Bottlenecks
| Issue | Solution |
|-------|----------|
| Hydration Mismatch (Theme/i18n) | ใช้ `mounted` state check ✅ (มีในแผนแล้ว) |
| CLIP Memory Usage | Monitor RAM บน Backend, อาจต้องแยก service |
| i18n + SSR | ใช้ next-intl กับ App Router ปกติ (ไม่ทำ Static Export) |

## Architecture

### Code Organization Principle ⚠️
> **สำคัญ**: แยก code ตาม responsibility ชัดเจน ไม่รวมทุกอย่างในไฟล์เดียว

```
feature/
├── types.ts        # TypeScript interfaces
├── service.ts      # API calls only
├── hooks.ts        # React Query hooks only
├── store.ts        # Zustand store (ถ้าจำเป็น)
├── constants.ts    # Feature-specific constants
└── components/     # UI components only
    └── index.ts    # Barrel exports
```

**Data Flow**: `Page → Hooks → Service → API`

### Folder Structure
```
nextjs_subth/
├── app/
│   ├── [locale]/              # i18n routing
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Homepage
│   │   ├── videos/
│   │   │   ├── page.tsx       # Video list
│   │   │   └── [code]/
│   │   │       └── page.tsx   # Video detail
│   │   ├── casts/
│   │   │   ├── page.tsx       # Cast list
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Cast detail
│   │   ├── tags/
│   │   │   ├── page.tsx       # Tag list
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Tag detail
│   │   ├── makers/
│   │   │   ├── page.tsx       # Maker list
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Maker detail
│   │   └── search/
│   │       └── page.tsx       # Search page
│   ├── api/                   # API Routes (proxy to backend)
│   │   └── [...proxy]/
│   │       └── route.ts
│   └── globals.css
├── features/                  # Feature-based modules
│   ├── video/
│   │   ├── types.ts
│   │   ├── service.ts
│   │   ├── hooks.ts
│   │   ├── components/
│   │   │   ├── video-card.tsx
│   │   │   ├── video-grid.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── cast/
│   │   ├── types.ts
│   │   ├── service.ts
│   │   ├── hooks.ts
│   │   ├── components/
│   │   │   ├── cast-card.tsx
│   │   │   ├── cast-grid.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── tag/
│   │   ├── types.ts
│   │   ├── service.ts
│   │   ├── hooks.ts
│   │   ├── components/
│   │   │   ├── tag-badge.tsx
│   │   │   ├── tag-cloud.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   └── semantic-search/       # ⭐ AI Search (ฟีเจอร์หลัก)
│       ├── types.ts
│       ├── service.ts
│       ├── hooks.ts
│       ├── store.ts           # Zustand (modal state)
│       ├── components/
│       │   ├── search-fab.tsx
│       │   ├── search-modal.tsx
│       │   ├── search-input.tsx
│       │   ├── example-prompts.tsx
│       │   ├── image-drop-zone.tsx
│       │   └── index.ts
│       └── index.ts
├── components/
│   ├── ui/                    # shadcn components
│   ├── theme/
│   │   ├── theme-provider.tsx
│   │   └── mode-toggle.tsx
│   └── layout/
│       ├── header.tsx
│       ├── footer.tsx
│       ├── bottom-nav.tsx
│       └── index.ts
├── lib/
│   ├── api-client.ts          # Axios/fetch wrapper
│   ├── utils.ts
│   └── constants/
│       ├── api-routes.ts      # ALL API endpoints
│       └── index.ts
├── messages/                  # i18n translations
│   ├── th.json
│   └── en.json
├── types/
│   └── index.ts               # Shared TypeScript types
└── middleware.ts              # i18n middleware
```

### Responsive Design
> ใช้ Tailwind responsive classes (`md:`, `lg:`) ไม่ต้องแยก Desktop/Mobile components

## Backend API (GoFiber)

### Videos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/videos` | List videos (pagination) |
| GET | `/api/v1/videos/random` | Random videos |
| GET | `/api/v1/videos/search` | Search videos |
| GET | `/api/v1/videos/auto-tags` | Filter by auto-tags |
| GET | `/api/v1/videos/code/:code` | Get by code (e.g., ABC-123) |
| GET | `/api/v1/videos/maker/:id` | Videos by maker |
| GET | `/api/v1/videos/cast/:id` | Videos by cast |
| GET | `/api/v1/videos/tag/:id` | Videos by tag |
| GET | `/api/v1/videos/:id` | Get video detail |

### Casts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/casts` | List casts |
| GET | `/api/v1/casts/search` | Search casts |
| GET | `/api/v1/casts/top` | Top casts |
| GET | `/api/v1/casts/slug/:slug` | Get by slug |
| GET | `/api/v1/casts/:id` | Get cast detail |

### Tags
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tags` | List tags |
| GET | `/api/v1/tags/search` | Search tags |
| GET | `/api/v1/tags/top` | Top tags |
| GET | `/api/v1/tags/auto` | Auto-tags list |
| GET | `/api/v1/tags/slug/:slug` | Get by slug |

### Makers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/makers` | List makers |
| GET | `/api/v1/makers/search` | Search makers |
| GET | `/api/v1/makers/top` | Top makers |
| GET | `/api/v1/makers/slug/:slug` | Get by slug |

### Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/stats` | Overall stats |
| GET | `/api/v1/stats/top-makers` | Top makers |
| GET | `/api/v1/stats/top-casts` | Top casts |
| GET | `/api/v1/stats/top-tags` | Top tags |

### Semantic Search (AI) ⭐
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/videos/semantic?q=text` | Text → CLIP → find similar videos |
| POST | `/api/v1/videos/semantic` | Image → CLIP → find similar videos |
| GET | `/api/v1/videos/:id/similar` | Find videos with similar embeddings |

**Query Parameters:**
- `?lang=th` or `?lang=en` - Language
- `?page=1&limit=20` - Pagination
- `?sort=created_at&order=desc` - Sorting

## Key Features

### 1. SSR Data Fetching
```tsx
// app/[locale]/videos/page.tsx
async function VideosPage({ searchParams }) {
  // Fetch on server - API URL hidden from client
  const videos = await fetchVideos({
    page: searchParams.page || 1,
    lang: locale
  });

  return <VideoGrid videos={videos} />;
}
```

### 2. Dark/Light Theme (Sliding Toggle)

**Reference**: `vite_subth/src/theme/`

#### Theme Provider Setup
```tsx
// components/theme/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

#### Mode Toggle Component (Sliding Style)
```tsx
// components/theme/mode-toggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  // Placeholder ป้องกัน hydration mismatch
  if (!mounted) {
    return <div className="ml-auto h-7 w-14 rounded-full bg-muted opacity-0" />
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle ml-auto relative h-7 w-14 rounded-full p-1 transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label="เปลี่ยนธีม"
    >
      {/* Track icons */}
      <div className="absolute inset-1 flex items-center justify-between px-1">
        <Sun className={`h-3.5 w-3.5 text-foreground transition-opacity duration-300 ${isDark ? 'opacity-30' : 'opacity-0'}`} />
        <Moon className={`h-3.5 w-3.5 text-foreground transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-30'}`} />
      </div>

      {/* Sliding thumb */}
      <div
        className={`
          theme-toggle-thumb relative z-10 flex h-5 w-5 items-center justify-center rounded-full shadow-sm
          transition-transform duration-300 ease-in-out
          ${isDark ? 'translate-x-7' : 'translate-x-0'}
        `}
      >
        {isDark ? (
          <Moon className="theme-toggle-icon h-3 w-3" />
        ) : (
          <Sun className="theme-toggle-icon h-3 w-3" />
        )}
      </div>
    </button>
  )
}
```

#### Theme CSS Variables (globals.css)
```css
:root {
  /* Theme toggle colors - Light mode */
  --theme-toggle-bg: var(--muted);
  --theme-toggle-thumb: var(--background);
  --theme-toggle-icon: var(--foreground);
}

.dark {
  /* Theme toggle colors - Dark mode */
  --theme-toggle-bg: var(--muted);
  --theme-toggle-thumb: var(--foreground);
  --theme-toggle-icon: var(--background);
}

@layer components {
  .theme-toggle {
    background-color: var(--theme-toggle-bg);
  }
  .theme-toggle-thumb {
    background-color: var(--theme-toggle-thumb);
  }
  .theme-toggle-icon {
    color: var(--theme-toggle-icon);
  }
}
```

#### Layout Integration
```tsx
// app/[locale]/layout.tsx
import { ThemeProvider } from "@/components/theme/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 3. Multi-language (i18n)
```tsx
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['th', 'en'],
  defaultLocale: 'th'
});

// messages/th.json
{
  "common": {
    "search": "ค้นหา",
    "videos": "วิดีโอ",
    "casts": "นักแสดง"
  }
}
```

### 4. Google Sans Font
```tsx
// app/layout.tsx
import { Google_Sans } from 'next/font/google';
// Note: Google Sans is not on Google Fonts, use Noto Sans instead
// or Product Sans alternative

import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin', 'thai'] });
```

### 5. Semantic Search (AI) ⭐ ฟีเจอร์หลัก

**Concept**: แยกจาก search ปกติ เข้าถึงง่ายจากทุกหน้า

> 📄 **รายละเอียดเพิ่มเติม**: ดู [DESIGN-RAG.md](./DESIGN-RAG.md) สำหรับ RAG (LLM Chat) feature
> - Chat UI แบบ ChatGPT
> - LLM ตอบกลับแบบกวนๆ "จัดไปสิพ่อหนุ่ม!"
> - Streaming text effect
> - Self-hosted options (Ollama, Typhoon)

#### UI Layout
```
┌─────────────────────────────────────────┐
│  Desktop                                │
│  ┌─────────────────────────────────┐   │
│  │         Content Area            │   │
│  └─────────────────────────────────┘   │
│                           ┌─────────┐   │
│                           │ ✨ AI   │   │  ← FAB มุมขวาล่าง
│                           └─────────┘   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Mobile                                 │
│  ┌─────────────────────────────────┐   │
│  │         Content Area            │   │
│  └─────────────────────────────────┘   │
│  ┌─────┬─────┬─────┬─────┬─────┐       │
│  │ 🏠  │ 🎬  │ ✨  │ 🏷️  │ 👤  │       │  ← Bottom Nav
│  │Home │Video│ AI  │Tags │Cast │       │
│  └─────┴─────┴─────┴─────┴─────┘       │
└─────────────────────────────────────────┘
```

#### Modal/Sheet Content
```
┌─────────────────────────────────────────┐
│                                    ✕    │
│        ✨ ค้นหาอัจฉริยะ                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🔍 อธิบายสิ่งที่อยากดู...         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  💡 ตัวอย่าง:                           │
│  • "สาวออฟฟิศชุดทำงาน"                  │
│  • "ริมสระว่ายน้ำ"                       │
│  • "ชุดนักเรียน"                        │
│                                         │
│  ─────────────────────────────────────  │
│  📸 หรือค้นหาด้วยรูปภาพ                  │
│  ┌─────────────────────────────────┐   │
│  │      [ วางรูปที่นี่ ]              │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### Feature Structure (Clean Architecture)
```
features/semantic-search/
├── types.ts           # SemanticSearchResult, SearchQuery
├── service.ts         # API calls only
├── hooks.ts           # React Query hooks + debounce
├── store.ts           # Zustand (modal state only)
├── components/
│   ├── search-fab.tsx       # FAB button (responsive: hidden md:block)
│   ├── search-modal.tsx     # Modal/Sheet content
│   ├── search-input.tsx     # Search input field
│   ├── search-skeleton.tsx  # Skeleton loading (pulse effect)
│   ├── example-prompts.tsx  # คำแนะนำตัวอย่าง
│   ├── image-drop-zone.tsx  # Upload รูป
│   └── index.ts             # Barrel exports
└── index.ts
```

#### Types
```tsx
// features/semantic-search/types.ts
export interface SemanticSearchResult {
  id: string
  code: string
  title: string
  thumbnail: string
  similarity: number
}

export interface SearchQuery {
  text?: string
  image?: File
}
```

#### Service (API calls only)
```tsx
// features/semantic-search/service.ts
import { apiClient } from '@/lib/api-client'
import { SEMANTIC_ROUTES } from '@/lib/constants/api-routes'
import type { SemanticSearchResult } from './types'

export const semanticSearchService = {
  async searchByText(query: string): Promise<SemanticSearchResult[]> {
    const res = await apiClient.get(SEMANTIC_ROUTES.SEARCH, { params: { q: query } })
    return res.data.data
  },

  async searchByImage(file: File): Promise<SemanticSearchResult[]> {
    const formData = new FormData()
    formData.append('image', file)
    const res = await apiClient.post(SEMANTIC_ROUTES.SEARCH, formData)
    return res.data.data
  },

  async getSimilar(videoId: string): Promise<SemanticSearchResult[]> {
    const res = await apiClient.get(SEMANTIC_ROUTES.SIMILAR(videoId))
    return res.data.data
  },
}
```

#### Hooks (React Query + Debounce)
```tsx
// features/semantic-search/hooks.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { useDebouncedCallback } from 'use-debounce'
import { semanticSearchService } from './service'

export const semanticSearchKeys = {
  all: ['semantic-search'] as const,
  text: (q: string) => [...semanticSearchKeys.all, 'text', q] as const,
  similar: (id: string) => [...semanticSearchKeys.all, 'similar', id] as const,
}

export function useSimilarVideos(videoId: string) {
  return useQuery({
    queryKey: semanticSearchKeys.similar(videoId),
    queryFn: () => semanticSearchService.getSimilar(videoId),
    enabled: !!videoId,
  })
}

export function useSemanticSearchMutation() {
  const mutation = useMutation({
    mutationFn: semanticSearchService.searchByText,
  })

  // Debounce 500ms ก่อนส่งไป CLIP
  const debouncedSearch = useDebouncedCallback(
    (query: string) => mutation.mutate(query),
    500
  )

  return { ...mutation, debouncedSearch }
}

export function useImageSearchMutation() {
  return useMutation({
    mutationFn: semanticSearchService.searchByImage,
  })
}
```

#### Store (Modal state only)
```tsx
// features/semantic-search/store.ts
import { create } from 'zustand'

interface SemanticSearchStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useSemanticSearchStore = create<SemanticSearchStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
```

## Pages

### Homepage (`/`)
- Hero section with search
- Random/Featured videos
- Top casts carousel
- Top tags cloud

### Videos (`/videos`)
- Video grid with filters
- Pagination
- Sort options (newest, popular)
- Auto-tag filters

### Video Detail (`/videos/[code]`)
- Video info (title, code, thumbnail)
- Cast list
- Tags
- Related videos (same cast/maker)
- ⭐ Similar videos (AI - ใช้ CLIP embeddings)

### Casts (`/casts`)
- Cast grid with search
- Alphabet filter
- Top casts

### Cast Detail (`/casts/[slug]`)
- Cast info
- Video list by cast

### Search (`/search`)
- Full-text search
- Filter by type (video, cast, tag)
- Auto-suggestions

## Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Mobile (<768px) | Single column, bottom nav |
| Tablet (768-1024px) | 2-3 columns, side nav |
| Desktop (>1024px) | 4-5 columns, full nav |

## Implementation Plan

### Phase 1: Setup (Day 1)
- [x] Next.js project init
- [ ] Install dependencies (next-intl, next-themes)
- [ ] Setup shadcn/ui
- [ ] Configure dark mode
- [ ] Setup i18n structure

### Phase 2: Layout (Day 1-2)
- [ ] Header component
- [ ] Footer component
- [ ] Mobile navigation
- [ ] Theme toggle
- [ ] Language switcher

### Phase 3: Core Pages (Day 2-3)
- [ ] Homepage
- [ ] Videos list page
- [ ] Video detail page
- [ ] Search page

### Phase 4: Entity Pages (Day 3-4)
- [ ] Casts page + detail
- [ ] Tags page + detail
- [ ] Makers page + detail

### Phase 5: Semantic Search (Day 4-5) ⭐
> ⚠️ **หมายเหตุ**: Backend work ต้องรอ Phase 4 (Translation) เสร็จก่อน
> 📄 **รายละเอียด RAG**: ดู [DESIGN-RAG.md](./DESIGN-RAG.md)

**5.1 Backend - Basic Semantic (GoFiber)** - รอ translation เสร็จ:
- [ ] `GET /api/v1/videos/semantic?q=text` - Text → CLIP → find similar
- [ ] `POST /api/v1/videos/semantic` - Image → CLIP → find similar
- [ ] `GET /api/v1/videos/:id/similar` - Find by embedding similarity

**5.2 Backend - RAG/LLM (GoFiber)** - optional, เพิ่มทีหลัง:
- [ ] Setup Ollama + Llama 3 (หรือ Typhoon สำหรับภาษาไทย)
- [ ] `POST /api/v1/chat/semantic` - Chat endpoint
- [ ] System Prompt + Few-shot examples
- [ ] Streaming response (SSE)

**5.3 Frontend (Next.js)** - ทำได้เลย:
- [ ] `features/semantic-search/types.ts` - TypeScript interfaces
- [ ] `features/semantic-search/service.ts` - API calls only
- [ ] `features/semantic-search/hooks.ts` - React Query hooks + debounce
- [ ] `features/semantic-search/store.ts` - Zustand (messages, modal state)
- [ ] `features/semantic-search/components/`:
  - [ ] search-fab.tsx (Tailwind responsive)
  - [ ] search-modal.tsx (Chat layout)
  - [ ] search-input.tsx
  - [ ] chat-bubble.tsx (AI response)
  - [ ] typing-indicator.tsx
  - [ ] example-prompts.tsx
  - [ ] image-drop-zone.tsx
- [ ] `components/layout/bottom-nav.tsx` - Mobile bottom nav

### Phase 6: Polish (Day 5-6)
- [ ] SEO meta tags
- [ ] Loading states
- [ ] Error handling
- [ ] Performance optimization

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_APP_URL=https://subth.com
NEXT_PUBLIC_CDN_URL=https://files.subth.com  # Cloudflare R2
API_URL=http://localhost:8080  # Server-side only (ห้าม NEXT_PUBLIC_)
```

```ts
// lib/constants/index.ts
export const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://files.subth.com'

// Usage
const thumbnailUrl = `${CDN_URL}/thumbnails/${video.code}.jpg`
```

## Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm run start

# Add shadcn component
npx shadcn@latest add button
```
