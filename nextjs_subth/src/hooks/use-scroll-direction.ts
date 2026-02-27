"use client";

import { useState, useEffect } from "react";

/**
 * Hook สำหรับตรวจจับทิศทางการ scroll
 * ใช้กับ Smart Header - ซ่อนเมื่อ scroll ลง, แสดงเมื่อ scroll ขึ้น
 */
export function useScrollDirection(threshold = 10) {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // ถ้า scroll ใกล้ top ให้แสดง header เสมอ
      if (currentScrollY < 50) {
        setScrollDirection("up");
        setLastScrollY(currentScrollY);
        return;
      }

      // ตรวจสอบทิศทางโดยใช้ threshold เพื่อลด jitter
      const diff = currentScrollY - lastScrollY;

      if (Math.abs(diff) < threshold) {
        return;
      }

      if (diff > 0) {
        setScrollDirection("down");
      } else {
        setScrollDirection("up");
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY, threshold]);

  return scrollDirection;
}
