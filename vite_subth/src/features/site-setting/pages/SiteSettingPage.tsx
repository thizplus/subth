import { useState, useEffect } from 'react'
import { Loader2, Settings, Code, ExternalLink, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { useSiteSetting, useUpdateSiteSetting } from '../hooks'

export function SiteSettingPage() {
  const [gtmId, setGtmId] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  const { data: setting, isLoading } = useSiteSetting()
  const updateSetting = useUpdateSiteSetting()

  // Load initial data
  useEffect(() => {
    if (setting) {
      setGtmId(setting.gtmId || '')
    }
  }, [setting])

  // Track changes
  useEffect(() => {
    if (setting) {
      setHasChanges(gtmId !== (setting.gtmId || ''))
    }
  }, [gtmId, setting])

  const handleSave = async () => {
    // Validate GTM ID format
    if (gtmId && !gtmId.match(/^GTM-[A-Z0-9]+$/)) {
      toast.error('รูปแบบ GTM ID ไม่ถูกต้อง (ต้องขึ้นต้นด้วย GTM-)')
      return
    }

    try {
      await updateSetting.mutateAsync({ gtmId: gtmId.trim() })
      toast.success('บันทึกการตั้งค่าสำเร็จ')
      setHasChanges(false)
    } catch {
      toast.error('เกิดข้อผิดพลาดในการบันทึก')
    }
  }

  const handleReset = () => {
    if (setting) {
      setGtmId(setting.gtmId || '')
      setHasChanges(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ตั้งค่าเว็บไซต์</h1>
          <p className="text-muted-foreground">จัดการการตั้งค่าทั่วไปของเว็บไซต์</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              ยกเลิก
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges || updateSetting.isPending}>
            {updateSetting.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              'บันทึก'
            )}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Google Tag Manager */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <CardTitle>Google Tag Manager</CardTitle>
          </div>
          <CardDescription>
            ใส่ GTM ID เพื่อติดตาม Analytics และ Marketing Tags ต่างๆ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="gtmId">GTM Container ID</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[300px]">
                    <p>
                      GTM ID จะมีรูปแบบ GTM-XXXXXXX เช่น GTM-AB12CD3
                      <br />
                      หาได้จาก Google Tag Manager → Admin → Container Settings
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="gtmId"
              value={gtmId}
              onChange={(e) => setGtmId(e.target.value.toUpperCase())}
              placeholder="GTM-XXXXXXX"
              className="max-w-sm font-mono"
            />
            <p className="text-xs text-muted-foreground">
              เมื่อบันทึกแล้ว script จะถูกใส่ใน frontend อัตโนมัติ (ต้อง deploy ใหม่)
            </p>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <a
              href="https://tagmanager.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              <Settings className="h-3 w-3" />
              ไปที่ Google Tag Manager
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      {setting?.updatedAt && (
        <p className="text-xs text-muted-foreground">
          อัพเดทล่าสุด: {new Date(setting.updatedAt).toLocaleString('th-TH')}
        </p>
      )}
    </div>
  )
}
