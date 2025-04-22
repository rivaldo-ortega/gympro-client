import { Link, useLocation } from "wouter";
import { cn, getInitials } from "@/lib/utils";
import {
  Home,
  Users,
  CreditCard,
  Calendar,
  UserCog,
  Dumbbell,
  BarChart2,
  Bell,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { t } from "@/lib/i18n";
import { isFeatureEnabled } from "@/lib/feature-flags";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, href, active }: SidebarItemProps) => {
  return (
    <Link href={href}>
      <div
        className={cn(
          "group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
          active
            ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
            : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
        )}
      >
        <div className={cn("mr-3", active ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400")}>
          {icon}
        </div>
        {label}
      </div>
    </Link>
  );
};

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isActive = (path: string) => {
    if (path === "/dashboard" && location === "/dashboard") return true;
    if (path !== "/dashboard" && location.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 border-r bg-background dark:bg-gray-900">
      <div className="px-6 py-6 flex items-center border-b">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <h1 className="ml-3 text-xl font-semibold">{t('appName')}</h1>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto pt-5 pb-4">
        <div className="px-3 space-y-1">
          <SidebarItem icon={<Home size={18} />} label={t('dashboard')} href="/dashboard" active={isActive("/dashboard")} />
          <SidebarItem icon={<Users size={18} />} label={t('members')} href="/members" active={isActive("/members")} />
          <SidebarItem
            icon={<CreditCard size={18} />}
            label={t('membershipPlans')}
            href="/membership-plans"
            active={isActive("/membership-plans")}
          />
          {isFeatureEnabled('classes') && (
            <SidebarItem
              icon={<Calendar size={18} />}
              label={t('classes')}
              href="/classes"
              active={isActive("/classes")}
            />
          )}
          {isFeatureEnabled('trainers') && (
            <SidebarItem
              icon={<UserCog size={18} />}
              label={t('trainers')}
              href="/trainers"
              active={isActive("/trainers")}
            />
          )}
          {isFeatureEnabled('equipment') && (
            <SidebarItem
              icon={<Dumbbell size={18} />}
              label={t('equipment')}
              href="/equipment"
              active={isActive("/equipment")}
            />
          )}
          <SidebarItem
            icon={<BarChart2 size={18} />}
            label={t('reports')}
            href="/reports"
            active={isActive("/reports")}
          />
          {isFeatureEnabled('announcements') && (
            <SidebarItem
              icon={<Bell size={18} />}
              label={t('announcements')}
              href="/announcements"
              active={isActive("/announcements")}
            />
          )}
          <SidebarItem
            icon={<CreditCard size={18} />}
            label={t('payments')}
            href="/payments"
            active={isActive("/payments")}
          />
        </div>
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl || ""} alt={user?.name || t('user')} />
            <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium">{user?.name || t('user')}</p>
            <p className="text-xs text-muted-foreground">{user?.role || t('staff')}</p>
          </div>
          <Button 
            variant="ghost" 
            className="ml-auto"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            title={t('logout')}
            aria-label={t('logout')}
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </aside>
  );
}
