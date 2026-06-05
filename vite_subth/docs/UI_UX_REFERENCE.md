# UI/UX Reference - จาก KOOPUEN Lender Portal

## 1. โครงสร้างโปรเจค

```
src/
├── assets/              # Static images/icons
├── config/              # Brand config, environment settings
├── constants/           # Enums, labels, color mappings
├── features/            # Feature-based modules
├── hooks/               # Custom React hooks
├── layouts/             # Global layouts (MainLayout, AppSidebar)
├── lib/                 # Utilities, query client
├── providers/           # Context providers
├── routes/              # Route configuration
├── shared/
│   ├── components/      # UI primitives + custom components
│   │   └── ui/          # shadcn/ui components
│   ├── constants/       # Shared constants
│   └── hooks/
├── stores/              # Zustand stores
├── theme/               # Theme provider
└── types/               # Global TypeScript types
```

## 2. UI Components ที่ใช้

**Core shadcn Components:**
- Button, Card, Table, Badge, Dialog, AlertDialog
- Input, Label, Textarea, Select
- Tabs, Sidebar, Dropdown Menu, Pagination
- Separator, Avatar, Skeleton, Toast (Sonner)

**Custom Components:**
- `StatusBadge` - แสดงสถานะพร้อม icon และสี
- `DataPagination` - Pagination แบบมี ellipsis
- `MobileBottomNav` - Bottom navigation สำหรับมือถือ

## 3. Page Layout Pattern

### Header Pattern (ใช้ทุกหน้า)
```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold">Title</h1>
    <p className="text-muted-foreground">Subtitle</p>
  </div>
  <Button>
    <Plus className="mr-2 h-4 w-4" />
    เพิ่ม
  </Button>
</div>
```

### Metrics Grid (Dashboard Style)
```tsx
<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
  <MetricItem label="ยอดรวม" value="1,234" icon={Wallet} />
  <MetricItem label="รอดำเนินการ" value="56" icon={Clock} trend="up" />
  ...
</div>
```

### Search + Filter Pattern
```tsx
<div className="flex flex-col gap-4 md:flex-row md:items-center">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input placeholder="ค้นหา..." className="pl-10" />
  </div>
  <Select>...</Select>
  <Select>...</Select>
</div>
```

## 4. Data Display Patterns

### Responsive Table Strategy
- **Desktop**: Full table with all columns
- **Mobile**: Stacked card layout
- ใช้ `useIsMobile()` hook (breakpoint: 768px)

```tsx
{isMobile ? <TableMobile data={data} /> : <TableDesktop data={data} />}
```

### Status Badge System
```tsx
// ใช้ icon + สีเพื่อสื่อความหมาย
<StatusBadge type="loan" status="pending" />   // Clock icon, yellow
<StatusBadge type="loan" status="approved" />  // Check icon, green
<StatusBadge type="loan" status="rejected" />  // X icon, red
```

### Table Cell Formatting
- Currency: Right-aligned, `tabular-nums` class
- Status: Badge component
- Actions: Dropdown menu
- Icons: ใช้สีแยกประเภท (blue=เข้า, red=ออก)

## 5. Color Scheme

### CSS Variables (OKLch color space)
```css
/* Light Mode */
--background: oklch(1 0 0);
--foreground: oklch(0.145 0 0);
--primary: oklch(0.205 0 0);
--muted: oklch(0.97 0 0);
--muted-foreground: oklch(0.556 0 0);

/* Dark Mode */
--background: oklch(0.145 0 0);
--foreground: oklch(0.985 0 0);
```

### Status Colors (Semantic CSS Classes)

**ห้ามใช้ hardcoded colors!** ต้องใช้ semantic classes แทน

```css
/* globals.css - กำหนด semantic classes */
@layer components {
  .status-pending { @apply bg-status-pending-bg text-status-pending-text; }
  .status-success { @apply bg-status-success-bg text-status-success-text; }
  .status-danger  { @apply bg-status-danger-bg text-status-danger-text; }
  .status-info    { @apply bg-status-info-bg text-status-info-text; }
  .status-muted   { @apply bg-status-muted-bg text-status-muted-text; }
}

:root {
  --status-pending-bg: 254 249 195;    /* yellow-100 */
  --status-pending-text: 133 77 14;    /* yellow-800 */
  --status-success-bg: 220 252 231;    /* green-100 */
  --status-success-text: 22 101 52;    /* green-800 */
  --status-danger-bg: 254 226 226;     /* red-100 */
  --status-danger-text: 153 27 27;     /* red-800 */
  --status-info-bg: 219 234 254;       /* blue-100 */
  --status-info-text: 30 64 175;       /* blue-800 */
  --status-muted-bg: 243 244 246;      /* gray-100 */
  --status-muted-text: 107 114 128;    /* gray-500 */
}

.dark {
  --status-pending-bg: 69 59 10;       /* yellow-900/50 */
  --status-pending-text: 253 224 71;   /* yellow-300 */
  --status-success-bg: 20 83 45;       /* green-900/50 */
  --status-success-text: 134 239 172;  /* green-300 */
  /* ... dark variants for all statuses */
}
```

