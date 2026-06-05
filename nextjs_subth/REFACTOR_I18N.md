# Refactor: Public Pages i18n (DictionaryProvider)

## ปัญหาปัจจุบัน

### Member Pages (ถูกต้อง)
```
/member/layout.tsx (Server Component)
  └── DictionaryProvider (Client)
        └── Components ใช้ useDictionary()
```

### Public Pages (ไม่ consistent)
```
/page.tsx
  └── PublicLayout (Client Component - "use client")
        └── Components รับ locale prop ทีละตัว
```

**ปัญหา:**
- `PublicLayout` เป็น client component → ทำ `await getDictionary()` ไม่ได้
- Components ต้องมี translations object ภายในตัวเอง หรือรับ `locale` prop
- ไม่ reusable ระหว่าง public/member

---

## เป้าหมาย

ทำให้ Public pages ใช้ pattern เดียวกับ Member:
```
/page.tsx (Server Component)
  └── PublicLayoutWrapper (Server) - โหลด dictionary
        └── DictionaryProvider (Client)
              └── PublicLayoutClient (Client)
                    └── Components ใช้ useDictionary()
```

---

## ไฟล์ที่ต้อง Refactor

### 1. สร้างไฟล์ใหม่

| ไฟล์ | ประเภท | หน้าที่ |
|------|--------|--------|
| `src/components/layout/public-layout-wrapper.tsx` | Server | โหลด dictionary, ครอบ DictionaryProvider |

### 2. แก้ไขไฟล์เดิม

| ไฟล์ | การแก้ไข |
|------|----------|
| `src/components/layout/public-layout.tsx` | Rename เป็น `public-layout-client.tsx`, ลบ locale-dependent logic |
| `src/components/layout/index.ts` | Export `PublicLayoutWrapper` as `PublicLayout` |
| `src/components/layout/bottom-nav.tsx` | ใช้ `useDictionary()` แทน locale prop |
| `src/components/layout/public-language-switcher.tsx` | ใช้ `useDictionary()` แทน locale prop |
| `src/components/layout/online-stats.tsx` | ใช้ `useDictionary()` แทน locale prop (ถ้ามี) |

### 3. Pages ที่ใช้ PublicLayout (ไม่ต้องแก้ถ้า export ชื่อเดิม)

**Thai Pages:**
- `src/app/page.tsx`
- `src/app/(public)/articles/page.tsx`
- `src/app/(public)/articles/[slug]/page.tsx`
- `src/app/(public)/casts/page.tsx`
- `src/app/(public)/casts/[slug]/page.tsx`
- `src/app/(public)/tags/page.tsx`
- `src/app/(public)/tags/[slug]/page.tsx`
- `src/app/(public)/makers/page.tsx`
- `src/app/(public)/makers/[slug]/page.tsx`
- `src/app/(public)/about/page.tsx`
- `src/app/(public)/contact/page.tsx`
- `src/app/(public)/privacy-policy/page.tsx`
- `src/app/(public)/terms-of-service/page.tsx`
- `src/app/(public)/author/[slug]/page.tsx`
- `src/app/(public)/login/page.tsx`
- `src/app/reels/page.tsx`

**English Pages:**
- `src/app/en/page.tsx`
- `src/app/en/(public)/articles/page.tsx`
- `src/app/en/(public)/articles/[slug]/page.tsx`
- `src/app/en/(public)/casts/page.tsx`
- `src/app/en/(public)/casts/[slug]/page.tsx`
- `src/app/en/(public)/tags/page.tsx`
- `src/app/en/(public)/tags/[slug]/page.tsx`
- `src/app/en/(public)/makers/page.tsx`
- `src/app/en/(public)/makers/[slug]/page.tsx`
- `src/app/en/(public)/about/page.tsx`
- `src/app/en/(public)/contact/page.tsx`
- `src/app/en/(public)/privacy-policy/page.tsx`
- `src/app/en/(public)/terms-of-service/page.tsx`
- `src/app/en/(public)/author/[slug]/page.tsx`
- `src/app/en/login/page.tsx`
- `src/app/en/reels/page.tsx`

---

## รายละเอียดการ Refactor

### Step 1: สร้าง PublicLayoutWrapper (Server Component)

