import {
  LayoutDashboard,
  Users,
  Settings,
  UserCircle,
  Video,
  Film,
  Factory,
  UserRound,
  Tags,
  FolderTree,
  Activity,
  MessageCircle,
  Radio,
  FileText,
  type LucideIcon,
} from 'lucide-react'

// Sidebar navigation types
export interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: { title: string; url: string }[]
}

// Sidebar navigation data
export const NAV_MAIN: NavItem[] = [
  {
    title: 'แดชบอร์ด',
    url: '/dashboard',
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: 'วิดีโอ',
    url: '/videos',
    icon: Video,
  },
  {
    title: 'Reels',
    url: '/reels',
    icon: Film,
  },
  {
    title: 'บทความ',
    url: '/articles',
    icon: FileText,
  },
  {
    title: 'ค่าย',
    url: '/makers',
    icon: Factory,
  },
  {
    title: 'นักแสดง',
    url: '/casts',
    icon: UserRound,
  },
  {
    title: 'แท็ก',
    url: '/tags',
    icon: Tags,
  },
  {
    title: 'หมวดหมู่',
    url: '/categories',
    icon: FolderTree,
  },
  {
    title: 'ผู้ใช้งาน',
    url: '/users',
    icon: Users,
  },
  {
    title: 'Activity Log',
    url: '/activity',
    icon: Activity,
  },
  {
    title: 'ช่องทางติดต่อ',
    url: '/contact-channels',
    icon: MessageCircle,
  },
  {
    title: 'ออนไลน์',
    url: '/online-users',
    icon: Radio,
  },
  {
    title: 'โปรไฟล์',
    url: '/profile',
    icon: UserCircle,
  },
  {
    title: 'ตั้งค่า',
    url: '#',
    icon: Settings,
    items: [
      { title: 'ทั่วไป', url: '/settings' },
      { title: 'บัญชี', url: '/settings/account' },
    ],
  },
]
