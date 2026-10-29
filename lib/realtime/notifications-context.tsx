"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { getWsBaseUrl } from "@/lib/api/church-api";
import { playNotificationChime } from "@/lib/utils/audio-chime";

export type RealtimeNotification = {
  id: string;
  inquiryId: string;
  inquiryType: "contact" | "visitor" | "prayer" | string;
  title: string;
  senderName: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export type RealtimeInquiryCreated = {
  id: string;
  type: "contact" | "visitor" | "prayer";
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: "new" | "in_progress" | "resolved";
  createdAt: string;
};

export type RealtimeStatusChanged = {
  id: string;
  type: string;
  status: "new" | "in_progress" | "resolved";
  previousStatus: string;
  updatedAt: string;
};

export type RealtimeReplyCreated = {
  id: string;
  type: string;
  reply: string;
  repliedAt: string;
  status: "new" | "in_progress" | "resolved";
};

type ToastAlert = {
  id: string;
  title: string;
  senderName: string;
  message: string;
  inquiryType: string;
  inquiryId: string;
};

interface RealtimeContextValue {
  connected: boolean;
  notifications: RealtimeNotification[];
  unreadCount: number;
  activeToast: ToastAlert | null;
  dismissToast: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  // Subscribers for inquiry managers
  onInquiryCreated: (listener: (data: RealtimeInquiryCreated) => void) => () => void;
  onStatusChanged: (listener: (data: RealtimeStatusChanged) => void) => () => void;
  onReplyCreated: (listener: (data: RealtimeReplyCreated) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const STORAGE_KEY = "ingata_admin_notifications_v1";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 30);
        }
      }
    } catch {
      // Ignore
    }
    return [];
  });
  const [activeToast, setActiveToast] = useState<ToastAlert | null>(null);

  // Event listener registry for inquiry views
  const createdListeners = useRef<Set<(data: RealtimeInquiryCreated) => void>>(new Set());
  const statusListeners = useRef<Set<(data: RealtimeStatusChanged) => void>>(new Set());
  const replyListeners = useRef<Set<(data: RealtimeReplyCreated) => void>>(new Set());

  // Persist notifications to storage
  const persistNotifications = useCallback((items: RealtimeNotification[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 30)));
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    let socket: Socket | null = null;
    let toastTimer: ReturnType<typeof setTimeout> | null = null;

    try {
      const wsUrl = getWsBaseUrl();
      socket = io(wsUrl, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      socket.on("connect", () => {
        setConnected(true);
      });

      socket.on("disconnect", () => {
        setConnected(false);
      });

      socket.on("inquiry.created", (data: RealtimeInquiryCreated) => {
        // 1. Play audio chime
        playNotificationChime();

        // 2. Trigger floating toast alert
        if (toastTimer) clearTimeout(toastTimer);
        const toastItem: ToastAlert = {
          id: data.id,
          title:
            data.type === "prayer"
              ? "New Prayer Request"
              : data.type === "visitor"
              ? "New Visitor Inquiry"
              : "New Contact Message",
          senderName: data.name,
          message: data.message.length > 120 ? `${data.message.slice(0, 117)}...` : data.message,
          inquiryType: data.type,
          inquiryId: data.id,
        };
        setActiveToast(toastItem);
        toastTimer = setTimeout(() => {
          setActiveToast(null);
        }, 6000);

        // 3. Notify listeners
        createdListeners.current.forEach((fn) => {
          try {
            fn(data);
          } catch (e) {
            console.error("Error in inquiry.created listener", e);
          }
        });
      });

      socket.on("notification.created", (item: RealtimeNotification) => {
        setNotifications((prev) => {
          // Deduplicate by id
          if (prev.some((n) => n.id === item.id)) return prev;
          const updated = [item, ...prev].slice(0, 30);
          persistNotifications(updated);
          return updated;
        });
      });

      socket.on("inquiry.status_changed", (data: RealtimeStatusChanged) => {
        statusListeners.current.forEach((fn) => {
          try {
            fn(data);
          } catch (e) {
            console.error("Error in inquiry.status_changed listener", e);
          }
        });
      });

      socket.on("inquiry.reply_created", (data: RealtimeReplyCreated) => {
        replyListeners.current.forEach((fn) => {
          try {
            fn(data);
          } catch (e) {
            console.error("Error in inquiry.reply_created listener", e);
          }
        });
      });
    } catch (err) {
      console.warn("WebSocket connection init error", err);
    }

    return () => {
      if (toastTimer) clearTimeout(toastTimer);
      if (socket) {
        socket.disconnect();
      }
    };
  }, [persistNotifications]);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        persistNotifications(updated);
        return updated;
      });
    },
    [persistNotifications],
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      persistNotifications(updated);
      return updated;
    });
  }, [persistNotifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    persistNotifications([]);
  }, [persistNotifications]);

  const onInquiryCreated = useCallback((listener: (data: RealtimeInquiryCreated) => void) => {
    createdListeners.current.add(listener);
    return () => {
      createdListeners.current.delete(listener);
    };
  }, []);

  const onStatusChanged = useCallback((listener: (data: RealtimeStatusChanged) => void) => {
    statusListeners.current.add(listener);
    return () => {
      statusListeners.current.delete(listener);
    };
  }, []);

  const onReplyCreated = useCallback((listener: (data: RealtimeReplyCreated) => void) => {
    replyListeners.current.add(listener);
    return () => {
      replyListeners.current.delete(listener);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <RealtimeContext.Provider
      value={{
        connected,
        notifications,
        unreadCount,
        activeToast,
        dismissToast,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        onInquiryCreated,
        onStatusChanged,
        onReplyCreated,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return ctx;
}

