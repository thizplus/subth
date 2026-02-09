import { UserProfile } from '../components/UserProfile'
import { useUserProfile } from '../hooks'
import { LoadingOverlay } from '@/components/ui/loading'

export function UserProfilePage() {
  const { data: user, isLoading, error } = useUserProfile()

  if (isLoading) {
    return <LoadingOverlay />
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-destructive">ไม่สามารถโหลดข้อมูลโปรไฟล์ได้</p>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold">โปรไฟล์ของฉัน</h1>
      <UserProfile user={user} />
    </div>
  )
}