```typescript
// constants/enums.ts - ใช้ semantic class names
export const STATUS_STYLES = {
  pending: 'status-pending',
  approved: 'status-success',
  rejected: 'status-danger',
  completed: 'status-muted',
}

// Usage in Component
<Badge className={STATUS_STYLES[item.status]}>{STATUS_LABELS[item.status]}</Badge>
```

## 6. Spacing Standards

- **Major sections**: `space-y-6`
- **Form/Dialog content**: `space-y-4`
- **Table header actions**: `space-y-3`
- **Grid/Flex gaps**: `gap-4`, `gap-2`
- **Padding**: `p-3`, `p-6`, `px-4`

## 7. Font Sizing

- **Page titles**: `text-2xl font-bold`
- **Metric values**: `text-lg font-semibold tabular-nums`
- **Labels**: `text-sm`
- **Muted text**: `text-xs text-muted-foreground`

## 8. Key UI/UX Patterns

### 1. Dialog-Based CRUD
```tsx
<Dialog>
  <DialogHeader>
    <DialogTitle>เพิ่มข้อมูล</DialogTitle>
    <DialogDescription>กรอกข้อมูลด้านล่าง</DialogDescription>
  </DialogHeader>
  {/* Form content */}
  <DialogFooter>
    <Button variant="outline">ยกเลิก</Button>
    <Button disabled={isPending}>
      {isPending ? 'กำลังบันทึก...' : 'บันทึก'}
    </Button>
  </DialogFooter>
</Dialog>
```

### 2. Empty & Loading States
```tsx
// Loading
<div className="flex items-center justify-center p-8">
  <Loader2 className="h-6 w-6 animate-spin" />
</div>

// Empty
<div className="flex flex-col items-center justify-center p-8 text-center">
  <p className="text-muted-foreground">ไม่พบข้อมูล</p>
  <Button className="mt-4">เพิ่มข้อมูลใหม่</Button>
</div>
```

### 3. Metric Item Component
```tsx
interface MetricItemProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: 'up' | 'down'
  subtext?: string
  isLoading?: boolean
}
```

### 4. Responsive Design
- Mobile-first approach
- `useIsMobile()` hook ที่ 768px
- Bottom nav สำหรับ mobile
- Stacked layout แทน table columns

## 9. Accessibility

- Semantic HTML
- `aria-label` สำหรับ icon buttons
- Focus visible states
- Keyboard navigation
- Loading states with spinners
- Toast notifications for feedback

## 10. Libraries ที่ใช้

- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **Zustand** - State management
- **Sonner** - Toast notifications
- **class-variance-authority** - Component variants

---

## กฎสำคัญ

### ห้าม Hardcode Colors!
```typescript
// ❌ WRONG - ห้ามใช้ Tailwind color classes ตรงๆ
{ pending: 'bg-yellow-100 text-yellow-800' }

// ✅ RIGHT - ใช้ semantic classes
{ pending: 'status-pending' }
```

### ใช้ CSS Variables สำหรับ Theme
```typescript
// ❌ WRONG
className="text-[#ff0000]"
className="bg-blue-500"

// ✅ RIGHT
className="text-primary"
className="bg-background"
className="text-muted-foreground"
```

---

## สิ่งที่ควรนำมาใช้ใน vite_subth

1. **StatusBadge Component** - แสดงสถานะด้วย icon + semantic class
2. **MetricItem Component** - แสดง KPIs บน dashboard
3. **Responsive Table** - Desktop/Mobile variants
4. **DataPagination** - Pagination ที่อยู่ตรงกลาง
5. **Search + Filter Pattern** - Search box พร้อม filters
6. **Empty/Loading States** - UX ที่ดีขึ้น
7. **Consistent Spacing** - ใช้ space-y-6, gap-4 เป็นมาตรฐาน
8. **Semantic Color Classes** - ไม่ hardcode สี, ใช้ CSS variables
