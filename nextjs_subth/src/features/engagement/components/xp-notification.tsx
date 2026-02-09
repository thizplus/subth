"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface XPNotification {
  id: string;
  amount: number;
  source: string;
  leveledUp?: boolean;
  newLevel?: number;
}

interface XPNotificationProviderProps {
  children: React.ReactNode;
}

// Global notification queue
let notificationListeners: ((notification: XPNotification) => void)[] = [];

// Call this to show XP notification
export function showXPNotification(notification: Omit<XPNotification, "id">) {
  const id = Math.random().toString(36).substring(7);
  notificationListeners.forEach((listener) =>
    listener({ ...notification, id })
  );
}

export function XPNotificationProvider({ children }: XPNotificationProviderProps) {
  const [notifications, setNotifications] = useState<XPNotification[]>([]);

  useEffect(() => {
    const listener = (notification: XPNotification) => {
      setNotifications((prev) => [...prev, notification]);
      // Auto remove after animation
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 2500);
    };

    notificationListeners.push(listener);
    return () => {
      notificationListeners = notificationListeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <>
      {children}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none flex flex-col items-center gap-2">
        {notifications.map((notification) => (
          <XPNotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </>
  );
}

function XPNotificationItem({ notification }: { notification: XPNotification }) {
  const sourceLabels: Record<string, string> = {
    like: "Like",
    comment: "Comment",
    view: "Watch",
    registration: "Welcome!",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full",
        "bg-gradient-to-r from-yellow-500/90 to-amber-500/90",
        "text-white font-semibold shadow-lg",
        "animate-xp-popup"
      )}
    >
      <Sparkles className="h-4 w-4 animate-pulse" />
      <span className="text-sm">+{notification.amount} XP</span>
      <span className="text-xs opacity-80">
        {sourceLabels[notification.source] || notification.source}
      </span>
      {notification.leveledUp && (
        <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
          Level Up! Lv.{notification.newLevel}
        </span>
      )}
    </div>
  );
}
