/**
 * English routes layout
 * เป็น wrapper สำหรับ routes ภาษาอังกฤษทั้งหมด
 * - /en/member/* ใช้ member/layout.tsx (มี auth check)
 * - /en/login, /en/reels จะเป็น public routes (สร้างทีหลัง)
 */
export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
