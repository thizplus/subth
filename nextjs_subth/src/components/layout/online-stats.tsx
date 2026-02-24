"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

interface OnlineStatsProps {
  locale?: "th" | "en";
}

/**
 * แสดงจำนวนสมาชิกและคนออนไลน์ (fake แต่ดู realistic)
 * - สมาชิก: base + วันที่ (เพิ่มทุกวัน)
 * - ออนไลน์: สุ่มในช่วง และเปลี่ยนทุก 30 วินาที
 */
export function OnlineStats({ locale = "th" }: OnlineStatsProps) {
  const [online, setOnline] = useState(0);
  const [members, setMembers] = useState(0);

  useEffect(() => {
    // คำนวณจำนวนสมาชิก (base + วันที่ผ่านไปจาก launch date)
    const launchDate = new Date("2024-01-01");
    const today = new Date();
    const daysPassed = Math.floor(
      (today.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    // เริ่มที่ 5000 + เพิ่มวันละ ~5-8 คน
    const baseMembers = 5000;
    const growthPerDay = 6;
    const totalMembers = baseMembers + daysPassed * growthPerDay;
    setMembers(totalMembers);

    // สุ่มจำนวนออนไลน์ในช่วง 8-15% ของสมาชิก
    const generateOnline = () => {
      const minPercent = 0.08;
      const maxPercent = 0.15;
      const percent = minPercent + Math.random() * (maxPercent - minPercent);
      const onlineCount = Math.floor(totalMembers * percent);
      // เพิ่มความ random เล็กน้อย
      const variation = Math.floor(Math.random() * 100) - 50;
      setOnline(Math.max(100, onlineCount + variation));
    };

    generateOnline();

    // อัพเดททุก 30 วินาที
    const interval = setInterval(generateOnline, 30000);
    return () => clearInterval(interval);
  }, []);

  const membersText = locale === "th" ? "สมาชิก" : "Members";
  const onlineText = locale === "th" ? "ออนไลน์" : "Online";

  if (members === 0) return null;

  return (
    <div className="flex flex-col text-xs leading-tight">
      {/* บรรทัดบน: จำนวนสมาชิก */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        <span>
          {membersText}{" "}
          <span className="font-semibold text-foreground">
            {members.toLocaleString()}
          </span>{" "}
          {locale === "th" ? "คน" : ""}
        </span>
      </div>

      {/* บรรทัดล่าง: ออนไลน์ */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {/* Animated green dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span>
          {onlineText}{" "}
          <span className="font-semibold text-success">
            {online.toLocaleString()}
          </span>{" "}
          {locale === "th" ? "คน" : ""}
        </span>
      </div>
    </div>
  );
}
