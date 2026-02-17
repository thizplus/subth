import { useState, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  MoreHorizontal,
  GripVertical,
  MessageCircle,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Music2,
  Mail,
  Globe,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import {
  useContactChannelAdminList,
  useContactChannelById,
  useCreateContactChannel,
  useUpdateContactChannel,
  useDeleteContactChannel,
  useReorderContactChannels,
} from '../hooks'
import { type ContactChannel, type Platform, PLATFORM_OPTIONS } from '../types'

// Platform icon mapping
const PLATFORM_ICONS: Record<Platform, LucideIcon> = {
  telegram: Send,
  line: MessageCircle,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
  email: Mail,
  website: Globe,
}

function getPlatformIcon(platform: Platform): LucideIcon {
  return PLATFORM_ICONS[platform] || Globe
}

function getPlatformLabel(platform: Platform): string {
  return PLATFORM_OPTIONS.find((p) => p.value === platform)?.label || platform
}

// MetricItem Component
interface MetricItemProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  isLoading?: boolean
}

function MetricItem({ label, value, icon, isLoading }: MetricItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </p>
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <p className="text-lg font-semibold tabular-nums">{value}</p>
      )}
    </div>
  )
}

// Sortable Row Component
interface SortableRowProps {
  item: ContactChannel
  onEdit: (channel: ContactChannel) => void
  onDelete: (channel: ContactChannel) => void
  onToggleActive: (channel: ContactChannel) => void
}