```tsx
// src/components/layout/public-layout-wrapper.tsx
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { DictionaryProvider } from "@/components/dictionary-provider";
import { PublicLayoutClient } from "./public-layout-client";
import { categoryService, type Category } from "@/features/category";

interface PublicLayoutWrapperProps {
  children: React.ReactNode;
  locale: Locale;
}

export async function PublicLayoutWrapper({
  children,
  locale
}: PublicLayoutWrapperProps) {
  const dictionary = await getDictionary(locale);

  let categories: Category[] = [];
  try {
    categories = await categoryService.getList(locale);
  } catch (e) {
    console.error("Failed to fetch categories:", e);
  }

  return (
    <DictionaryProvider
      dictionary={dictionary}
      locale={locale}
      categories={categories}
      basePath=""  // public ไม่มี basePath
    >
      <PublicLayoutClient>
        {children}
      </PublicLayoutClient>
    </DictionaryProvider>
  );
}
```

### Step 2: แก้ PublicLayout เป็น Client-only

```tsx
// src/components/layout/public-layout-client.tsx
"use client";

import { ReactNode } from "react";
import { useDictionary } from "@/components/dictionary-provider";
// ... imports

interface PublicLayoutClientProps {
  children: ReactNode;
}

export function PublicLayoutClient({ children }: PublicLayoutClientProps) {
  const { locale } = useDictionary();  // ใช้ hook แทน prop
  // ... rest of the layout
}
```

### Step 3: แก้ BottomNav ใช้ useDictionary

```tsx
// src/components/layout/bottom-nav.tsx
"use client";

import { useDictionary } from "@/components/dictionary-provider";

export function BottomNav() {
  const { dictionary, locale, getLocalizedPath } = useDictionary();
  const t = dictionary.common;

  // ใช้ t.home, t.articles, etc. จาก dictionary
}
```

### Step 4: Update barrel export

```tsx
// src/components/layout/index.ts
export { PublicLayoutWrapper as PublicLayout } from "./public-layout-wrapper";
export { PublicLayoutClient } from "./public-layout-client";
// ... other exports
```

---

## Dictionary Keys ที่ต้องเพิ่ม

### messages/th.json
```json
{
  "common": {
    "articles": "บทความ",
    "login": "เข้าสู่ระบบ",
    "watchVideo": "ดูวิดีโอ",
    "categories": "หมวดหมู่"
  }
}
```

### messages/en.json
```json
{
  "common": {
    "articles": "Articles",
    "login": "Login",
    "watchVideo": "Watch",
    "categories": "Categories"
  }
}
```

---

## Checklist

- [ ] สร้าง `public-layout-wrapper.tsx` (Server Component)
- [ ] Rename `public-layout.tsx` → `public-layout-client.tsx`
- [ ] แก้ `public-layout-client.tsx` ใช้ `useDictionary()`
- [ ] แก้ `bottom-nav.tsx` ใช้ `useDictionary()`
- [ ] แก้ `public-language-switcher.tsx` ใช้ `useDictionary()`
- [ ] แก้ `online-stats.tsx` ใช้ `useDictionary()` (ถ้าจำเป็น)
- [ ] Update `index.ts` barrel export
- [ ] เพิ่ม dictionary keys ใน `th.json` และ `en.json`
- [ ] Test build
- [ ] Test ทุก public pages (Thai + English)

---

## ข้อควรระวัง

### 1. basePath
- Public ใช้ `""`, Member ใช้ `"/member"`

### 2. getLocalizedPath (สำคัญมาก!)

**ตัวอย่าง paths:**
| Context | Path |
|---------|------|
| Thai public | `/articles` |
| English public | `/en/articles` |
| Thai member | `/member/videos` |
| English member | `/en/member/videos` |

**กรณีพิเศษ - Login Redirect:**
```
อยู่หน้า /en/articles → กด Login → /en/login?redirect=/en/articles
                                          ↓
                              Login สำเร็จ → redirect กลับ /en/articles
```

**Implementation ใน BottomNav:**
```tsx
// bottom-nav.tsx
const pathname = usePathname();

const loginHref = isAuthenticated
  ? getLocalizedPath("/member")
  : `${getLocalizedPath("/login")}?redirect=${encodeURIComponent(pathname)}`;
```

**Implementation ใน Login Page:**
```tsx
// login/page.tsx หรือ auth callback
const searchParams = useSearchParams();
const redirectTo = searchParams.get("redirect") || getLocalizedPath("/member");

// หลัง login สำเร็จ
router.push(redirectTo);
```

### 3. Pagination components
ตรวจสอบว่าใช้ locale จาก `useDictionary()` hook

### 4. Bundle Size (ข้อดี)
- Dictionary โหลดบน Server → ไม่รวมใน Client Bundle
- ลบ hardcoded translations ใน components ออก
- Client รับแค่ data ที่ต้องใช้ผ่าน Context

