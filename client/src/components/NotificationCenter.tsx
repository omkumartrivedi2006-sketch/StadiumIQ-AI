import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Bell, Trash2, Check, Megaphone, AlertTriangle, Ticket, Info, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";
import { socketService } from "@/services/socket";

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: "announcement" | "alert" | "ticket" | "sos" | "general";
  readStatus: boolean;
  createdAt: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get("/notifications");
      if (response.data?.success && response.data?.data?.docs) {
        const docs = response.data.data.docs;
        setNotifications(docs);
        setUnreadCount(docs.filter((n: any) => !n.readStatus).length);
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Socket.IO event handler for real-time notifications
    const handleNewNotification = (newNotif: NotificationItem) => {
      setNotifications((prev) => {
        // Prevent duplicate append
        if (prev.some((n) => n._id === newNotif._id)) return prev;
        return [newNotif, ...prev];
      });
      if (!newNotif.readStatus) {
        setUnreadCount((prev) => prev + 1);
      }
      // Display visual toast alert
      toast.info(newNotif.title, {
        description: newNotif.message,
        duration: 5000,
      });
    };

    socketService.on("new-notification", handleNewNotification);

    // Poll for notifications every 30 seconds for live feel/recovery
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => {
      socketService.off("new-notification", handleNewNotification);
      clearInterval(interval);
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const response = await apiClient.put(`/notifications/${id}`, { readStatus: true });
      if (response.data?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, readStatus: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      toast.error("Failed to mark notification as read.");
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.readStatus);
    if (unread.length === 0) return;
    
    setLoading(true);
    try {
      await Promise.all(
        unread.map((n) => apiClient.put(`/notifications/${n._id}`, { readStatus: true }))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read.");
    } catch (e) {
      toast.error("Failed to mark all as read.");
    } finally {
      setLoading(false);
    }
  };

  const deleteNotif = async (id: string) => {
    try {
      const response = await apiClient.delete(`/notifications/${id}`);
      if (response.data?.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        const deletedNotif = notifications.find((n) => n._id === id);
        if (deletedNotif && !deletedNotif.readStatus) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        toast.success("Notification deleted.");
      }
    } catch (e) {
      toast.error("Failed to delete notification.");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <Megaphone size={16} className="text-indigo-600" />;
      case "alert":
      case "sos":
        return <AlertTriangle size={16} className="text-red-600" />;
      case "ticket":
        return <Ticket size={16} className="text-teal-600" />;
      default:
        return <Info size={16} className="text-slate-600" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const mins = Math.round((Date.now() - new Date(dateStr).getTime()) / (1000 * 60));
    if (mins <= 0) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors btn-press focus:outline-none">
          <Bell size={20} className="text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse-soft">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white border border-slate-200 shadow-xl rounded-lg z-50">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-sm text-slate-800">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={loading}
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-6">
              <Empty className="p-4 md:p-6 bg-slate-50/50 border border-slate-100 rounded-lg">
                <EmptyHeader>
                  <EmptyMedia className="bg-indigo-50 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-1">
                    <Bell size={14} />
                  </EmptyMedia>
                  <EmptyTitle className="text-xs font-semibold text-slate-800">No Notifications</EmptyTitle>
                  <EmptyDescription className="text-[10px] text-slate-500 max-w-[180px] mx-auto mt-0.5 leading-normal">
                    You're all caught up! There are no announcements or alerts at this time.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-3 transition-colors flex gap-3 items-start hover:bg-slate-50 ${
                  !notif.readStatus ? "bg-indigo-50/20" : ""
                }`}
              >
                <div className="p-1.5 rounded-lg bg-slate-100 mt-0.5 flex-shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-1">
                    <span className={`text-xs font-semibold text-slate-900 block truncate ${
                      !notif.readStatus ? "font-bold" : ""
                    }`}>
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 break-words leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex gap-2 justify-end mt-2 pt-1">
                    {!notif.readStatus && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="text-[10px] text-indigo-600 font-semibold hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotif(notif._id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Delete notification"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
