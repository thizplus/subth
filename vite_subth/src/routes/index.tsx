import { Routes, Route, Navigate } from 'react-router'
import { Suspense, lazy } from 'react'

// Layouts
import { RootLayout, PageLayout } from '@/components/layouts'
import { ProtectedRoute } from './ProtectedRoute'
import { Loading } from '@/components/ui/loading'

// Auth feature
import { LoginPage } from '@/features/auth'

// Lazy load dashboard pages
const AdminDashboard = lazy(() =>
  import('@/features/dashboard').then((m) => ({ default: m.AdminDashboard }))
)
const AgentDashboard = lazy(() =>
  import('@/features/dashboard').then((m) => ({ default: m.AgentDashboard }))
)
const SalesDashboard = lazy(() =>
  import('@/features/dashboard').then((m) => ({ default: m.SalesDashboard }))
)

// Lazy load user pages
const UserProfilePage = lazy(() =>
  import('@/features/user').then((m) => ({ default: m.UserProfilePage }))
)
const UserListPage = lazy(() =>
  import('@/features/user').then((m) => ({ default: m.UserListPage }))
)
const UserDetailPage = lazy(() =>
  import('@/features/user').then((m) => ({ default: m.UserDetailPage }))
)
const ActivityLogPage = lazy(() =>
  import('@/features/user').then((m) => ({ default: m.ActivityLogPage }))
)

// Lazy load content management pages
const MakerListPage = lazy(() =>
  import('@/features/maker').then((m) => ({ default: m.MakerListPage }))
)
const CastListPage = lazy(() =>
  import('@/features/cast').then((m) => ({ default: m.CastListPage }))
)
const TagListPage = lazy(() =>
  import('@/features/tag').then((m) => ({ default: m.TagListPage }))
)
const CategoryListPage = lazy(() =>
  import('@/features/category').then((m) => ({ default: m.CategoryListPage }))
)
const VideoListPage = lazy(() =>
  import('@/features/video').then((m) => ({ default: m.VideoListPage }))
)
const ReelListPage = lazy(() =>
  import('@/features/reel').then((m) => ({ default: m.ReelListPage }))
)
const ContactChannelListPage = lazy(() =>
  import('@/features/contact-channel').then((m) => ({ default: m.ContactChannelListPage }))
)
const OnlineUsersPage = lazy(() =>
  import('@/features/online-users').then((m) => ({ default: m.OnlineUsersPage }))
)
const ArticleListPage = lazy(() =>
  import('@/features/article').then((m) => ({ default: m.ArticleListPage }))
)
const SiteSettingPage = lazy(() =>
  import('@/features/site-setting').then((m) => ({ default: m.SiteSettingPage }))
)

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading fullScreen />}>
      <Routes>
        <Route element={<RootLayout />}>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected routes with layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<PageLayout />}>
              {/* Dashboard routes */}
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/dashboard/agent" element={<AgentDashboard />} />
              <Route path="/dashboard/sales" element={<SalesDashboard />} />

              {/* User routes */}
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/users" element={<UserListPage />} />
              <Route path="/users/page/:page" element={<UserListPage />} />
              <Route path="/users/:id" element={<UserDetailPage />} />

              {/* Activity log */}
              <Route path="/activity" element={<ActivityLogPage />} />
              <Route path="/activity/page/:page" element={<ActivityLogPage />} />

              {/* Content management routes */}
              <Route path="/videos" element={<VideoListPage />} />
              <Route path="/videos/page/:page" element={<VideoListPage />} />
              <Route path="/reels" element={<ReelListPage />} />
              <Route path="/reels/page/:page" element={<ReelListPage />} />
              <Route path="/makers" element={<MakerListPage />} />
              <Route path="/makers/page/:page" element={<MakerListPage />} />
              <Route path="/casts" element={<CastListPage />} />
              <Route path="/casts/page/:page" element={<CastListPage />} />
              <Route path="/tags" element={<TagListPage />} />
              <Route path="/tags/page/:page" element={<TagListPage />} />
              <Route path="/categories" element={<CategoryListPage />} />
              <Route path="/contact-channels" element={<ContactChannelListPage />} />
              <Route path="/online-users" element={<OnlineUsersPage />} />

              {/* Article routes */}
              <Route path="/articles" element={<ArticleListPage />} />
              <Route path="/articles/page/:page" element={<ArticleListPage />} />

              {/* Settings */}
              <Route path="/settings" element={<SiteSettingPage />} />
            </Route>
          </Route>

          {/* 404 route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