---

---

## เพิ่มเติม: Final Polish

### 1. Metadata (SEO) - generateMetadata

เนื่องจาก pages เป็น Server Component อยู่แล้ว สามารถใช้ `generateMetadata` ดึง dictionary มาใส่ meta ได้:

```tsx
// src/app/(public)/articles/page.tsx
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary("th");
  return {
    title: dict.articles.metaTitle,        // "บทความทั้งหมด | SubTH"
    description: dict.articles.metaDesc,   // "รวมบทความรีวิว..."
  };
}
```

**Dictionary keys ที่ต้องเพิ่ม:**
```json
{
  "articles": {
    "metaTitle": "บทความทั้งหมด | SubTH",
    "metaDescription": "รวมบทความรีวิววิดีโอซับไทยทั้งหมด"
  },
  "casts": {
    "metaTitle": "นักแสดงทั้งหมด | SubTH",
    "metaDescription": "รวมนักแสดงยอดนิยม"
  }
  // ... etc
}
```

### 2. Skeleton Loading (UX)

สร้าง `loading.tsx` ใน route groups เพื่อแสดง skeleton ระหว่าง await:

```
src/app/
├── loading.tsx                    # Root loading (homepage)
├── (public)/
│   ├── loading.tsx                # Public pages loading
│   ├── articles/
│   │   └── loading.tsx            # Articles loading
│   └── casts/
│       └── loading.tsx            # Casts loading
```

**ตัวอย่าง loading.tsx:**
```tsx
// src/app/(public)/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Skeleton */}
      <div className="hidden md:block w-64 border-r p-4">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 p-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Mobile Bottom Nav Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background md:hidden">
        <div className="grid grid-cols-5 h-full items-center px-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 mx-auto rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 3. Center Button Logic (BottomNav)

ปุ่มตรงกลางเปลี่ยนตาม auth state:

```tsx
// src/components/layout/bottom-nav.tsx
"use client";

import { useDictionary } from "@/components/dictionary-provider";
import { useAuthStore } from "@/features/auth";

export function BottomNav() {
  const { dictionary, getLocalizedPath } = useDictionary();
  const { isAuthenticated } = useAuthStore();
  const t = dictionary.common;

  const navItems = [
    { href: "/", icon: Home, label: t.home },
    { href: "/articles", icon: BookOpen, label: t.articles },
    // Center button - เปลี่ยนตาม auth
    {
      href: isAuthenticated ? "/member" : "/login",
      icon: PlayCircle,
      label: isAuthenticated ? t.watchVideo : t.login,
      isCenter: true,
    },
    { href: "/casts", icon: Users, label: t.casts },
    { href: "/tags", icon: LayoutGrid, label: t.categories },
  ];

  // ... render
}
```

**Auth State Flow:**
```
ไม่ Login:  [หน้าแรก] [บทความ] [🔵 เข้าสู่ระบบ] [นักแสดง] [หมวดหมู่]
                                    ↓ click
                               /login page

Login แล้ว: [หน้าแรก] [บทความ] [🔵 ดูวิดีโอ] [นักแสดง] [หมวดหมู่]
                                    ↓ click
                               /member page
```

---

## Updated Checklist

### Core Refactor
- [ ] สร้าง `public-layout-wrapper.tsx` (Server Component)
- [ ] Rename `public-layout.tsx` → `public-layout-client.tsx`
- [ ] แก้ `public-layout-client.tsx` ใช้ `useDictionary()`
- [ ] แก้ `bottom-nav.tsx` ใช้ `useDictionary()` + auth logic
- [ ] แก้ `public-language-switcher.tsx` ใช้ `useDictionary()`
- [ ] Update `index.ts` barrel export
- [ ] เพิ่ม dictionary keys ใน `th.json` และ `en.json`

### SEO Enhancement
- [ ] เพิ่ม meta keys ใน dictionary (metaTitle, metaDescription)
- [ ] แก้ `generateMetadata` ใน pages ให้ใช้ dictionary

### UX Enhancement
- [ ] สร้าง `src/app/loading.tsx`
- [ ] สร้าง `src/app/(public)/loading.tsx`
- [ ] สร้าง loading.tsx สำหรับ route ย่อยที่สำคัญ

### Testing
- [ ] Test build
- [ ] Test homepage (Thai + English)
- [ ] Test articles page (Thai + English)
- [ ] Test BottomNav auth state change
- [ ] Test language switching
- [ ] Test loading skeleton

---

*Created: 2024-02-24*
*Updated: 2024-02-24 - Added Final Polish section*
