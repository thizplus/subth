import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, Factory, Loader2, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
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
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import {
  useMakerList,
  useCreateMaker,
  useUpdateMaker,
  useDeleteMaker,
  type Maker,
} from '@/features/maker'

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

export function MakerListPage() {
  const { page: pageParam } = useParams()
  const navigate = useNavigate()
  const page = pageParam ? parseInt(pageParam, 10) : 1

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingMaker, setEditingMaker] = useState<Maker | null>(null)
  const [deletingMaker, setDeletingMaker] = useState<Maker | null>(null)

  // Form state
  const [formName, setFormName] = useState('')

  // Queries & Mutations
  const { data, isLoading } = useMakerList({ page, limit: 20, search: search || undefined })
  const createMaker = useCreateMaker()
  const updateMaker = useUpdateMaker()
  const deleteMaker = useDeleteMaker()

  const goToPage = (p: number) => {
    if (p === 1) {
      navigate('/makers')
    } else {
      navigate(`/makers/page/${p}`)
    }
  }

  const handleSearch = () => {
    setSearch(searchInput)
    goToPage(1)
  }

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error('กรุณากรอกชื่อ')
      return
    }
    try {
      await createMaker.mutateAsync({ name: formName.trim() })
      toast.success('สร้าง Maker สำเร็จ')
      setIsCreateOpen(false)
      setFormName('')
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const handleUpdate = async () => {
    if (!editingMaker || !formName.trim()) return
    try {
      await updateMaker.mutateAsync({ id: editingMaker.id, payload: { name: formName.trim() } })
      toast.success('อัพเดท Maker สำเร็จ')
      setEditingMaker(null)
      setFormName('')
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const handleDelete = async () => {
    if (!deletingMaker) return
    try {
      await deleteMaker.mutateAsync(deletingMaker.id)
      toast.success('ลบ Maker สำเร็จ')
      setDeletingMaker(null)
    } catch {
      toast.error('ไม่สามารถลบได้ อาจมีวิดีโอที่ใช้งานอยู่')
    }
  }

  const openEdit = (maker: Maker) => {
    setFormName(maker.name)
    setEditingMaker(maker)
  }

  const totalPages = data?.meta.totalPages || 1
  const total = data?.meta.total || 0

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 'ellipsis', totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, 'ellipsis', page, 'ellipsis', totalPages)
      }
    }
    return pages
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Makers</h1>
          <p className="text-muted-foreground">จัดการข้อมูล Makers</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่ม Maker
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricItem
          label="Maker ทั้งหมด"
          value={`${total.toLocaleString()} รายการ`}
          icon={<Factory className="h-3 w-3" />}
          isLoading={isLoading}
        />
        <MetricItem
          label="หน้าปัจจุบัน"
          value={`${page} / ${totalPages}`}
          isLoading={isLoading}
        />
        <MetricItem
          label="แสดงผล"
          value={`${data?.data.length || 0} รายการ`}
          isLoading={isLoading}
        />
      </div>

      <Separator />

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อ..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[40%]">ชื่อ</TableHead>
              <TableHead className="w-[30%]">Slug</TableHead>
              <TableHead className="w-[15%] text-right">จำนวนวิดีโอ</TableHead>
              <TableHead className="w-[15%] text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Factory className="h-8 w-8" />
                    <p>ไม่พบข้อมูล Maker</p>
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      เพิ่ม Maker
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((item) => (
                <TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium truncate max-w-0" title={item.name}>
                    {item.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-0">
                    {item.slug}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.videoCount.toLocaleString()}
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
                          <DropdownMenuItem onClick={() => openEdit(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingMaker(item)}
                            disabled={item.videoCount > 0}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => page > 1 && goToPage(page - 1)}
                className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {getPageNumbers().map((p, idx) =>
              p === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === page}
                    onClick={() => goToPage(p)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => page < totalPages && goToPage(page + 1)}
                className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่ม Maker</DialogTitle>
            <DialogDescription>กรอกข้อมูลเพื่อสร้าง Maker ใหม่</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="ชื่อ Maker"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleCreate} disabled={createMaker.isPending}>
              {createMaker.isPending ? 'กำลังสร้าง...' : 'สร้าง'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingMaker} onOpenChange={(open) => !open && setEditingMaker(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไข Maker</DialogTitle>
            <DialogDescription>แก้ไขข้อมูล Maker</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">ชื่อ</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="ชื่อ Maker"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMaker(null)}>
              ยกเลิก
            </Button>
            <Button onClick={handleUpdate} disabled={updateMaker.isPending}>
              {updateMaker.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingMaker} onOpenChange={(open) => !open && setDeletingMaker(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบ "{deletingMaker?.name}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMaker.isPending ? 'กำลังลบ...' : 'ลบ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