function SortableRow({ item, onEdit, onDelete, onToggleActive }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const PlatformIcon = getPlatformIcon(item.platform)

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="group hover:bg-muted/50 transition-colors"
    >
      <TableCell className="w-[50px]">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="w-[60px]">
        <div className="flex items-center justify-center">
          <PlatformIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{item.title}</span>
          <span className="text-xs text-muted-foreground">{getPlatformLabel(item.platform)}</span>
        </div>
      </TableCell>
      <TableCell className="max-w-[200px]">
        <p className="text-sm text-muted-foreground truncate" title={item.description}>
          {item.description || '-'}
        </p>
      </TableCell>
      <TableCell className="max-w-[200px]">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1 truncate"
          title={item.url}
        >
          <span className="truncate">{item.url}</span>
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
        </a>
      </TableCell>
      <TableCell>
        <Badge variant={item.isActive ? 'default' : 'secondary'}>
          {item.isActive ? 'เปิดใช้งาน' : 'ปิด'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                แก้ไข
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive(item)}>
                {item.isActive ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(item)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                ลบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function ContactChannelListPage() {
  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingChannel, setDeletingChannel] = useState<ContactChannel | null>(null)

  // Form state
  const [formPlatform, setFormPlatform] = useState<Platform>('telegram')
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  // Queries & Mutations
  const { data: channels, isLoading } = useContactChannelAdminList()
  const { data: editingChannel } = useContactChannelById(editingId || '')
  const createChannel = useCreateContactChannel()
  const updateChannel = useUpdateContactChannel()
  const deleteChannel = useDeleteContactChannel()
  const reorderChannels = useReorderContactChannels()

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !channels) return

    const oldIndex = channels.findIndex((c) => c.id === active.id)
    const newIndex = channels.findIndex((c) => c.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(channels, oldIndex, newIndex)
    const ids = newOrder.map((c) => c.id)

    try {
      await reorderChannels.mutateAsync({ ids })
      toast.success('จัดเรียงลำดับสำเร็จ')
    } catch {
      toast.error('เกิดข้อผิดพลาดในการจัดเรียง')
    }
  }

  const resetForm = () => {
    setFormPlatform('telegram')
    setFormTitle('')
    setFormDescription('')
    setFormUrl('')
    setFormIsActive(true)
  }

  const handleCreate = async () => {
    if (!formTitle.trim()) {
      toast.error('กรุณากรอกชื่อ')
      return
    }
    if (!formUrl.trim()) {
      toast.error('กรุณากรอก URL')
      return
    }

    try {
      await createChannel.mutateAsync({
        platform: formPlatform,
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        url: formUrl.trim(),
        isActive: formIsActive,
      })
      toast.success('สร้างช่องทางติดต่อสำเร็จ')
      setIsCreateOpen(false)
      resetForm()
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const handleUpdate = async () => {
    if (!editingId || !formTitle.trim() || !formUrl.trim()) return

    try {
      await updateChannel.mutateAsync({
        id: editingId,
        payload: {
          platform: formPlatform,
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          url: formUrl.trim(),
          isActive: formIsActive,
        },
      })
      toast.success('อัพเดทช่องทางติดต่อสำเร็จ')
      setEditingId(null)
      resetForm()
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const handleDelete = async () => {
    if (!deletingChannel) return
    try {
      await deleteChannel.mutateAsync(deletingChannel.id)
      toast.success('ลบช่องทางติดต่อสำเร็จ')
      setDeletingChannel(null)
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const handleToggleActive = async (channel: ContactChannel) => {
    try {
      await updateChannel.mutateAsync({
        id: channel.id,
        payload: { isActive: !channel.isActive },
      })
      toast.success(channel.isActive ? 'ปิดการใช้งานสำเร็จ' : 'เปิดการใช้งานสำเร็จ')
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const openEdit = (channel: ContactChannel) => {
    setEditingId(channel.id)
  }

  // Load editing data when editingChannel changes
  useEffect(() => {
    if (editingChannel && editingId) {
      setFormPlatform(editingChannel.platform)
      setFormTitle(editingChannel.title)
      setFormDescription(editingChannel.description || '')
      setFormUrl(editingChannel.url)
      setFormIsActive(editingChannel.isActive)
    }
  }, [editingChannel, editingId])

  const total = channels?.length || 0
  const activeCount = channels?.filter((c) => c.isActive).length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ช่องทางติดต่อ</h1>
          <p className="text-muted-foreground">จัดการช่องทางติดต่อ (Telegram, Line, Facebook ฯลฯ)</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มช่องทาง
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricItem
          label="ช่องทางทั้งหมด"
          value={`${total.toLocaleString()} รายการ`}
          icon={<MessageCircle className="h-3 w-3" />}
          isLoading={isLoading}
        />
        <MetricItem
          label="เปิดใช้งาน"
          value={`${activeCount.toLocaleString()} รายการ`}
          icon={<MessageCircle className="h-3 w-3" />}
          isLoading={isLoading}
        />
      </div>

      <Separator />

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[50px]" />
                <TableHead className="w-[60px]">Icon</TableHead>
                <TableHead className="w-[20%]">ชื่อ</TableHead>
                <TableHead className="w-[20%]">คำอธิบาย</TableHead>
                <TableHead className="w-[25%]">URL</TableHead>
                <TableHead className="w-[10%]">สถานะ</TableHead>
                <TableHead className="w-[10%] text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-5 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : channels?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <MessageCircle className="h-8 w-8" />
                      <p>ไม่พบข้อมูลช่องทางติดต่อ</p>
                      <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        เพิ่มช่องทาง
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <SortableContext
                  items={channels?.map((c) => c.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  {channels?.map((item) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      onEdit={openEdit}
                      onDelete={setDeletingChannel}
                      onToggleActive={handleToggleActive}
                    />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm() }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>เพิ่มช่องทางติดต่อ</DialogTitle>
            <DialogDescription>กรอกข้อมูลเพื่อสร้างช่องทางติดต่อใหม่</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Platform *</Label>
              <Select value={formPlatform} onValueChange={(v) => setFormPlatform(v as Platform)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((opt) => {
                    const Icon = PLATFORM_ICONS[opt.value]
                    return (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ชื่อปุ่ม *</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="เช่น ติดต่อเรา, Support, ฯลฯ"
              />
            </div>
            <div className="space-y-2">
              <Label>คำอธิบาย</Label>
              <Textarea
                value={formDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormDescription(e.target.value)}
                placeholder="คำอธิบายเพิ่มเติม (ไม่บังคับ)"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://t.me/..."
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>เปิดใช้งาน</Label>
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleCreate} disabled={createChannel.isPending}>
              {createChannel.isPending ? 'กำลังสร้าง...' : 'สร้าง'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingId} onOpenChange={(open) => { if (!open) { setEditingId(null); resetForm() } }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>แก้ไขช่องทางติดต่อ</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลช่องทางติดต่อ</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Platform *</Label>
              <Select value={formPlatform} onValueChange={(v) => setFormPlatform(v as Platform)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((opt) => {
                    const Icon = PLATFORM_ICONS[opt.value]
                    return (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ชื่อปุ่ม *</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="เช่น ติดต่อเรา, Support, ฯลฯ"
              />
            </div>
            <div className="space-y-2">
              <Label>คำอธิบาย</Label>
              <Textarea
                value={formDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormDescription(e.target.value)}
                placeholder="คำอธิบายเพิ่มเติม (ไม่บังคับ)"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://t.me/..."
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>เปิดใช้งาน</Label>
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>
              ยกเลิก
            </Button>
            <Button onClick={handleUpdate} disabled={updateChannel.isPending}>
              {updateChannel.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingChannel} onOpenChange={(open) => !open && setDeletingChannel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบ "{deletingChannel?.title}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteChannel.isPending ? 'กำลังลบ...' : 'ลบ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
