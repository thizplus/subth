// Status enums with labels and semantic class names

export const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type StatusType = (typeof STATUS)[keyof typeof STATUS]

export const STATUS_LABELS: Record<StatusType, string> = {
  pending: 'รออนุมัติ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ปฏิเสธ',
  active: 'ใช้งาน',
  inactive: 'ไม่ใช้งาน',
}

export const STATUS_STYLES: Record<StatusType, string> = {
  pending: 'status-pending',
  approved: 'status-success',
  rejected: 'status-danger',
  active: 'status-success',
  inactive: 'status-muted',
}

// User roles
export const ROLE = {
  USER: 'user',
  ADMIN: 'admin',
} as const

export type RoleType = (typeof ROLE)[keyof typeof ROLE]

export const ROLE_LABELS: Record<RoleType, string> = {
  user: 'ผู้ใช้ทั่วไป',
  admin: 'ผู้ดูแลระบบ',
}

export const ROLE_STYLES: Record<RoleType, string> = {
  user: 'status-info',
  admin: 'status-danger',
}
