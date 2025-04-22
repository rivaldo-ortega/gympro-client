import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRelativeTimeString } from "@/lib/utils";
import { Dumbbell } from "lucide-react";

interface ActivityItemProps {
  title: string;
  timestamp: string | Date;
  avatarUrl?: string;
  avatarFallback?: string;
  isUserActivity?: boolean;
}

export function ActivityItem({
  title,
  timestamp,
  avatarUrl,
  avatarFallback,
  isUserActivity = false
}: ActivityItemProps) {
  return (
    <li className="py-4">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {!isUserActivity ? (
            <Avatar>
              {/* Comentado para usar siempre iniciales */}
              {/* <AvatarImage src={avatarUrl} alt="User profile" /> */}
              <AvatarFallback>{avatarFallback || "U"}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-primary-600" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {title}
          </p>
          <p className="text-sm text-gray-500">
            {getRelativeTimeString(timestamp)}
          </p>
        </div>
      </div>
    </li>
  );
}
