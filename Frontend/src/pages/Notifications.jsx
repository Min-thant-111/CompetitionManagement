import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, XCircle, Clock, Trophy, UserPlus, AlertCircle, FileText, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

const mapType = (t) => {
  switch (t) {
    case "ACHIEVEMENT_EARNED":
      return { type: "achievement", status: "approved" };
    case "ATTENDANCE_RECOVERY_APPROVAL":
      return { type: "achievement", status: "approved" };
    case "REJECTION":
      return { type: "achievement", status: "rejected" };
    case "ROLLBACK":
      return { type: "achievement", status: "pending" };
    case "EXTERNAL_PARTICIPATION_SUBMITTED":
      return { type: "approval" };
    case "TEAM_INVITATION":
    case "TEAM_CONFIRMATION":
      return { type: "team" };
    case "SUBMISSION_SUCCESS":
      return { type: "submission" };
    case "COMPETITION_CREATED":
      return { type: "deadline" };
    default:
      return { type: "system" };
  }
};

const notificationIcons = {
  achievement: Trophy,
  approval: CheckCircle2,
  team: UserPlus,
  deadline: AlertCircle,
  submission: FileText,
  system: Bell,
};

const statusIcons = {
  approved: CheckCircle2,
  rejected: XCircle,
  pending: Clock,
};

const statusColors = {
  approved: "text-success",
  rejected: "text-destructive",
  pending: "text-warning",
};

const bgColors = {
  achievement: "bg-success/10",
  approval: "bg-secondary/10",
  team: "bg-secondary/10",
  deadline: "bg-warning/10",
  submission: "bg-info/10",
  system: "bg-muted",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const role = typeof window !== "undefined" ? (localStorage.getItem("userRole") || "student") : "student";

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const loadNotifications = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load notifications");
      const data = await res.json().catch(() => []);
      const normalized = (Array.isArray(data) ? data : []).map((n) => {
        const mapped = mapType(n.type);
        return {
          id: n.id,
          type: mapped.type,
          status: mapped.status,
          title: n.title || "Notification",
          message: n.message || "",
          read: !!n.read || !!n.isRead,
          time: n.createdAt ? new Date(n.createdAt).toLocaleString() : "",
        };
      });
      setNotifications(normalized);
    } catch (e) {
      toast.error(e.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    const token = localStorage.getItem("userToken");
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {}
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const token = localStorage.getItem("userToken");
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {}
  };

  const renderIcon = (n) => {
    if (n.type === "achievement" && n.status) {
      const Icon = statusIcons[n.status] || Bell;
      return <Icon className={cn("w-4 h-4", statusColors[n.status])} />;
    }
    const Icon = notificationIcons[n.type] || Bell;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <AppLayout role={role}>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadNotifications} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button size="sm" onClick={markAllAsRead} disabled={notifications.length === 0 || unreadCount === 0}>
              Mark all read
            </Button>
          </div>
        </div>

        <div className="card-static p-0 overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  className={cn(
                    "w-full text-left p-4 hover:bg-muted/40 transition-colors",
                    !n.read && "bg-secondary/5"
                  )}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0", bgColors[n.type] || "bg-muted")}>
                      {renderIcon(n)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm font-medium truncate", n.read ? "text-muted-foreground" : "text-foreground")}>
                          {n.title}
                        </p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {n.message}
                      </p>
                      {n.time && (
                        <p className="text-xs text-muted-foreground/70 mt-1">{n.time}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
