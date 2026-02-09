// App configuration - ดึงจาก environment variables
export const APP_CONFIG = {
  title: import.meta.env.VITE_APP_TITLE || 'Application',
  description: import.meta.env.VITE_APP_DESCRIPTION || '',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  cdnUrl: import.meta.env.VITE_CDN_URL || 'https://files.subth.com',
} as const

// Helper function สำหรับสร้าง CDN URL
export function getCdnUrl(path: string | undefined | null): string {
  if (!path) return ''
  // ถ้าเป็น full URL แล้วก็ return เลย
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // ต่อ CDN URL ข้างหน้า
  return `${APP_CONFIG.cdnUrl}${path.startsWith('/') ? '' : '/'}${path}`
}
