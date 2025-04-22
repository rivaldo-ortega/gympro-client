import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string | number;
  changeType?: "increase" | "decrease";
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeType = "increase",
  icon: Icon,
  iconBgColor = "bg-primary-100",
  iconColor = "text-primary-600"
}: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            <Icon className={cn("text-xl", iconColor)} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {label}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {change && (
                  <div 
                    className={cn(
                      "ml-2 flex items-baseline text-sm font-semibold", 
                      changeType === "increase" ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {changeType === "increase" ? (
                      <svg 
                        className="self-center flex-shrink-0 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path 
                          fillRule="evenodd"
                          d="M12 7a1 1 0 01-1 1H9v9a1 1 0 01-2 0V8H5a1 1 0 110-2h12a1 1 0 01.707 1.707l-5 5a1 1 0 01-1.414 0l-5-5A1 1 0 0112 7z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg 
                        className="self-center flex-shrink-0 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path 
                          fillRule="evenodd"
                          d="M12 13a1 1 0 01-1-1V4a1 1 0 00-1-1H4a1 1 0 110-2h12a1 1 0 01.707 1.707l-5 5a1 1 0 01-1.414 0l-5-5A1 1 0 0112 13z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span className="sr-only">
                      {changeType === "increase" ? "Increased" : "Decreased"} by
                    </span>
                    {change}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
