import { cn } from "@/lib/utils";
import { AlertTriangle, Bell, Tag } from "lucide-react";

interface AnnouncementCardProps {
  title: string;
  content: string;
  timestamp: string;
  type: "warning" | "info" | "promo";
}

export function AnnouncementCard({
  title,
  content,
  timestamp,
  type = "info",
}: AnnouncementCardProps) {
  const getTypeStyles = () => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-100",
          icon: <AlertTriangle className="text-yellow-400" />,
          titleColor: "text-yellow-800",
          contentColor: "text-yellow-700",
          timestampColor: "text-yellow-600",
        };
      case "promo":
        return {
          bg: "bg-green-50",
          border: "border-green-100",
          icon: <Tag className="text-green-400" />,
          titleColor: "text-green-800",
          contentColor: "text-green-700",
          timestampColor: "text-green-600",
        };
      case "info":
      default:
        return {
          bg: "bg-primary-50",
          border: "border-primary-100",
          icon: <Bell className="text-primary-400" />,
          titleColor: "text-primary-800",
          contentColor: "text-primary-700",
          timestampColor: "text-primary-600",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={cn("p-4 rounded-md border", styles.bg, styles.border)}>
      <div className="flex">
        <div className="flex-shrink-0">{styles.icon}</div>
        <div className="ml-3">
          <h4 className={cn("text-sm font-medium", styles.titleColor)}>
            {title}
          </h4>
          <div className={cn("mt-1 text-sm", styles.contentColor)}>
            <p>{content}</p>
          </div>
          <div className={cn("mt-2 text-xs", styles.timestampColor)}>
            {timestamp}
          </div>
        </div>
      </div>
    </div>
  );
}
