import { Bell, Trophy, Users, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const typeIcons = {
  competition: Trophy,
  team: Users,
  deadline: Calendar,
  alert: AlertCircle,
  default: Bell,
};

const typeStyles = {
  competition: "bg-secondary/10 text-secondary",
  team: "bg-info/10 text-info",
  deadline: "bg-warning/10 text-warning",
  alert: "bg-destructive/10 text-destructive",
  default: "bg-muted text-muted-foreground",
};

// Route mapping for notification types
const getRouteForNotification = (notification) => {
  switch (notification.type) {
    case "competition":
      return "/competitions";
    case "team":
      return "/teams";
    case "deadline":
      return "/submissions";
    case "alert":
      return "/submissions";
    default:
      return "/";
  }
};

export function NotificationItem({ notification }) {
  const navigate = useNavigate();
  const { type, message, time, unread } = notification;
  const Icon = typeIcons[type] || typeIcons.default;

  const handleClick = () => {
    const route = getRouteForNotification(notification);
    navigate(route);
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer",
        unread ? "bg-accent/50" : "hover:bg-muted/50"
      )}
      onClick={handleClick}
    >
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", typeStyles[type])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", unread ? "font-medium text-foreground" : "text-muted-foreground")}>
          {message}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
      </div>
      {unread && (
        <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-2" />
      )}
    </div>
  );
}
